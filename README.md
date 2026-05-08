# 英语句子结构图解器

面向中国英语学习者的 Web 工具。输入一个英文句子，系统返回结构化分析结果，并以颜色高亮方式展示主语、谓语、宾语、从句等句子成分，同时提供中文解释。

---

## 当前阶段：Phase 3.3 — UI/UX Polish（已完成）

整体界面交互优化，不加新功能。

| 功能 | 状态 |
|---|---|
| DeepSeek 句子结构分析 | ✅ |
| 颜色高亮展示句子成分 | ✅ |
| 中文解释与翻译 | ✅ |
| Mock / DeepSeek 分析器切换 | ✅ |
| 分析历史记录（HistoryPanel） | ✅ Phase 3 |
| 点击历史恢复原句和结果 | ✅ Phase 3 |
| 历史默认显示 5 条，可展开/收起 | ✅ Phase 3.1 |
| Browser-local localStorage 历史（每浏览器独立） | ✅ Phase 3.2 |
| 输入框 focus ring、按钮交互状态、字数警告色 | ✅ Phase 3.3 |
| loading 占位、布局调整（result 先于 history） | ✅ Phase 3.3 |

---

## 技术栈

### 前端

| 项目 | 版本 |
|---|---|
| React | ^19 |
| Vite | ^8 |

无额外 UI 库，样式全部使用内联 style。

### 后端

| 项目 | 版本 |
|---|---|
| Python | 3.11+ 建议 |
| FastAPI | >=0.111 |
| Uvicorn | >=0.29 |
| Pydantic | >=2.7 |
| httpx | >=0.27（DeepSeek 异步 HTTP 客户端） |
| aiosqlite | >=0.19（历史记录 SQLite） |

### 部署

| 服务 | 用途 |
|---|---|
| Render | 后端（FastAPI） |
| Vercel | 前端（Vite 静态） |

---

## 项目结构

```
sentence-agent/
  SPEC.md                        # 当前开发索引
  README.md
  render.yaml                    # Render 后端服务定义
  .gitignore

  docs/
    PHASE_1_SPEC.md
    PHASE_1_SUMMARY.md
    PHASE_2_SPEC.md
    PHASE_2_SUMMARY.md
    PHASE_3_SPEC.md              # Phase 3 设计文档
    PHASE_3_SUMMARY.md           # Phase 3 完成情况

  tests/
    test_sentences.md            # 测试句集（41 句，Phase 2.2 建立）
    test_results.md              # 测试结果记录

  frontend/
    vercel.json                  # SPA fallback 规则
    .env.example
    src/
      App.jsx                    # 主布局，状态管理，历史逻辑
      api/client.js              # fetch 封装（analyzeSentence + fetchHistory）
      components/
        SentenceInput.jsx        # 输入框，支持外部 setValue
        HighlightedSentence.jsx  # 按 components 数组渲染高亮
        AnalysisResult.jsx       # 完整结果展示
        Legend.jsx               # 颜色图例
        HistoryPanel.jsx         # 历史记录列表（Phase 3 新增）

  backend/
    requirements.txt
    requirements-dev.txt         # pytest 等测试依赖
    .env.example
    pytest.ini
    app/
      main.py                    # FastAPI 入口、路由、历史写入
      schemas.py                 # Pydantic 模型（含 HistoryItem）
      database.py                # SQLite init / save / get（Phase 3 新增）
      analyzers/
        base.py                  # BaseAnalyzer + AnalyzerError
        mock_analyzer.py         # Mock 实现
        deepseek_analyzer.py     # DeepSeek 实现
    tests/
      test_database.py           # DB 函数单元测试
      test_api_history.py        # API 端点集成测试
```

---

## 本地运行

### 1. 启动后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

后端运行在 `http://localhost:8000`。SQLite 历史数据库自动创建在 `backend/history.db`。

### 2. 启动前端

新开一个终端：

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

前端运行在 `http://localhost:5173`。

### 3. 运行后端测试

```bash
cd backend
pip install -r requirements-dev.txt
python -m pytest tests/ -v
```

---

## 环境变量

### 后端 `backend/.env`

| 变量 | 默认值 | 说明 |
|---|---|---|
| `ANALYZER_PROVIDER` | `mock` | 分析器类型：`mock` 或 `deepseek` |
| `DEEPSEEK_API_KEY` | 空 | DeepSeek API key，**仅在 `deepseek` 模式下必填** |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | DeepSeek API endpoint |
| `DEEPSEEK_MODEL` | `deepseek-chat` | 使用的模型名称 |
| `ALLOWED_ORIGINS` | 空 | 允许跨域的前端地址，逗号分隔；生产环境**必须**填写 Vercel 前端地址 |
| `HISTORY_DB_PATH` | `history.db` | SQLite 历史数据库文件路径（Phase 3 新增） |

**Mock 模式（不需要 API key）：**

```env
ANALYZER_PROVIDER=mock
ALLOWED_ORIGINS=https://your-app.vercel.app
```

**DeepSeek 模式：**

```env
ANALYZER_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的真实API key（不要提交到GitHub）
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
ALLOWED_ORIGINS=https://your-app.vercel.app
```

安全说明：
- `DEEPSEEK_API_KEY` 不得出现在代码、README、`.env.example` 或前端中。
- 本地使用 `backend/.env`（已被 `.gitignore` 忽略）。
- 生产环境在 Render Dashboard → Environment Variables 中配置。

### 前端 `frontend/.env`

| 变量 | 本地默认 | 说明 |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | 后端地址；生产环境**必须**填写 Render 后端地址 |

---

## 部署

### 部署顺序

```
1. 先部署后端到 Render  →  拿到后端地址（https://xxx.onrender.com）
2. 再部署前端到 Vercel  →  填写后端地址，拿到前端地址（https://xxx.vercel.app）
3. 再回到 Render        →  将前端地址填入 ALLOWED_ORIGINS，保存重启
4. 验证前端发请求 → 后端正常返回
```

### Render 部署（后端）

| 项目 | 值 |
|---|---|
| Service Type | Web Service |
| Runtime | Python |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

在 Render Dashboard → Environment Variables 中配置：

```
ANALYZER_PROVIDER=deepseek
DEEPSEEK_API_KEY=你的真实 key
DEEPSEEK_BASE_URL=https://api.deepseek.com
DEEPSEEK_MODEL=deepseek-chat
ALLOWED_ORIGINS=https://你的-vercel-url.vercel.app
```

> **注意**：Render Free 套餐文件系统不持久化，`history.db` 会在重启后消失。如需持久化历史记录，升级到 Render 付费套餐并挂载 Persistent Disk，或迁移至 PostgreSQL。

### Vercel 部署（前端）

| 项目 | 值 |
|---|---|
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

在 Vercel Environment Variables 中添加：

```
VITE_API_BASE_URL=https://your-service.onrender.com
```

---

## 当前限制

1. **单句输入，最大 500 字符。** 不支持多句或段落分析。
2. **历史记录为全局共享。** 所有用户共享同一份历史，无隐私隔离（后续 Phase 4 加登录后改为 user-scoped）。
3. **Render 上历史可能丢失。** Render 免费套餐文件系统不持久化，重启后 SQLite 历史消失。
4. **前端 fetch 无超时设置。** 后端有 45s 超时，前端侧暂无。
5. **DeepSeek 复杂长句准确率不保证。** 模型可能对复杂结构给出 warnings 或不完整分析。
6. **Render Free 冷启动。** 15 分钟无请求后服务休眠，首次响应约需 30 秒。

---

## 路线图

| 阶段 | 内容 | 状态 |
|---|---|---|
| Phase 1 | Mock Analyzer MVP，前后端基础架构，Render + Vercel 部署 | ✅ 完成 |
| Phase 2 | DeepSeek Analyzer 接入，start/end 修复，分析质量优化 | ✅ 完成 |
| Phase 3 MVP | 历史记录功能，SQLite，HistoryPanel，点击恢复 | ✅ 完成 |
| Phase 3.1 | History UI polish（加载态、空状态文案、折叠展示） | ✅ 完成 |
| Phase 3.2 | Browser-local localStorage history | ✅ 完成 |
| Phase 3.3 | UI/UX polish（交互状态、布局、高亮可读性） | ✅ 完成 |
| Phase 4 | 用户登录 + user-scoped history | 待规划 |

---

## 常见错误

| 错误信息 | 原因 | 解决方法 |
|---|---|---|
| `DeepSeek API key 未配置` | `DEEPSEEK_API_KEY` 为空 | 在 `.env` 或 Render 环境变量中填写真实 key |
| `DeepSeek API endpoint 未配置` | `DEEPSEEK_BASE_URL` 为空 | 填写 `https://api.deepseek.com` |
| `DeepSeek 模型名称未配置` | `DEEPSEEK_MODEL` 为空 | 填写 `deepseek-chat` |
| `分析服务响应超时` | 请求超过 45 秒 | 检查网络，或稍后重试 |
| `分析服务暂时不可用` | 网络错误、限流或 API 服务不可用 | 检查 API key 余额，稍后重试 |
| `分析结果格式异常` | 模型返回非 JSON 内容 | 检查模型配置，稍后重试 |
| CORS 错误 | `ALLOWED_ORIGINS` 未包含前端域名 | 在 Render 环境变量中填写正确的 Vercel 地址，重启服务 |
| 历史记录消失 | Render 重启清空文件系统 | 预期行为（Phase 3 MVP 限制），后续升级 PostgreSQL |
