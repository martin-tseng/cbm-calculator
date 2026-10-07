// 航線圖城市資料:新增城市只要在CITIES加一行，存檔後推上GitHub即可
// status: visited已去 / planned計畫中 / wish願望
// airport: 實際降落機場代碼(同一機場可對應多個城市)
// regionName: 選填，區域名稱要改寫時使用
const HOME={city:"桃園",airport:"TPE",lon:121.23,lat:25.08,countryId:"158"};
const CITIES=[
  {city:"首爾",country:"韓國",countryId:"410",airport:"ICN",lon:126.98,lat:37.57,status:"visited",date:"日期待補",note:"細節待補"},
  {city:"大阪",country:"日本",countryId:"392",airport:"KIX",lon:135.50,lat:34.69,status:"planned",date:"日期待定",note:"關西行規劃中"},
  {city:"京都",country:"日本",countryId:"392",airport:"KIX",lon:135.77,lat:35.01,status:"planned",date:"日期待定",note:"關西行規劃中"},
  {city:"巴黎",country:"法國",countryId:"250",airport:"CDG",lon:2.35,lat:48.86,status:"wish",date:"範例",note:"願望清單範例"},
  {city:"雷克雅維克",country:"冰島",countryId:"352",airport:"KEF",lon:-21.94,lat:64.15,regionName:"雷克雅維克",status:"wish",date:"範例",note:"願望清單範例"},
  {city:"奧克蘭",country:"紐西蘭",countryId:"554",airport:"AKL",lon:174.76,lat:-36.85,status:"wish",date:"範例",note:"願望清單範例"}
];
