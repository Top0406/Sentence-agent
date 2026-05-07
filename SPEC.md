# Project SPEC Index

## 1. Project Overview

本项目是"英语句子结构图解器"，目标是为中国英语学习者提供一个 Web 工具：用户输入英文句子后，系统返回句子结构分析结果，并以前端颜色高亮等方式展示句子成分。

项目采用分阶段开发方式。每个阶段的具体需求、范围、限制和验收标准，以对应阶段的 SPEC 文档为准。

---

## 2. Current Phase

当前阶段：

```text
Phase 3 MVP — 历史记录（已完成 checkpoint）
下一步：Phase 3.1 — history stability check + UI polish
```

Phase 3 MVP 已完成：SQLite 历史记录、`GET /api/history` 端点、前端 HistoryPanel、点击恢复原句和结果。

Phase 3.1 目标：Render 上 SQLite 持久化行为验证、历史列表 UI 优化、超过 20 条记录的交互处理。

---

## 3. Spec Documents

请 AI coding agent 在修改代码前阅读以下文档：

```text
docs/PHASE_1_SPEC.md
docs/PHASE_1_SUMMARY.md
docs/PHASE_2_SPEC.md
docs/PHASE_2_SUMMARY.md
docs/PHASE_3_SPEC.md
docs/PHASE_3_SUMMARY.md
```

文档说明：

| 文件 | 作用 |
|---|---|
| `docs/PHASE_1_SPEC.md` | 第一阶段原始需求与验收标准 |
| `docs/PHASE_1_SUMMARY.md` | 第一阶段完成情况、部署情况和限制 |
| `docs/PHASE_2_SPEC.md` | 第二阶段严格需求、限制、验收标准 |
| `docs/PHASE_2_SUMMARY.md` | 第二阶段完成情况（含 Phase 2.1、2.2 进展） |
| `docs/PHASE_3_SPEC.md` | 第三阶段目标、数据库/API/前端设计、限制、验收标准 |
| `docs/PHASE_3_SUMMARY.md` | 第三阶段完成情况、测试结果、已知限制、下一步 |

---

## 4. Active Development Rule

当前允许开发：

```text
Phase 3.1 — history stability check + UI polish
```

暂时不得实现以下功能：

1. 登录 / 注册。
2. 用户账号 / user_id。
3. 多用户隔离 / user-scoped history。
4. PostgreSQL 或其他云数据库（Phase 3 用 SQLite，除非 Render 验证失败后决策升级）。
5. 历史记录搜索 / 删除 / 收藏 / 标签 / 分页（Phase 3.1 可评估）。
6. mock 计费。
7. 真实支付。
8. 退款系统。
9. 管理后台。
10. 手机 APP。
11. 微信小程序。
12. 多语言国际版。
13. 完整本地 NLP 规则引擎。
14. 任何未在当前阶段 SPEC 中明确允许的功能。

---

## 5. Key Architecture Rule

分析器层必须保持可替换。

当前支持：

```env
ANALYZER_PROVIDER=mock
ANALYZER_PROVIDER=deepseek
```

未来可能支持：

```env
ANALYZER_PROVIDER=openai
ANALYZER_PROVIDER=local
ANALYZER_PROVIDER=free_api
```

前端不得知道当前使用的是哪一种 analyzer。前端只调用后端 `/api/analyze`。

后端必须通过统一 analyzer interface / factory 选择具体分析器。

历史记录数据库层同样保持可替换：当前使用 SQLite，后续可切换 PostgreSQL，只需替换 `database.py` 实现。

---

## 6. Strict No-Guessing Rule

AI coding agent 必须遵守：

1. 不准瞎猜。
2. 不准擅自决定产品功能。
3. 不准擅自填写 API endpoint。
4. 不准擅自填写模型名称。
5. 不准擅自填写价格。
6. 不准擅自填写额度。
7. 不准擅自假设返回格式能力。
8. 不准擅自修改生产部署配置。
9. 遇到不确定内容，必须先询问用户。

---

## 7. Security Rule

任何阶段都必须遵守：

1. API key 不得出现在前端代码中。
2. API key 不得提交到 GitHub。
3. API key 不得写入 README。
4. API key 不得写入 `.env.example`。
5. `.env` 必须被 `.gitignore` 忽略。
6. `history.db` 和所有 `*.db` 文件必须被 `.gitignore` 忽略。
7. 后端日志不得打印完整 secret。
8. 前端不得直接请求 DeepSeek / OpenAI / Claude 等模型 API。
9. 只有后端可以调用外部模型 API。

---

## 8. Deployment Context

当前部署结构：

```text
Frontend: Vercel
Backend: Render
Repository: GitHub
```

用户访问 Vercel 前端页面。
前端通过环境变量 `VITE_API_BASE_URL` 调用 Render 后端。
Render 后端通过 `/api/analyze` 返回 JSON，通过 `/api/history` 返回历史记录。

**Phase 3 部署限制**：Render 免费套餐文件系统不持久化，`history.db` 会在重启后消失。Phase 3 MVP 接受此限制，Phase 3.1 验证后决定是否升级。

---

## 9. Key Files

AI coding agent 在执行 Phase 3.1 任务前应了解以下关键文件：

### 后端核心

| 文件 | 说明 |
|---|---|
| `backend/app/main.py` | FastAPI 入口，lifespan 初始化 DB，`/api/analyze` 写入历史，`GET /api/history` |
| `backend/app/schemas.py` | Pydantic 模型：`AnalyzeRequest`、`AnalyzeResponse`、`HistoryItem` |
| `backend/app/database.py` | SQLite 函数：`init_db`、`save_analysis`、`get_history` |
| `backend/app/analyzers/` | 分析器层：`base.py`、`mock_analyzer.py`、`deepseek_analyzer.py` |

### 前端核心

| 文件 | 说明 |
|---|---|
| `frontend/src/App.jsx` | 主布局，history 状态，handleHistorySelect |
| `frontend/src/api/client.js` | `analyzeSentence` + `fetchHistory` |
| `frontend/src/components/HistoryPanel.jsx` | 历史列表纯 props 组件 |
| `frontend/src/components/SentenceInput.jsx` | 输入框，`forwardRef` + `setValue` |

### 测试

| 文件 | 说明 |
|---|---|
| `backend/tests/test_database.py` | DB 函数单元测试（6 个） |
| `backend/tests/test_api_history.py` | API 端点集成测试（6 个） |
| `tests/test_sentences.md` | 手动测试句集（41 句，Phase 2.2 建立） |
| `tests/test_results.md` | 手动测试结果记录 |

---

## 10. Agent Workflow

AI coding agent 在执行任何任务前必须：

1. 阅读本 `SPEC.md`。
2. 阅读当前阶段相关文档。
3. 总结当前阶段目标、范围、不做的内容和验收标准。
4. 如果存在未确认问题，先询问用户。
5. 在用户确认后再修改文件。
6. 每次只做小步修改。
7. 修改后总结：修改了哪些文件、为什么修改、如何本地运行、如何测试、是否影响部署。

---

## 11. Current User-Confirmed Decisions

当前已确认：

1. Phase 1 已完成并部署。
2. Phase 2 目标是接入 DeepSeek Analyzer，已完成。
3. Phase 2.2 分析质量优化已完成（含 Prompt 优化和 41 句测试集）。
4. Phase 3 MVP 历史记录功能已完成。
5. Phase 3 使用 SQLite，Render 上数据丢失可接受（MVP 阶段）。
6. Phase 3 历史为 global shared history，不做多用户隔离。
7. `GET /api/history` 支持 `limit` 参数，默认 20，不写死。
8. HistoryPanel 当前放在输入框下方、分析结果上方，做成纯 props 组件便于后续移动。
9. 点击历史记录恢复 sentence + result，不重新请求 `/api/analyze`。
10. Mock Analyzer 必须保留。
11. `/api/analyze` 接口路径保持不变。
12. DeepSeek API key 只能放后端。

---

## 12. Current Open Questions

以下问题待 Phase 3.1 验证或决策：

1. Render 上 `history.db` 是否实际会随重启丢失？（需部署后观察）
2. 如果历史丢失严重影响体验，是否提前迁移 PostgreSQL？
3. 历史列表超过 20 条时如何处理？（分页？加载更多？暂不处理？）
4. HistoryPanel 是否需要移入 sidebar 或 drawer？
5. 是否需要对历史条目加入简单的去重逻辑？
