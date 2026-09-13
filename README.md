# Jeju Trip 2026 · GitHub Pages / PWA

济州岛 2026-09-24 ~ 2026-09-27 手机旅行手册。

## 项目结构

```text
jeju-trip-2026/
├── index.html
├── styles.css
├── app.js
├── manifest.json
├── sw.js
├── data/
│   └── trip-data.js
├── assets/
│   └── icon.svg
└── README.md
```

## GitHub Pages

Repository Settings → Pages → Build and deployment → Deploy from a branch → `main` / `/ (root)` → Save。

## 修改行程

主要内容都在 `data/trip-data.js`：
- `days`: 每日路线、时间线、餐厅、购物、Plan B
- `prep`: 出境/入境 Checklist
- `shops`: 购物
- `gifts`: 伴手礼
- `sources`: 资料链接

UI 和交互在 `app.js`，样式在 `styles.css`。

## PWA / 离线 / 现场使用

GitHub Pages 上线后，手机浏览器打开一次即可缓存 App 壳和行程数据；Service Worker 会尝试缓存 OpenStreetMap 已访问过的地图瓦片。

注意：完整在线地图和 Naver/Google 跳转仍需要网络；不要把离线缓存当成完整离线地图。


## v4 新增

- 首页 Dashboard：自动识别旅行日期并进入当天行程
- 每个时间线项目支持“已完成”打卡，并保存在手机本地
- 双人返程提醒
- KRW 预算记录：交通 / 餐饮 / 门票体验 / 购物 / 其他
- 攻略融合页与天气 Plan B
- 每个地点继续支持 Naver / Google 一键导航


## v5 现场旅行升级

- 首页双人航班卡：分别显示抵达/返程
- Open-Meteo 实时天气与未来 4 天趋势
- 天气刷新按钮与 Plan B 结合
- 购物现场 Checklist：Ralph Lauren / 包包 / 墨镜 / 济州特色
- 首页分享按钮：优先调用手机原生分享，否则复制链接
- Android 支持时显示“添加到主屏幕”
- 继续保留本地行程打卡、预算、Naver / Google 导航
