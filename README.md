# 英语句子结构图解器

面向中国英语学习者的 Web 工具。输入一个英文句子，系统返回结构化分析结果，并以颜色高亮方式展示主语、谓语、宾语、从句等句子成分，同时提供中文解释。

---

## 当前阶段：Phase 2 — DeepSeek Analyzer Integration

在 Phase 1 完成的 Mock Analyzer MVP 基础上，新增了 DeepSeek Analyzer，支持通过环境变量切换真实大模型分析。

| 功能 | 状态 |
|---|---|
| Mock Analyzer 保留可用 | ✅ |
| DeepSeek Analyzer 新增 | ✅ |
| 通过 `ANALYZER_PROVIDER` 切换分析器 | ✅ |
| DeepSeek API key 只存后端 | ✅ |
| 返回结果 JSON schema 兼容前端 | ✅ |
| 模型输出 JSON 校验与 start/end 修复 | ✅ |
| API 失败/超时/字段缺失错误处理 | ✅ |
| 前端零改动 | ✅ |

默认使用 `ANALYZER_PROVIDER=mock`（不需要 API key）。设置 `ANALYZER_PROVIDER=deepseek` 并配置 API key 后，将调用 DeepSeek 进行真实语法分析。

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
        base.py                  # BaseAnalyzer 抽象基类 + AnalyzerError
        mock_analyzer.py         # Mock 实现
        deepseek_analyzer.py     # DeepSeek 实现（Phase 2 新增）
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

| 变量 | 默认值 | 说明 |
|---|---|---|
| `ANALYZER_PROVIDER` | `mock` | 分析器类型：`mock` 或 `deepseek` |
| `DEEPSEEK_API_KEY` | 空 | DeepSeek API key，**仅在 `deepseek` 模式下必填** |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | DeepSeek API endpoint |
| `DEEPSEEK_MODEL` | `deepseek-chat` | 使用的模型名称 |
| `ALLOWED_ORIGINS` | 空 | 允许跨域的前端地址，逗号分隔；本地开发留空即可，生产环境**必须**填写 Vercel 前端地址 |

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

### Mock 模式（`ANALYZER_PROVIDER=mock`）

| 输入 / 操作 | 预期结果 |
|---|---|
| 空输入直接点击分析 | 前端提示"请输入英文句子"，不发请求 |
| 输入超过 500 字符 | 前端提示"句子过长，请缩短后重试"，不发请求 |
| `The boy who won the prize is my brother.` | 高亮主语（蓝）、谓语（绿）、补语（紫），展示定语从句，显示 warning |
| `I love English.` | 通用 mock 结果，附 2 条 warning，不崩溃 |
| `She is a teacher.` | 通用 mock 结果，附 2 条 warning，不崩溃 |
| 后端未启动时提交 | 前端显示"分析服务暂时不可用，请稍后重试" |

### DeepSeek 配置缺失模式（`ANALYZER_PROVIDER=deepseek`，`DEEPSEEK_API_KEY` 为空）

| 操作 | 预期结果 |
|---|---|
| 提交任意句子 | 后端返回 `{"error": "DeepSeek API key 未配置"}`，前端显示错误提示，不崩溃 |

### DeepSeek 模式（配置完整）

| 输入 | 预期结果 |
|---|---|
| `I love English.` | 返回真实语法分析 JSON，前端正常高亮展示 |
| `She is a teacher.` | 返回真实分析，前端正常展示 |
| `The boy who won the prize is my brother.` | 返回真实分析，含定语从句识别 |
| 复杂长句 | 允许有 warnings，但不崩溃，不伪造确定结论 |

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
| 后端修改后无效 | Render 未重新部署 | push 到 GitHub 或在 Render Dashboard 手动触发重新部署 |

---

## 当前限制

1. **单句输入，最大 500 字符。** 不支持多句或段落分析。
2. **无用户系统。** 无登录、无历史记录、无个人设置。
3. **无数据持久化。** 分析结果仅保存在当前页面内存中，刷新后消失。
4. **前端 fetch 无超时设置。** 网络极慢时用户体验较差（后端有 45s 超时）。
5. **Render Free 冷启动。** 15 分钟无请求后服务休眠，首次响应约需 30 秒。
6. **DeepSeek 复杂长句准确率不保证。** 模型可能对复杂结构给出 warnings 或不完整分析，属于正常行为。

---

## 后续阶段方向

### 第三阶段：产品化

- 用户账号与历史记录
- 数据库持久化（PostgreSQL）
- 请求频率限制（rate limiting）
- 前端 fetch 加超时与重试逻辑
- 升级 Render 套餐或迁移至其他平台消除冷启动
- 自定义域名绑定
