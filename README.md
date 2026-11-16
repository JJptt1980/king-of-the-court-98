# 單挑之王 98

1 對 1 輪轉單挑（King of the Court）的場邊記分 app。進球留在場上繼續攻，沒進就換人，先拿到目標分數的人贏。專門用來練三重威脅和限制運球下的進攻選擇。

可以直接在手機瀏覽器使用，也可以安裝成 Android app。

## 功能

- **排隊輪替**：自動安排進攻者、防守者和排隊順序。進球的人留下，原本的防守者排到最後；沒進的人排到最後，由防守者上來進攻。
- **規則設定**：
  - 目標分數：7、11、12、15，或自訂
  - 計分：3 分線內 1 分、線外 2 分，或全都 1 分
  - 運球上限：1、2、3 運，或不限
  - 失誤扣 1 分（可選）
- **開球點輪替**：每一球提示開球位置（罰球線頂端／左右肘區，或弧頂／左右 45°）。
- **運球計數**：點一下記一運，到上限提示「收！」。
- **常用名單**：可存多組名單、自訂群組名稱，點一下就帶入。也可以一次貼上整串名字。最多 100 人。
- **戰績**：每場數據（得分、命中率、最長連進、防守成功、失誤）、累積排行榜、歷史比賽。
- **匯出**：每球紀錄可匯出成 CSV，貼到 Excel 或 Google 試算表。
- **離線使用**：網頁版加到主畫面後可以離線開啟；Android 版比賽時螢幕保持常亮。

所有紀錄只存在自己的裝置上（瀏覽器的 localStorage），不會上傳到任何伺服器。

## 使用

- **網頁版**：打開 GitHub Pages 網址，在手機瀏覽器選「加到主畫面」。
- **Android**：到 [Releases](../../releases) 下載 APK 安裝（要允許安裝未知來源的 app）。

## 開發

需要 Node.js 22 以上。打包 Android 還需要 JDK 21 和 Android SDK（裝 Android Studio 即可）。

```bash
npm install
npm run build:web     # 產生 www/（網頁版）
npm run serve         # 在 http://localhost:5178 預覽
npm run build:apk     # 先執行 node scripts/make-emblem.mjs 產生圖示，再產生 android/app/build/outputs/apk/debug/app-debug.apk
```

整個 app 的畫面與邏輯都在 `src/app.html`，`build-web.mjs` 會把它包成可離線的網頁版（加上 manifest 和 service worker），Android 版用 [Capacitor](https://capacitorjs.com/) 包裝同一份網頁。

推送到 `main` 分支後，GitHub Actions 會自動部署網頁版到 GitHub Pages。

## 專案結構

```
src/app.html            畫面與邏輯（單一檔案，90 年代極簡風）
build-web.mjs           產生 www/ 網頁版
android-assets.mjs      產生 Android 圖示與啟動畫面
assets/logo.png         CLUTCH SQUAD 隊徽（所有圖示由此產生）
src/app-classic.html    舊版介面（保留參考）
android/                Capacitor Android 專案
.github/workflows/      GitHub Pages 自動部署
```
