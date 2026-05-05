# 英语句子结构图解器

面向中国英语学习者的 Web 工具，输入英文句子后，以颜色高亮方式展示句子成分。

第一阶段使用 Mock Analyzer，不调用任何真实大模型 API。

---

## 本地运行

### 1. 启动后端

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

后端默认运行在 http://localhost:8000

### 2. 启动前端

新开一个终端：

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

前端默认运行在 http://localhost:5173

---

## 环境变量

### backend/.env

```env
ANALYZER_PROVIDER=mock

# 允许访问后端的前端域名，逗号分隔（本地开发留空即可）
ALLOWED_ORIGINS=https://sentence-agent.vercel.app
```

第一阶段不需要任何 API key。

### frontend/.env

```env
VITE_API_BASE_URL=http://localhost:8000
```

---

## 手动测试用例

| 用例 | 预期结果 |
|---|---|
| 空输入直接点击分析 | 显示"请输入英文句子" |
| 输入超过 500 字符 | 显示"句子过长，请缩短后重试" |
| `The boy who won the prize is my brother.` | 高亮主语（蓝）、谓语（绿）、补语（紫），显示定语从句 |
| `I love English.` | 通用 mock 结果，带 warning，不崩溃 |
| `She is a teacher.` | 通用 mock 结果，带 warning，不崩溃 |
| 后端未启动时提交 | 显示"分析服务暂时不可用，请稍后重试" |

---

## 项目结构

```
sentence-agent/
  SPEC.md
  README.md
  .gitignore
  frontend/
    .env.example
    src/
      api/client.js          # fetch 封装
      components/
        SentenceInput.jsx    # 输入框 + 校验
        HighlightedSentence.jsx  # 颜色高亮渲染
        AnalysisResult.jsx   # 完整结果展示
        Legend.jsx           # 颜色图例
      App.jsx
  backend/
    .env.example
    requirements.txt
    app/
      main.py               # FastAPI 入口，路由，错误处理
      schemas.py            # Pydantic 数据模型
      analyzers/
        base.py             # 抽象基类（可替换接口）
        mock_analyzer.py    # Mock 实现
```

---

## Vercel 部署（前端）

前端是纯静态 Vite 应用，可直接部署到 Vercel。`frontend/vercel.json` 已配置 SPA fallback，无需额外设置。

### Vercel 构建配置

| 项目 | 值 |
|---|---|
| Framework Preset | Vite |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |

### 必填环境变量

`VITE_API_BASE_URL` 在构建时打入静态包，**必须在 Vercel 构建前设置**，否则前端无法调用后端。

```
VITE_API_BASE_URL = https://your-backend-domain.com
```

后端需单独部署，并在 CORS 中允许 Vercel 分配的前端域名。

---

### 方式一：Vercel 网页操作（推荐新手）

1. 将整个仓库推送到 GitHub（`git push`）。

2. 打开 [vercel.com](https://vercel.com) → 登录 → **Add New Project**。

3. 选择你的仓库，点击 **Import**。

4. 在 **Configure Project** 页面修改以下项：
   - **Root Directory**：点击 Edit，填写 `frontend`
   - **Framework Preset** 会自动识别为 Vite
   - **Build Command**：`npm run build`（自动填充）
   - **Output Directory**：`dist`（自动填充）

5. 展开 **Environment Variables**，添加：
   ```
   Name:  VITE_API_BASE_URL
   Value: https://your-backend-domain.com
   ```

6. 点击 **Deploy**。

7. 部署完成后，Vercel 会分配一个 `*.vercel.app` 域名，直接访问即可。

8. 后续每次 `git push` 到主分支，Vercel 自动重新部署。

---

### 方式二：Vercel CLI

```bash
# 1. 安装 CLI（全局）
npm install -g vercel

# 2. 登录
vercel login

# 3. 进入前端目录
cd frontend

# 4. 首次部署（交互式配置）
vercel

# CLI 会依次询问：
# ? Set up and deploy? → Y
# ? Which scope? → 选择你的账号
# ? Link to existing project? → N（首次）
# ? Project name → 填写项目名，如 sentence-agent
# ? In which directory is your code located? → .（当前目录，即 frontend/）
# ? Want to modify settings? → Y
#   Build Command: npm run build
#   Output Directory: dist
#   Install Command: npm install

# 5. 设置环境变量
vercel env add VITE_API_BASE_URL production
# 按提示输入值：https://your-backend-domain.com

# 6. 重新部署（让环境变量生效）
vercel --prod

# 后续部署
vercel --prod
```

---

## Render 部署（后端）

后端是 FastAPI 应用，可部署到 Render Free 套餐。仓库根目录已有 `render.yaml`，Render 会自动识别。

### Render 服务配置

| 项目 | 值 |
|---|---|
| Service Type | Web Service |
| Runtime | Python |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

### 环境变量

| 变量 | 值 | 说明 |
|---|---|---|
| `ANALYZER_PROVIDER` | `mock` | 已在 render.yaml 中预设 |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | **必须手动填写**，填 Vercel 前端地址 |

---

### 方式一：Render 网页操作（推荐新手）

1. 将整个仓库推送到 GitHub（`git push`）。

2. 打开 [render.com](https://render.com) → 登录 → **New** → **Web Service**。

3. 选择 GitHub 仓库，点击 **Connect**。

4. 填写配置：
   - **Name**：`sentence-agent-backend`（或自定义）
   - **Root Directory**：`backend`
   - **Runtime**：`Python`
   - **Build Command**：`pip install -r requirements.txt`
   - **Start Command**：`uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**：Free

   > 如果仓库根目录有 `render.yaml`，以上配置会自动填充。

5. 展开 **Environment Variables**，手动添加：
   ```
   ALLOWED_ORIGINS = https://your-app.vercel.app
   ```
   （`ANALYZER_PROVIDER=mock` 已在 render.yaml 中预设，无需再填）

6. 点击 **Create Web Service**。

7. 部署完成后，Render 会分配一个 `https://your-service.onrender.com` 地址。

8. 将这个地址填入 Vercel 的 `VITE_API_BASE_URL`，重新触发 Vercel 部署。

---

### 方式二：render.yaml 自动部署

仓库根目录已有 `render.yaml`，可使用 Render 的 Blueprint 功能一键创建服务：

1. 打开 [render.com](https://render.com) → **New** → **Blueprint**。
2. 选择仓库，Render 会自动读取 `render.yaml`。
3. 手动在 Dashboard 中为 `ALLOWED_ORIGINS` 填写值（`render.yaml` 中标记为 `sync: false`，需手动设置）。

---

### 部署顺序建议

```
1. 先部署后端到 Render → 拿到后端地址
2. 再部署前端到 Vercel → 填写后端地址
3. 再回到 Render → 填写前端地址到 ALLOWED_ORIGINS
4. 验证：前端发请求 → 后端返回结果
```

> **注意**：Render Free 套餐在 15 分钟无请求后会休眠，首次访问可能有约 30 秒冷启动延迟。

---

## 后续扩展

切换分析器时只需修改 `backend/.env`：

```env
ANALYZER_PROVIDER=deepseek   # 第二阶段
ANALYZER_PROVIDER=local      # 本地 NLP
```

前端无需任何改动。
