// 抓00929最新收盤價與配息資料，寫入00929/data.json
// 由.github/workflows/update-00929.yml排程執行(Node 20以上，內建fetch)
// 任一來源失敗時保留data.json原有資料，不會清空
import fs from 'node:fs';

const CODE = '00929';
const FILE = new URL('../00929/data.json', import.meta.url);
const UA = { 'User-Agent': 'Mozilla/5.0 (cbm-calculator 00929 updater)' };

const old = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const log = [];

const pad = n => String(n).padStart(2, '0');
const tpeNow = new Date(Date.now() + 8 * 3600e3);
const ymd = d => `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}`;
// 民國日期115/10/12或1151012轉成2026-10-12
function rocToIso(s) {
  s = String(s).trim().replace(/年|月/g, '/').replace(/日/g, '');
  let y, m, d;
  if (s.includes('/')) [y, m, d] = s.split('/');
  else { y = s.slice(0, s.length - 4); m = s.slice(-4, -2); d = s.slice(-2); }
  y = Number(y); if (y < 1911) y += 1911;
  return `${y}-${pad(m)}-${pad(d)}`;
}
const num = s => Number(String(s).replace(/,/g, ''));

async function getJson(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

// 1.收盤價：證交所個股日成交資訊，當月沒資料就查上月
async function priceFromTwse() {
  for (const back of [0, 1]) {
    const d = new Date(Date.UTC(tpeNow.getUTCFullYear(), tpeNow.getUTCMonth() - back, 1));
    const j = await getJson(`https://www.twse.com.tw/rwd/zh/afterTrading/STOCK_DAY?date=${ymd(d)}&stockNo=${CODE}&response=json`);
    if (j.stat === 'OK' && j.data?.length) {
      const row = j.data[j.data.length - 1];
      return { price: num(row[6]), date: rocToIso(row[0]), source: '臺灣證券交易所' };
    }
  }
  throw new Error('無資料');
}
async function priceFromFinMind() {
  const start = new Date(tpeNow.getTime() - 20 * 86400e3).toISOString().slice(0, 10);
  const j = await getJson(`https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockPrice&data_id=${CODE}&start_date=${start}`);
  const row = j.data?.at(-1);
  if (!row) throw new Error('無資料');
  return { price: row.close, date: row.date, source: 'FinMind' };
}

// 2.配息：FinMind股利政策(含發放日)+證交所除權除息預告表(最新公告)
async function divFromFinMind() {
  const j = await getJson(`https://api.finmindtrade.com/api/v4/data?dataset=TaiwanStockDividend&data_id=${CODE}&start_date=2025-01-01`);
  return (j.data || [])
    .filter(r => r.CashExDividendTradingDate && num(r.CashEarningsDistribution) + num(r.CashStatutorySurplus || 0) > 0)
    .map(r => ({
      exDate: r.CashExDividendTradingDate,
      payDate: r.CashDividendPaymentDate || null,
      amount: Math.round((num(r.CashEarningsDistribution) + num(r.CashStatutorySurplus || 0)) * 1e4) / 1e4,
      source: 'FinMind'
    }));
}
async function divFromTwse() {
  const j = await getJson('https://www.twse.com.tw/rwd/zh/exRight/TWT48U?response=json');
  if (j.stat !== 'OK') throw new Error(j.stat || '無資料');
  const f = j.fields || [];
  const iDate = f.findIndex(x => x.includes('除權除息日期'));
  const iCode = f.findIndex(x => x.includes('股票代號'));
  const iCash = f.findIndex(x => x.includes('現金股利'));
  return (j.data || [])
    .filter(r => String(r[iCode]).trim() === CODE)
    .map(r => ({ exDate: rocToIso(r[iDate]), payDate: null, amount: num(r[iCash]), source: '臺灣證券交易所除息預告' }));
}

const out = { ...old };

for (const [name, fn] of [['TWSE股價', priceFromTwse], ['FinMind股價', priceFromFinMind]]) {
  try {
    const p = await fn();
    if (p.price > 0) { out.price = p; log.push(`${name}:${p.date} ${p.price}`); break; }
  } catch (e) { log.push(`${name}失敗:${e.message}`); }
}

const byEx = new Map(old.dividends.map(d => [d.exDate, d]));
for (const [name, fn] of [['FinMind配息', divFromFinMind], ['TWSE除息預告', divFromTwse]]) {
  try {
    const rows = await fn();
    log.push(`${name}:${rows.length}筆`);
    for (const r of rows) {
      if (!(r.amount > 0)) continue;
      const prev = byEx.get(r.exDate);
      byEx.set(r.exDate, {
        exDate: r.exDate,
        payDate: r.payDate || prev?.payDate || null,
        amount: r.amount,
        source: prev && prev.amount === r.amount && !r.payDate ? prev.source : r.source
      });
    }
  } catch (e) { log.push(`${name}失敗:${e.message}`); }
}
out.dividends = [...byEx.values()].sort((a, b) => a.exDate.localeCompare(b.exDate));
console.log(log.join('\n'));
// 股價或配息有變動才寫檔，避免每天產生空提交
const same = JSON.stringify([out.price, out.dividends]) === JSON.stringify([old.price, old.dividends]);
if (same) { console.log('資料無變動'); process.exit(0); }
out.updatedAt = new Date().toISOString();
out.log = log;
fs.writeFileSync(FILE, JSON.stringify(out, null, 2) + '\n');
