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

## 后续扩展

切换分析器时只需修改 `backend/.env`：

```env
ANALYZER_PROVIDER=deepseek   # 第二阶段
ANALYZER_PROVIDER=local      # 本地 NLP
```

前端无需任何改动。
