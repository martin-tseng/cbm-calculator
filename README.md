# 材積計算器

輸入各品項長寬高(cm)、件數與單件重量，自動計算總體積、才數、材積重、計費重及貨櫃裝載率。

## 使用方式
用瀏覽器開啟index.html，或透過GitHub Pages網址以手機使用。

## 計算邏輯
- CBM=長×寬×高×件數÷1,000,000
- 才數=總體積(cm³)÷(30.3³)
- 空運材積重=總體積(cm³)÷空運除數(預設6000)
- 快遞材積重=總體積(cm³)÷快遞除數(預設5000)
- 計費重=MAX(總實重,材積重)
- 貨櫃裝載率=總CBM÷貨櫃可用容積(20GP約33、40GP約67、40HQ約76)

除數可在頁面下方參數設定調整；貨櫃容積集中在index.html的CONTAINERS常數。

## 版本紀錄
- v1:初版
- v2:自動計算、多品項、計費重、貨櫃裝載率、複製結果、除數可調

## 航線圖(travel/)
從桃園出發的世界航線圖，以城市為單位記錄，依城市所在的行政區上色，可縮放。

- 網址：https://martin-tseng.github.io/cbm-calculator/travel/
- 新增或修改城市：編輯travel/cities.js的CITIES，一個城市一行
- status：visited已去、planned計畫中、wish願望
- 行政區邊界資料：travel/regions.json(Natural Earth一級行政區，已簡化)

## 00929月配息(00929/)
輸入持有股數，計算每月可領配息、下次除息日、即將入帳金額。

- 網址：https://martin-tseng.github.io/cbm-calculator/00929/
- 資料：00929/data.json，由.github/workflows/update-00929.yml每個交易日14:40與20:40執行scripts/update-00929.mjs自動更新
- 股價來源：證交所個股日成交資訊，失敗時改用FinMind
- 配息來源：FinMind股利政策(含發放日)、證交所除權除息預告表；抓不到時保留原資料
- 股數只存在瀏覽器localStorage，不進repo
- 手動更新：GitHub上Actions→更新00929資料→Run workflow
