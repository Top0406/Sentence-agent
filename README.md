# 英语句子结构图解器

面向中国英语学习者的 Web 工具。输入一个英文句子，系统返回结构化分析结果，并以颜色高亮方式展示主语、谓语、宾语、从句等句子成分，同时提供中文解释。

---

## 当前阶段：Phase 1 — Mock Analyzer MVP

本阶段目标是验证产品骨架，**不接入任何真实大模型或 NLP API**。

| 验证点 | 状态 |
|---|---|
| 前端能把句子发送给后端 | ✅ |
| 后端能返回结构化 JSON | ✅ |
| 前端能根据 JSON 颜色高亮成分 | ✅ |
| UI 清晰可用 | ✅ |
| 分析器模块便于后续替换 | ✅ |

分析结果由 **Mock Analyzer** 生成：对固定句子 `The boy who won the prize is my brother.` 返回完整结构；对其他输入返回覆盖全句的通用成分并附带说明。这不是真实语法分析，仅用于验证前后端通信和 UI 展示。

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

### 部署

| 服务 | 用途 |
|---|---|
| Render | 后端（FastAPI） |
| Vercel | 前端（Vite 静态） |

---

## 项目结构

```
sentence-agent/
  SPEC.md                        # 第一阶段需求规格
  README.md
  render.yaml                    # Render 后端服务定义
  .gitignore

  docs/
    PHASE_1_SUMMARY.md           # 阶段总结

  frontend/
    vercel.json                  # SPA fallback 规则
    .env.example
    src/
      App.jsx                    # 主布局，状态管理
      api/client.js              # fetch 封装，统一错误处理
      components/
        SentenceInput.jsx        # 输入框 + 前端校验
        HighlightedSentence.jsx  # 按 components 数组渲染高亮
        AnalysisResult.jsx       # 完整结果展示
        Legend.jsx               # 颜色图例

  backend/
    requirements.txt
    .env.example
    app/
      main.py                    # FastAPI 入口、CORS、路由、错误处理
      schemas.py                 # Pydantic 请求/响应模型
      analyzers/
        base.py                  # BaseAnalyzer 抽象基类（可替换接口）
        mock_analyzer.py         # Mock 实现
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

后端运行在 `http://localhost:8000`。可访问 `http://localhost:8000/api/health` 确认正常。

### 2. 启动前端

新开一个终端：

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

前端运行在 `http://localhost:5173`。

---

## 环境变量

### 后端 `backend/.env`

| 变量 | 本地默认 | 说明 |
|---|---|---|
| `ANALYZER_PROVIDER` | `mock` | 分析器类型，第一阶段固定为 `mock` |
| `ALLOWED_ORIGINS` | 空 | 允许跨域的前端地址，逗号分隔；本地开发留空即可，生产环境**必须**填写 Vercel 前端地址 |

```env
ANALYZER_PROVIDER=mock

# 允许访问后端的前端域名，逗号分隔（本地开发留空即可）
ALLOWED_ORIGINS=https://sentence-agent.vercel.app
```

第一阶段不需要任何 API key。

### 前端 `frontend/.env`

| 变量 | 本地默认 | 说明 |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | 后端地址；Vite 构建时打入静态包，生产环境**必须**填写 Render 后端地址 |

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 部署

### 部署顺序

```
1. 先部署后端到 Render  →  拿到后端地址（https://xxx.onrender.com）
2. 再部署前端到 Vercel  →  填写后端地址，拿到前端地址（https://xxx.vercel.app）
3. 再回到 Render        →  将前端地址填入 ALLOWED_ORIGINS，保存重启
4. 验证前端发请求 → 后端正常返回
```

---

### Render 部署（后端）

仓库根目录已有 `render.yaml`，Render 可自动识别。

**Render 服务配置**

| 项目 | 值 |
|---|---|
| Service Type | Web Service |
| Runtime | Python |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Instance Type | Free |

**方式一：网页操作**

1. `git push` 推送代码到 GitHub。
2. [render.com](https://render.com) → 登录 → **New** → **Web Service**。
3. 选择仓库 → **Connect**。
4. 按上表填写配置（如果识别到 `render.yaml` 会自动填充）。
5. **Environment Variables** 手动添加：
   ```
   ALLOWED_ORIGINS = https://your-app.vercel.app
   ```
   （`ANALYZER_PROVIDER=mock` 已在 `render.yaml` 中预设，无需再填）
6. 点击 **Create Web Service**，等待部署完成。
7. 记录分配的地址 `https://your-service.onrender.com`，后续填入 Vercel。

**方式二：Blueprint（render.yaml）**

1. [render.com](https://render.com) → **New** → **Blueprint**。
2. 选择仓库，Render 自动读取 `render.yaml`。
3. 在 Dashboard 中手动为 `ALLOWED_ORIGINS` 填写前端地址（`render.yaml` 中标记为 `sync: false`）。

> **注意**：Render Free 套餐 15 分钟无请求后服务休眠，首次访问有约 30 秒冷启动延迟。

---

### Vercel 部署（前端）

`frontend/vercel.json` 已配置 SPA fallback，无需额外设置。

**Vercel 构建配置**

| 项目 | 值 |
|---|---|
| Framework Preset | Vite（自动识别） |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

**方式一：网页操作**

1. `git push` 推送代码到 GitHub。
2. [vercel.com](https://vercel.com) → 登录 → **Add New Project**。
3. 选择仓库 → **Import**。
4. **Configure Project** 页面：
   - **Root Directory** → 填写 `frontend`（这步容易漏）
   - Build Command / Output Directory 自动填充
5. **Environment Variables** 添加：
   ```
   VITE_API_BASE_URL = https://your-service.onrender.com
   ```
6. 点击 **Deploy**，完成后记录分配的 `*.vercel.app` 地址。
7. 后续每次 `git push` 主分支，Vercel 自动重新部署。

**方式二：Vercel CLI**

```bash
npm install -g vercel
vercel login

cd frontend
vercel                                        # 首次交互式配置，Root Directory 选 .

vercel env add VITE_API_BASE_URL production   # 输入 Render 后端地址
vercel --prod                                 # 生产部署
```

---

## 测试用例

手动验证以下场景：

| 输入 / 操作 | 预期结果 |
|---|---|
| 空输入直接点击分析 | 前端提示"请输入英文句子"，不发请求 |
| 输入超过 500 字符 | 前端提示"句子过长，请缩短后重试"，不发请求 |
| `The boy who won the prize is my brother.` | 高亮主语（蓝）、谓语（绿）、补语（紫），展示定语从句，显示 warning |
| `I love English.` | 通用 mock 结果，附 2 条 warning，不崩溃 |
| `She is a teacher.` | 通用 mock 结果，附 2 条 warning，不崩溃 |
| 后端未启动时提交 | 前端显示"分析服务暂时不可用，请稍后重试" |

---

## 当前限制

1. **Mock Analyzer 不是真实语法分析器。** 只有一个固定句子（`The boy who won the prize is my brother.`）有精确的成分拆分结果；其他所有句子返回覆盖全句的通用成分，无实际语法意义。
2. **不支持真实大模型或 NLP 分析。** 第一阶段不调用 DeepSeek、OpenAI、Claude 或任何本地 NLP 库。
3. **单句输入，最大 500 字符。** 不支持多句或段落分析。
4. **无用户系统。** 无登录、无历史记录、无个人设置。
5. **无数据持久化。** 分析结果仅保存在当前页面内存中，刷新后消失。
6. **无请求超时处理。** 前端 fetch 未设置超时，网络极慢时用户体验较差。
7. **Render Free 冷启动。** 15 分钟无请求后服务休眠，首次响应约需 30 秒。

---

## 后续阶段方向

### 第二阶段：接入真实分析器

- 新增 `backend/app/analyzers/deepseek_analyzer.py`，继承 `BaseAnalyzer`
- 通过环境变量 `ANALYZER_PROVIDER=deepseek` 切换，**前端零改动**
- 设计 prompt，使模型输出符合现有 JSON schema
- 对模型返回 JSON 做严格字段校验和 `start/end` 合法性检查
- 支持备选免费 API 或本地 spaCy/NLTK 作为 `ANALYZER_PROVIDER=local`

### 第三阶段：产品化

- 用户账号与历史记录
- 数据库持久化（PostgreSQL）
- 请求频率限制（rate limiting）
- 前端 fetch 加超时与重试逻辑
- 升级 Render 套餐或迁移至其他平台消除冷启动
- 自定义域名绑定
