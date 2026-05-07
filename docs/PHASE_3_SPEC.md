# 英语句子结构图解器 — 第三阶段 SPEC

## 0. 本文档目的

本文档定义"英语句子结构图解器"的第三阶段开发范围。

第三阶段的核心目标是：在第二阶段 DeepSeek Analyzer 已上线的基础上，新增历史记录功能，让用户可以查看最近分析过的句子，点击后恢复原句和分析结果。

---

## 1. 当前项目状态

第一阶段已完成：React/Vite 前端 + FastAPI 后端 + Mock Analyzer + `/api/analyze` + 颜色高亮展示。

第二阶段已完成：DeepSeek Analyzer 接入，通过环境变量切换分析器，start/end 高亮修复，分析质量优化（Phase 2.1、2.2）。

第三阶段在第二阶段完成的基础上新增历史记录功能，不重做已有架构。

---

## 2. 第三阶段目标

第三阶段目标是实现历史记录 MVP，不只是数据库。

第三阶段必须实现：

1. SQLite 数据库保存分析历史（sentence、result_json、created_at）。
2. `/api/analyze` 成功后自动保存记录，不影响分析响应速度。
3. 新增 `GET /api/history` 端点，支持 `limit` 参数，默认 20 条。
4. 返回记录按 `created_at DESC` 排序（最新在前）。
5. 前端新增 `HistoryPanel` 组件，展示最近分析记录列表。
6. 点击历史记录恢复原句（填回输入框）和分析结果（直接显示，不重新请求 API）。
7. 每次分析成功后自动刷新历史列表。

---

## 3. 第三阶段不做的内容

第三阶段不得实现以下内容：

1. 登录 / 注册。
2. 用户账号 / user_id。
3. 多用户隔离（当前 history 是 global shared）。
4. PostgreSQL 或其他云数据库（Phase 3 用 SQLite）。
5. 历史记录搜索。
6. 历史记录删除。
7. 历史记录收藏 / 标签。
8. 历史记录分页。
9. 本地 analyzer（无 API key 模式）。
10. 支付 / 计费 / 套餐。
11. 管理后台。
12. 任何未在本文档明确允许的功能。

---

## 4. 数据库设计

### 数据库文件

| 环境变量 | 默认值 | 说明 |
|---|---|---|
| `HISTORY_DB_PATH` | `history.db` | SQLite 文件路径，后端启动时自动创建 |

本地运行时，SQLite 文件创建在 `backend/history.db`（已被 `.gitignore` 忽略）。

### 表结构

```sql
CREATE TABLE IF NOT EXISTS analyses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sentence    TEXT NOT NULL,
    result_json TEXT NOT NULL,
    created_at  TEXT NOT NULL     -- ISO 8601 UTC 时间字符串
);
```

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | INTEGER | 自增主键 |
| `sentence` | TEXT | 用户输入的原始英文句子 |
| `result_json` | TEXT | 完整 `AnalyzeResponse` 序列化后的 JSON 字符串 |
| `created_at` | TEXT | ISO 8601 UTC 时间（如 `2026-05-07T12:00:00+00:00`） |

---

## 5. API 设计

### 5.1 保持不变的端点

| 端点 | 变化 |
|---|---|
| `GET /api/health` | 不变 |
| `POST /api/analyze` | 新增：分析成功后写入历史，写入失败只记录（不影响分析响应） |

### 5.2 新增端点

```
GET /api/history
```

**Query 参数：**

| 参数 | 类型 | 默认值 | 限制 | 说明 |
|---|---|---|---|---|
| `limit` | int | 20 | 1–200 | 返回记录数上限 |

**响应体（`list[HistoryItem]`）：**

```json
[
  {
    "id": 1,
    "sentence": "I love English.",
    "result": {
      "original_sentence": "I love English.",
      "translation_zh": "我爱英语。",
      "main_structure": { ... },
      "components": [ ... ],
      "clauses": [ ... ],
      "explanation_zh": "...",
      "warnings": []
    },
    "created_at": "2026-05-07T12:00:00+00:00"
  }
]
```

- 按 `created_at DESC` 排序，最新记录在最前。
- 空历史时返回 `[]`。
- `result` 字段包含完整 `AnalyzeResponse`，前端无需重新分析即可恢复结果。

---

## 6. 后端设计

### 新增文件

| 文件 | 作用 |
|---|---|
| `backend/app/database.py` | `init_db` / `save_analysis` / `get_history`，均支持 `db_path` 参数 |

### 修改文件

| 文件 | 修改内容 |
|---|---|
| `backend/app/schemas.py` | 新增 `HistoryItem` Pydantic model |
| `backend/app/main.py` | lifespan 初始化 DB；`/api/analyze` 写入历史；新增 `GET /api/history` |
| `backend/requirements.txt` | 新增 `aiosqlite>=0.19.0` |

### 核心规则

- DB 写入失败不影响分析响应（`try/except` 吞掉异常，不回传错误）。
- `get_history` 的 `limit` 参数不写死，由调用方传入，有上限约束（最大 200）。
- `HISTORY_DB_PATH` 从环境变量读取，方便测试和部署切换。

---

## 7. 前端设计

### 新增文件

| 文件 | 作用 |
|---|---|
| `frontend/src/components/HistoryPanel.jsx` | 历史记录列表展示组件，只接收 props，不持有 state |

### 修改文件

| 文件 | 修改内容 |
|---|---|
| `frontend/src/api/client.js` | 新增 `fetchHistory(limit=20)` |
| `frontend/src/App.jsx` | 加入 `history` 状态；页面加载和每次分析成功后刷新历史；点击历史恢复 sentence + result |
| `frontend/src/components/SentenceInput.jsx` | 改为 `forwardRef`，通过 `useImperativeHandle` 暴露 `setValue` 方法 |

### HistoryPanel 组件设计原则

`HistoryPanel` 是纯展示组件，不感知自己在布局中的位置：

```jsx
// 只接收 props，不持有 state，不调用 fetch
export default function HistoryPanel({ items, onSelect }) { ... }
```

- `items`：历史记录数组（父组件传入）
- `onSelect(item)`：点击回调（逻辑在父组件）
- 组件不写外部间距（`margin-top`、`position` 等），方便未来移入 sidebar / drawer

当前布局位置：输入框下方、分析结果上方。

### 点击历史记录的行为

1. 调用 `inputRef.current.setValue(item.sentence)` 填回输入框。
2. 直接将 `item.result` 写入 `result` state，不重新请求 `/api/analyze`。
3. 清除当前 error 状态。

---

## 8. 测试要求

### 自动化测试

第三阶段要求建立后端自动化测试：

| 测试文件 | 覆盖内容 |
|---|---|
| `backend/tests/test_database.py` | `init_db`、`save_analysis`、`get_history` 单元测试（6 个） |
| `backend/tests/test_api_history.py` | API 端点集成测试（6 个），含：空历史、分析后保存、返回格式、时序、limit 参数、失败不保存 |

测试运行：

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest tests/ -v
```

### 人工验证清单

| 场景 | 预期结果 |
|---|---|
| 首次打开页面 | HistoryPanel 显示"暂无历史记录" |
| 分析任意句子 | 分析结果展示 + 历史列表自动新增一条 |
| 多次分析 | 历史按最新在前排列，最多显示 20 条 |
| 点击历史记录 | 输入框填入原句，结果区显示历史结果，不重新调用 API |
| `GET /api/history?limit=5` | 返回最近 5 条 |
| 空输入提交 | 不保存到历史 |

---

## 9. 当前限制（Phase 3 MVP）

1. **Global shared history**：所有用户共享同一份历史，无隐私隔离。后续 Phase 4 加登录后改为 user-scoped。
2. **SQLite 在 Render 上可能丢失**：Render 免费套餐文件系统不持久化，重启后历史消失。Phase 3 接受此限制，正式部署时升级 PostgreSQL。
3. **无去重**：同一句子多次分析产生多条历史记录。
4. **无搜索、删除、收藏、标签、分页**：Phase 3 只做基础列表和恢复。
5. **无用户系统**：无法按用户过滤历史。

---

## 10. 下一步（Phase 3.1）

Phase 3.1 方向：history stability check + UI polish。

建议内容：

1. 检查 Render 上 SQLite 实际行为（是否随重启丢失）。
2. 历史列表加入"空状态"和加载状态的 UI 优化。
3. 历史列表超过 20 条时的交互（分页或"加载更多"）。
4. HistoryPanel 与分析结果的视觉层次优化。
5. 考虑是否将 HistoryPanel 移入 sidebar 或 drawer。

---

## 11. 验收清单

| # | 验收项 | 状态 |
|---|---|---|
| 1 | SQLite 自动初始化（首次启动建表） | ✅ |
| 2 | `/api/analyze` 成功后写入历史 | ✅ |
| 3 | `/api/analyze` 失败时不写入历史 | ✅ |
| 4 | DB 写入失败不影响分析响应 | ✅ |
| 5 | `GET /api/history` 返回历史列表 | ✅ |
| 6 | 历史按 `created_at DESC` 排序 | ✅ |
| 7 | `limit` 参数生效，不写死为 20 | ✅ |
| 8 | `result` 字段含完整 `AnalyzeResponse` | ✅ |
| 9 | 前端页面加载时自动 fetch 历史 | ✅ |
| 10 | 每次分析成功后自动刷新历史列表 | ✅ |
| 11 | 点击历史恢复 sentence + result | ✅ |
| 12 | 恢复历史不重新请求 `/api/analyze` | ✅ |
| 13 | HistoryPanel 是纯 props 组件，不感知布局位置 | ✅ |
| 14 | `*.db` 文件已加入 `.gitignore` | ✅ |
| 15 | 后端自动化测试 12/12 通过 | ✅ |
