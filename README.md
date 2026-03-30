# 📞 組織電話簿系統（Organization Directory System）

## 一、專案簡介

本專案是一個提供小型團隊使用的「組織電話簿系統」，用於管理具有階層結構的單位資訊（例如：總局 → 分局 → 派出所），並提供快速查詢、資料編輯與歷史紀錄追蹤功能。

系統設計目標為：

* 輕量化（無需登入機制）
* 易於維護（資料集中管理）
* 可追蹤（完整修改紀錄）
* 易於查詢（支援關鍵字搜尋）
* 支援行動裝置（PWA，可加入 iOS 主畫面使用）

---

## 二、技術選型

| 層級 | 技術 | 說明 |
|------|------|------|
| 前端 | React + Vite（PWA） | 支援加入主畫面，外觀與體驗接近原生 App |
| 後端 | Python + FastAPI | 輕量、高效能的 REST API 框架 |
| 資料庫 | PostgreSQL | 關聯式資料庫，支援全文搜尋擴充 |
| 前端部署 | Vercel | 自動部署，免費方案 |
| 後端部署 | Railway | FastAPI + PostgreSQL 一體托管，免費額度 |

---

## 三、系統架構

```plaintext
iOS / Android / 桌面瀏覽器
  PWA（React + Vite）
  ↓ HTTPS / fetch
Backend API（FastAPI on Railway）
  ↓
Database（PostgreSQL on Railway）
```

> PWA 說明：使用者可透過 Safari「加入主畫面」，將本系統安裝為類原生 App，無需上架 App Store。

⚠️ PWA 限制（iOS）：

* 無法完整背景執行
* Push Notification 支援有限（需 iOS 16.4+）
* Service Worker 快取需額外測試

👉 本系統僅使用基本離線快取功能

---

## 四、核心功能

### 1️⃣ 組織階層管理

* 支援多層級組織架構（無層級限制）
* 每個單位可包含子單位
* 以樹狀結構呈現（Tree Structure）

---

### 2️⃣ 電話簿查詢

* 瀏覽各層級單位
* 顯示單位名稱、四種電話、地址、備註
* 支援點擊撥號（`tel:`，自動電話 / 警用電話 / 鐵路電話）
* 傳真不支援點擊撥號

---

### 3️⃣ 搜尋功能

支援以下查詢方式：

* 單位名稱（模糊搜尋）
* 電話號碼（四種電話皆可部分比對）
* 備註內容搜尋
* 關鍵字搜尋

搜尋結果包含：

* 單位名稱
* 所屬路徑（例：鐵路警察局 / 台北分局 / 南港派出所）

排序規則：

1. 名稱完全匹配
2. 名稱部分匹配
3. 電話或備註匹配

---

### 4️⃣ 資料編輯

* 可修改單位資訊（名稱、四種電話、地址、備註）
* 無需登入，但需輸入暱稱
* 支援軟刪除（使用 `deleted_at`）

---

### 5️⃣ 修改紀錄（Audit Log）

* 記錄所有資料變更（新增 / 修改 / 刪除）
* 包含：

  * 修改欄位
  * 修改前 / 修改後
  * 修改人
  * 修改時間

---

## 五、資料庫設計

### 1. organizations

| 欄位名稱 | 類型 | 說明 |
|----------|------|------|
| id | INT | 主鍵 |
| name | VARCHAR | 單位名稱 |
| parent_id | INT | 上層單位（NULL 表示根層級）|
| phone_auto | VARCHAR | 自動電話（可選）|
| phone_police | VARCHAR | 警用電話（可選）|
| phone_railway | VARCHAR | 鐵路電話（可選）|
| phone_fax | VARCHAR | 傳真電話（可選）|
| address | VARCHAR | 地址（可選）|
| note | TEXT | 備註（可選）|
| created_at | TIMESTAMP | 建立時間 |
| updated_at | TIMESTAMP | 更新時間 |
| deleted_at | TIMESTAMP | 軟刪除時間（NULL 表示未刪除）|

---

### 2. organization_logs

| 欄位名稱 | 類型 | 說明 |
|----------|------|------|
| id | INT | 主鍵 |
| organization_id | INT | 對應單位 |
| action | VARCHAR | 動作（create / update / delete）|
| field_changed | VARCHAR | 修改欄位（例：phone_auto、phone_fax）|
| old_value | TEXT | 舊值 |
| new_value | TEXT | 新值 |
| changed_by | VARCHAR | 修改人 |
| changed_at | TIMESTAMP | 修改時間 |

---

## 六、資料一致性設計

所有寫入操作需在同一個 Transaction 中完成：

1. 更新 organizations
2. 寫入 organization_logs

👉 避免資料更新成功但未留下紀錄

---

## 七、階層查詢設計

採用 self-referencing（parent_id）結構。

完整路徑查詢方式：

* 使用 Recursive CTE（`WITH RECURSIVE`）
* 或在後端組裝

未來可優化為：

* Materialized Path
* Closure Table

---

## 八、索引設計

建議建立以下索引：

* `organizations(name)`
* `organizations(phone_auto)`
* `organizations(phone_police)`
* `organizations(phone_railway)`
* `organizations(phone_fax)`
* `organizations(parent_id)`
* `organizations(deleted_at)`

進階：

* Full Text Search（GIN index）

---

## 九、查詢規則（軟刪除）

所有查詢需加上：

```sql
WHERE deleted_at IS NULL
```

---

## 十、API 設計

### 取得子單位

```
GET /organizations?parent_id={id}
```

---

### 搜尋

```
GET /search?q=keyword&limit=20&offset=0
```

搜尋範圍：name、phone_auto、phone_police、phone_railway、phone_fax、note

```sql
WHERE (
  name ILIKE '%keyword%'
  OR phone_auto ILIKE '%keyword%'
  OR phone_police ILIKE '%keyword%'
  OR phone_railway ILIKE '%keyword%'
  OR phone_fax ILIKE '%keyword%'
  OR note ILIKE '%keyword%'
)
AND deleted_at IS NULL
```

---

### 新增

```
POST /organizations
```

Request Body：

```json
{
  "name": "南港派出所",
  "parent_id": 3,
  "phone_auto": "02-12345678",
  "phone_police": "1234",
  "phone_railway": "5678",
  "phone_fax": "02-87654321",
  "address": "台北市南港區...",
  "note": "備註",
  "changed_by": "暱稱"
}
```

---

### 更新

```
PUT /organizations/{id}
```

Request Body 同新增，`changed_by` 必填。

---

### 刪除（軟刪除）

```
DELETE /organizations/{id}
```

Request Body：

```json
{
  "changed_by": "暱稱"
}
```

---

### 查詢修改紀錄

```
GET /organizations/{id}/logs
```

---

## 十一、API 回傳格式

### 成功

```json
{
  "success": true,
  "data": { ... }
}
```

### 失敗

```json
{
  "success": false,
  "message": "Error message"
}
```

常見錯誤碼：

* 400：參數錯誤
* 404：資料不存在
* 500：系統錯誤

---

## 十二、使用者識別方式

* 使用者輸入暱稱
* 儲存在 localStorage
* 修改時帶入 `changed_by`

⚠️ 無法防止冒用，未來可加入 Token 或 PIN

---

## 十三、前端功能規劃（PWA）

### 必要元件

* `manifest.json`：定義 App 名稱、圖示、主題色
* Service Worker：支援基本離線快取
* HTTPS：部署至 Vercel，自動提供 SSL 憑證

---

### 頁面規劃

#### 組織瀏覽頁

* 層級瀏覽，點擊進入子單位

#### 搜尋頁

* debounce（300ms）
* 顯示完整路徑與分頁

#### 詳細頁

* 顯示四種電話、地址、備註
* 自動 / 警用 / 鐵路電話支援點擊撥號
* 編輯功能（需輸入暱稱）
* 修改紀錄列表

---

## 十四、環境變數

後端：

```env
DATABASE_URL=postgresql://...
ALLOWED_ORIGINS=https://xxx.vercel.app
```

前端：

```env
VITE_API_BASE_URL=https://xxx.railway.app
```

---

## 十五、初始資料導入

建議方式：

* SQL seed script
* CSV 匯入（未來）

避免手動逐筆輸入

---

## 十六、開發建議

1. 建立 Schema（含四種電話欄位）
2. 完成 CRUD API
3. 實作搜尋 API（含四種電話比對）
4. 加入 Audit Log 機制
5. 建立 React 前端介面
6. 加入 PWA 設定（manifest + Service Worker）
7. 部署（Vercel + Railway）
8. 優化 UI / UX

---

## 十七、專案亮點

* FastAPI + PostgreSQL 完整後端架構
* Audit Log 可追蹤所有資料變更
* PWA 免安裝，支援 iOS 主畫面
* Recursive CTE 處理多層級組織查詢
* 四種電話類型（自動 / 警用 / 鐵路 / 傳真）獨立欄位管理
* 雲端部署（Vercel + Railway）

---

## License

僅供個人與內部使用。
