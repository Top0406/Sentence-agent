# 第三阶段总结

## 1. 第三阶段目标

在第二阶段 DeepSeek Analyzer 已上线的基础上，新增历史记录 MVP 功能：

- SQLite 保存分析历史（sentence + result_json + created_at）
- 后端新增 `GET /api/history` 端点
- 前端显示最近分析记录列表（HistoryPanel）
- 点击历史记录恢复原句和分析结果，不重新请求 API

核心约束：
- 不做登录、多用户、支付、云数据库、搜索、删除、收藏、标签
- SQLite 在 Render 上可能丢失（MVP 接受此限制）
- HistoryPanel 作为独立纯 props 组件，方便后续移入 sidebar / drawer

---

## 2. 已实现功能

| 功能 | 状态 |
|---|---|
| SQLite 表 `analyses` 自动初始化 | ✅ |
| `POST /api/analyze` 成功后写入历史 | ✅ |
| DB 写入失败不影响分析响应 | ✅ |
| `GET /api/history` 端点，按 `created_at DESC` | ✅ |
| `limit` 参数支持，默认 20，上限 200 | ✅ |
| `HistoryItem` 含完整 `AnalyzeResponse`（result 字段） | ✅ |
| 前端 `fetchHistory()` API 封装 | ✅ |
| `HistoryPanel` 纯 props 展示组件 | ✅ |
| HistoryPanel 当前放在输入框下方、分析结果上方 | ✅ |
| 点击历史恢复 sentence（填回输入框）+ result | ✅ |
| 恢复历史不重新请求 `/api/analyze` | ✅ |
| 页面加载时自动 fetch 历史 | ✅ |
| 每次分析成功后自动刷新历史列表 | ✅ |
| 历史列表 hover 高亮效果 | ✅ |
| `*.db` 加入 `.gitignore` | ✅ |
| 后端自动化测试建立（12 个） | ✅ |

---

## 3. 修改过的主要文件

### 后端新建

| 文件 | 说明 |
|---|---|
| `backend/app/database.py` | `init_db` / `save_analysis` / `get_history`，均接受 `db_path` 参数 |
| `backend/tests/test_database.py` | DB 函数单元测试（6 个） |
| `backend/tests/test_api_history.py` | API 端点集成测试（6 个） |
| `backend/tests/__init__.py` | 测试包标识 |
| `backend/tests/conftest.py` | pytest fixture（`db_path` 临时文件） |
| `backend/pytest.ini` | `asyncio_mode = auto`，`testpaths = tests` |
| `backend/requirements-dev.txt` | pytest + pytest-asyncio + aiosqlite |

### 后端修改

| 文件 | 修改内容 |
|---|---|
| `backend/app/main.py` | lifespan 初始化 DB；`/api/analyze` 写入历史；新增 `GET /api/history` |
| `backend/app/schemas.py` | 新增 `HistoryItem` Pydantic model |
| `backend/requirements.txt` | 新增 `aiosqlite>=0.19.0` |

### 前端新建

| 文件 | 说明 |
|---|---|
| `frontend/src/components/HistoryPanel.jsx` | 历史列表展示组件，纯 props，不持有 state |

### 前端修改

| 文件 | 修改内容 |
|---|---|
| `frontend/src/api/client.js` | 新增 `fetchHistory(limit=20)` |
| `frontend/src/App.jsx` | history 状态管理、刷新逻辑、handleHistorySelect、渲染 HistoryPanel |
| `frontend/src/components/SentenceInput.jsx` | 改为 `forwardRef`，暴露 `setValue` 方法 |

### 项目根

| 文件 | 修改内容 |
|---|---|
| `.gitignore` | 新增 `*.db` |

---

## 4. 数据库

### 表结构

```sql
CREATE TABLE IF NOT EXISTS analyses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sentence    TEXT NOT NULL,
    result_json TEXT NOT NULL,
    created_at  TEXT NOT NULL
);
```

### 文件位置

- 本地：`backend/history.db`（`.gitignore` 已排除）
- Render：默认 `history.db`（相对于进程工作目录）；可通过 `HISTORY_DB_PATH` 环境变量自定义路径

---

## 5. API

### GET /api/history

| 参数 | 默认值 | 说明 |
|---|---|---|
| `limit` | 20 | 返回条数上限，最大 200 |

响应：`list[HistoryItem]`，每条含 `id`、`sentence`、`result`（完整 AnalyzeResponse）、`created_at`。

---

## 6. 本地测试结果

### 自动化测试

```bash
cd backend
python -m pytest tests/ -v
# 12 passed in 0.22s
```

| 测试 | 通过 |
|---|---|
| `test_history_empty_on_fresh_start` | ✅ |
| `test_analyze_saves_sentence_to_history` | ✅ |
| `test_history_result_contains_analyze_response` | ✅ |
| `test_history_newest_first` | ✅ |
| `test_history_limit_query_param` | ✅ |
| `test_failed_analyze_does_not_save_to_history` | ✅ |
| `test_init_db_creates_usable_table` | ✅ |
| `test_save_analysis_and_fetch` | ✅ |
| `test_history_ordered_newest_first` | ✅ |
| `test_history_limit_respected` | ✅ |
| `test_history_limit_default_is_twenty` | ✅ |
| `test_empty_history_returns_empty_list` | ✅ |

### 人工验证（本地 mock 模式）

| 场景 | 结果 |
|---|---|
| 页面加载时自动显示历史列表 | ✅ |
| 分析后历史自动新增一条 | ✅ |
| 多条历史按最新在前排列 | ✅ |
| `GET /api/history?limit=2` 返回 2 条 | ✅ |
| 点击历史记录恢复原句和结果 | ✅ |
| 恢复历史后未重新调用 `/api/analyze` | ✅ |
| 前端 `npm run build` 无错误（22 个模块） | ✅ |

---

## 7. 当前限制

1. **Global shared history**：所有用户共享同一份历史，无隐私隔离。后续 Phase 4 加登录后改为 user-scoped history。
2. **SQLite 在 Render 上可能丢失**：Render 免费套餐文件系统不持久化，重启后历史消失。后续正式部署时升级 PostgreSQL。
3. **无去重**：同一句子多次分析产生多条历史记录，属预期行为。
4. **无搜索、删除、收藏、标签、分页**：Phase 3 MVP 只做基础列表和恢复功能。
5. **无用户系统**：无法按用户过滤历史。

---

## 8. Known Issues

无当前严重问题。以下为已知低优先级问题：

| # | 问题 | 严重程度 |
|---|---|---|
| KI-1 | Render 上 `HISTORY_DB_PATH` 未配置时默认 `history.db`，重启后消失 | 低：Phase 3 MVP 接受，记录存档 |
| KI-2 | 历史列表超过 20 条时无分页或"加载更多"，用户无法浏览更早记录 | 低：Phase 3.1 考虑 |
| KI-3 | `SentenceInput` 改为 `forwardRef` 后，原 `export default function` 写法变更，影响可读性 | 低：功能正常 |

---

## 9. Phase 3.1 完成情况

Phase 3.1 方向：UI polish（不做 Render SQLite 持久化验证，已知限制记录存档）。

### 已完成

| 功能 | 状态 |
|---|---|
| history 加载状态（`historyLoading`）：fetch 时显示"加载中…" | ✅ |
| 空历史文案优化：改为"分析句子后，记录会出现在这里" | ✅ |
| 历史默认显示最近 5 条，超出时显示"查看更多（+N 条）"按钮 | ✅ |
| 展开后显示"收起"按钮，可折叠回 5 条 | ✅ |
| 折叠逻辑为纯前端 state，不改 API，不做分页 | ✅ |
| 前端 `npm run build` 无报错（22 个模块） | ✅ |

### 修改文件

| 文件 | 修改内容 |
|---|---|
| `frontend/src/App.jsx` | 新增 `historyLoading` state；`useEffect` 加 `.finally` 清除加载态；向 `HistoryPanel` 传入 `loading` prop |
| `frontend/src/components/HistoryPanel.jsx` | 接受 `loading` prop 显示加载文案；优化空状态文案；新增 `expanded` state + `COLLAPSED_LIMIT = 5` 折叠逻辑；新增"查看更多 / 收起"按钮 |

### 未做（已知限制）

- Render 上 SQLite 重启后丢失：已知限制，Phase 3 MVP 接受，记录存档，后续 Phase 4 决策是否迁移 PostgreSQL。
- HistoryPanel 移入 sidebar/drawer：未做，组件已解耦，后续移动零改动。
- 历史去重、搜索、删除、收藏、分页：Phase 3.x 均不做。

---

## 10. 验收清单（15 / 15 ✅）

| # | 验收项 | 状态 |
|---|---|---|
| 1 | SQLite 自动初始化 | ✅ |
| 2 | `/api/analyze` 成功后写入历史 | ✅ |
| 3 | `/api/analyze` 失败时不写入历史 | ✅ |
| 4 | DB 写入失败不影响分析响应 | ✅ |
| 5 | `GET /api/history` 返回历史列表 | ✅ |
| 6 | 历史按 `created_at DESC` 排序 | ✅ |
| 7 | `limit` 参数生效，不写死为 20 | ✅ |
| 8 | `result` 含完整 `AnalyzeResponse` | ✅ |
| 9 | 前端页面加载时自动 fetch 历史 | ✅ |
| 10 | 每次分析成功后自动刷新历史列表 | ✅ |
| 11 | 点击历史恢复 sentence + result | ✅ |
| 12 | 恢复历史不重新请求 `/api/analyze` | ✅ |
| 13 | HistoryPanel 是纯 props 组件，不感知布局位置 | ✅ |
| 14 | `*.db` 文件已加入 `.gitignore` | ✅ |
| 15 | 后端自动化测试 12/12 通过 | ✅ |
