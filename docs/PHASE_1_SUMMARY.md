# 第一阶段总结

## 1. 第一阶段目标

验证产品骨架是否可行，不追求语法分析准确率：

- 前端能否把句子发送给后端
- 后端能否返回结构化 JSON
- 前端能否根据 JSON 用颜色高亮展示句子成分
- UI 是否清晰可用
- 分析器模块是否便于后续替换

---

## 2. 已实现功能

| 功能 | 状态 |
|---|---|
| React/Vite 前端 | ✅ |
| FastAPI 后端 | ✅ |
| `POST /api/analyze` 接口 | ✅ |
| Mock Analyzer（占位分析器） | ✅ |
| 固定句子精确 mock 结果 | ✅ |
| 其他输入通用 mock 兜底 | ✅ |
| 句子成分颜色高亮展示 | ✅ |
| 颜色图例 | ✅ |
| 主句结构摘要 | ✅ |
| 成分列表 | ✅ |
| 从句列表 | ✅ |
| 中文解释 | ✅ |
| warnings 展示 | ✅ |
| 前端输入校验（空输入、超长） | ✅ |
| 后端输入校验（400 错误） | ✅ |
| 后端服务不可用时的错误提示 | ✅ |
| 高亮位置无效时的降级展示 | ✅ |
| CORS 可通过环境变量配置 | ✅ |
| Vercel 前端部署配置 | ✅ |
| Render 后端部署配置 | ✅ |

---

## 3. 技术栈

### 前端

| 项目 | 版本 |
|---|---|
| React | ^19.2.5 |
| React DOM | ^19.2.5 |
| Vite | ^8.0.10 |
| @vitejs/plugin-react | ^6.0.1 |

无额外 UI 库，样式全部使用内联 style。

### 后端

| 项目 | 版本 |
|---|---|
| FastAPI | >=0.111.0 |
| Uvicorn | >=0.29.0 |
| Pydantic | >=2.7.0 |
| python-dotenv | >=1.0.0 |
| Python | 3.x（建议 3.11+） |

---

## 4. 项目结构

```
sentence-agent/
  SPEC.md                        # 第一阶段需求规格
  README.md                      # 本地运行 + 部署说明
  render.yaml                    # Render 后端服务定义
  .gitignore

  docs/
    PHASE_1_SUMMARY.md           # 本文件

  frontend/
    vercel.json                  # SPA fallback 规则
    .env.example
    package.json
    vite.config.js
    index.html
    src/
      main.jsx
      App.jsx                    # 主布局，状态管理
      api/
        client.js                # fetch 封装，统一错误处理
      components/
        SentenceInput.jsx        # 输入框 + 前端校验
        HighlightedSentence.jsx  # 按 components 数组渲染高亮
        AnalysisResult.jsx       # 完整结果展示
        Legend.jsx               # 颜色图例 + COLOR_MAP 常量

  backend/
    requirements.txt
    .env.example
    app/
      __init__.py
      main.py                    # FastAPI 入口、CORS、路由、错误处理
      schemas.py                 # Pydantic 请求/响应模型
      analyzers/
        __init__.py
        base.py                  # BaseAnalyzer 抽象基类
        mock_analyzer.py         # Mock 实现
```

---

## 5. 本地运行方式

### 后端（终端一）

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

后端运行在 `http://localhost:8000`，可访问 `/api/health` 确认正常。

### 前端（终端二）

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

前端运行在 `http://localhost:5173`。

---

## 6. 线上部署方式

### 部署顺序

```
1. 后端部署到 Render  →  拿到后端地址
2. 前端部署到 Vercel  →  填写后端地址，拿到前端地址
3. 回到 Render        →  填写前端地址到 ALLOWED_ORIGINS
```

### 后端 → Render

- 仓库根目录已有 `render.yaml`，Render 会自动识别
- Service Type: **Web Service**，Runtime: **Python**，Root Directory: **`backend`**
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 前端 → Vercel

- `frontend/vercel.json` 已配置 SPA fallback
- Root Directory: **`frontend`**，Framework Preset 自动识别为 **Vite**
- Build Command: `npm run build`，Output Directory: `dist`

---

## 7. 前端 Vercel 地址

> 待部署后填写，示例格式：
>
> `https://sentence-agent.vercel.app`

---

## 8. 后端 Render 地址

> 待部署后填写，示例格式：
>
> `https://sentence-agent-backend.onrender.com`

---

## 9. 环境变量说明

### 后端（`backend/.env`）

| 变量 | 默认值 | 说明 |
|---|---|---|
| `ANALYZER_PROVIDER` | `mock` | 分析器类型，第一阶段固定为 `mock` |
| `ALLOWED_ORIGINS` | 空（仅允许 localhost） | 允许跨域的前端地址，逗号分隔；生产环境必须填写 Vercel 地址 |

本地开发不需要任何 API key。

### 前端（`frontend/.env`）

| 变量 | 本地默认值 | 说明 |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000` | 后端地址，Vite 在构建时打入静态包，生产环境必须填写 Render 地址 |

> `VITE_API_BASE_URL` 在 Vercel 构建时确定，部署后无法动态修改，修改后需重新触发构建。

---

## 10. 当前限制

1. **Mock Analyzer 仅精确支持一个句子**：`The boy who won the prize is my brother.`，其他输入返回覆盖全句的通用成分，无法体现真实语法结构。
2. **不支持真实语法分析**：第一阶段不接入任何大模型或 NLP 库。
3. **无用户系统**：无登录、无历史记录、无个人设置。
4. **无数据持久化**：每次分析结果仅在当前页面内存中，刷新即失。
5. **单句输入**：一次只能分析一个句子，最大 500 字符。
6. **Render 冷启动**：Free 套餐 15 分钟无请求后服务休眠，首次访问有约 30 秒延迟。
7. **无 HTTPS 强制**：本地开发为 HTTP，生产由 Vercel/Render 负责 HTTPS，后端无额外 TLS 配置。

---

## 11. 已知问题

1. **通用 mock 主句结构不准确**：非精确匹配句子的 `main_structure.subject` 直接使用去掉句号的原句，无实际语法意义，仅用于保证 JSON 格式合法。
2. **CORS 启动时确定**：`_get_allowed_origins()` 在模块加载时执行，修改 `ALLOWED_ORIGINS` 环境变量后需重启服务才能生效。
3. **无请求超时设置**：前端 `fetch` 未设置 `AbortController` 超时，网络极慢时用户看不到反馈。
4. **Render Free 休眠**：首次请求等待时间长，前端当前仅显示"分析中…"，无冷启动提示。

---

## 12. 下一阶段建议

### 第二阶段：接入真实分析器

- 新增 `backend/app/analyzers/deepseek_analyzer.py`，继承 `BaseAnalyzer`
- 通过 `ANALYZER_PROVIDER=deepseek` 切换，前端零改动
- 设计 prompt，让模型输出符合现有 JSON schema 的结构
- 对模型返回的 JSON 做严格校验（字段完整性、`start/end` 合法性）

### 第二阶段：分析质量提升

- 增加更多精确 mock 句子，覆盖更多句型测试
- 支持 `object` 类型成分（宾语），目前 mock 仅用了 `complement`

### 第三阶段：产品化

- 用户系统与历史记录
- 数据库持久化
- 请求频率限制（rate limiting）
- 前端 fetch 加超时与重试逻辑
- 冷启动预热策略或升级 Render 套餐
