// 婚禮小遊戲排行榜後端
// 貼到Google Sheet的擴充功能→Apps Script，部署為網頁應用程式
// 執行身分:我；存取權:所有人

const SHEET = 'scores';
const MAX_SCORE = 500; // 超過視為異常不收

function sheet_() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) {
    sh = ss.insertSheet(SHEET);
    sh.appendRow(['時間', '暱稱', '分數']);
  }
  return sh;
}

// 每個暱稱只取最高分，回傳前10名
function top_() {
  const rows = sheet_().getDataRange().getValues().slice(1);
  const best = {};
  rows.forEach(r => {
    const name = String(r[1]).replace(/^'/, '');
    const score = Number(r[2]);
    if (!(name in best) || score > best[name]) best[name] = score;
  });
  return Object.keys(best)
    .map(name => ({ name, score: best[name] }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

function out_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  return out_({ top: top_() });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const d = JSON.parse(e.postData.contents);
    let name = String(d.name || '').trim().slice(0, 12);
    const score = Math.floor(Number(d.score));
    if (!name || !(score >= 0 && score <= MAX_SCORE)) return out_({ ok: false, top: top_() });
    if (/^[=+\-@]/.test(name)) name = "'" + name; // 避免被當成公式
    sheet_().appendRow([new Date(), name, score]);
    return out_({ ok: true, top: top_() });
  } finally {
    lock.releaseLock();
  }
}
