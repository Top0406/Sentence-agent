# 英语句子结构图解器 — 第一阶段 SPEC

## 0. 本文档目的

本文档定义“英语句子结构图解器”的第一阶段 MVP。

第一阶段重点实现：

1. React/Vite 前端。
2. FastAPI 后端。
3. Mock Analyzer，占位分析器。
4. 稳定的 JSON API。
5. 句子成分颜色高亮展示。
6. 简洁工具风界面。

第一阶段不接入 DeepSeek、OpenAI、Claude 或任何真实大模型 API。

第一阶段的目的不是证明最终语法分析准确率，而是先验证产品骨架是否可行：

- 前端能否把句子发送给后端。
- 后端能否返回结构化 JSON。
- 前端能否根据 JSON 高亮展示句子成分。
- UI 是否清晰可用。
- 分析器模块是否方便后续替换。

---

## 1. 项目目标

本项目是一个面向中国英语学习者的 Web 版英语句子结构图解工具。

用户输入一个英文句子后，系统返回句子结构分析结果，并用颜色高亮的方式展示不同句子成分。

第一阶段目标是完成一个可运行的 Web MVP，用于验证：

1. 前后端通信是否正常。
2. API 返回格式是否稳定。
3. 颜色高亮展示是否清晰。
4. 后续是否容易接入 DeepSeek、免费 API 或本地 NLP 分析器。

---

## 2. 第一阶段范围

第一阶段必须实现：

1. React/Vite 前端。
2. FastAPI 后端。
3. `POST /api/analyze` 接口。
4. Mock Analyzer，占位分析器。
5. 稳定的分析结果 JSON 格式。
6. 英语句子颜色高亮展示。
7. 中文解释展示。
8. 基础错误处理。
9. 简洁工具风 UI。
10. 必要的 `.env.example` 文件。
11. README 本地运行说明。

---

## 3. 第一阶段不做的内容

第一阶段不得实现以下内容：

1. DeepSeek API 接入。
2. OpenAI API 接入。
3. Claude API 接入。
4. 任何真实大模型 API 调用。
5. 登录 / 注册。
6. 用户账号。
7. 数据库。
8. 分析历史记录。
9. mock 计费。
10. 真实支付。
11. 退款系统。
12. 管理后台。
13. 手机原生 APP。
14. 微信小程序。
15. 多语言国际版。
16. 复杂树状图。
17. 完整本地 NLP 解析器。
18. 完整专利级语法分析引擎。

如果 AI coding agent 试图实现以上任何内容，必须停止并询问用户。

---

## 4. 长期架构约束

分析器层必须是可替换的。

第一阶段使用：

```env
ANALYZER_PROVIDER=mock
```

未来可能支持：

```env
ANALYZER_PROVIDER=deepseek
ANALYZER_PROVIDER=openai
ANALYZER_PROVIDER=local
ANALYZER_PROVIDER=free_api
```

前端不得知道当前使用的是哪一种分析器。

后端 API 应调用一个通用分析器接口，而不是在路由函数里硬编码 mock 逻辑。

推荐后端结构：

```text
backend/
  app/
    main.py
    schemas.py
    analyzers/
      base.py
      mock_analyzer.py
```

未来阶段可增加：

```text
backend/
  app/
    analyzers/
      deepseek_analyzer.py
      local_analyzer.py
```

这些未来文件第一阶段不得实现，除非用户明确要求。

---

## 5. 技术栈

### 前端

React + Vite

JavaScript 或 TypeScript 可由实现时根据简洁性决定。

第一阶段优先选择最小可运行实现。

### 后端

FastAPI + Python

### 部署

第一阶段应兼容后续 Vercel 前端部署。

第一阶段不强制实际部署到 Vercel，除非用户明确要求。

### 分析器

仅使用 Mock Analyzer。

第一阶段不需要任何真实模型 API key。

---

## 6. 核心用户流程

1. 用户打开网页。
2. 用户看到简洁工具风界面。
3. 用户输入一个英文句子。
4. 用户点击“分析”按钮。
5. 前端检查输入是否为空。
6. 前端将句子发送到后端：`POST /api/analyze`
7. 后端校验输入。
8. 后端调用 Mock Analyzer。
9. Mock Analyzer 返回确定性的 JSON。
10. 后端把 JSON 返回给前端。
11. 前端展示原句、颜色高亮句子、主句结构摘要、成分列表、从句信息、中文解释和 warnings。

---

## 7. 功能需求

### FR-1：句子输入

前端必须提供一个用于输入英文句子的文本框。

要求：

- 输入不能为空。
- 第一阶段一次只支持一个句子。
- 最大输入长度为 500 个字符。
- 空输入时不得调用后端。
- 输入框必须明显、易用。

验收标准：

- 空输入时显示中文错误提示。
- 有效输入可以发送到后端。
- 过长输入显示错误提示。
- 页面不会崩溃。

---

### FR-2：句子分析 API

后端必须提供：

```http
POST /api/analyze
```

请求体：

```json
{
  "sentence": "The boy who won the prize is my brother."
}
```

成功响应体：

```json
{
  "original_sentence": "The boy who won the prize is my brother.",
  "translation_zh": "获得奖项的那个男孩是我的兄弟。",
  "main_structure": {
    "subject": "The boy who won the prize",
    "predicate": "is",
    "object_or_complement": "my brother"
  },
  "components": [
    {
      "type": "subject",
      "text": "The boy who won the prize",
      "start": 0,
      "end": 27
    },
    {
      "type": "predicate",
      "text": "is",
      "start": 28,
      "end": 30
    },
    {
      "type": "complement",
      "text": "my brother",
      "start": 31,
      "end": 41
    }
  ],
  "clauses": [
    {
      "type": "relative_clause",
      "text": "who won the prize",
      "modifies": "boy",
      "function_zh": "定语从句"
    }
  ],
  "explanation_zh": "主句结构为 The boy ... is my brother，其中 who won the prize 是修饰 boy 的定语从句。",
  "warnings": [
    "当前结果由 Mock Analyzer 返回，仅用于界面和接口测试。"
  ]
}
```

验收标准：

- 后端返回合法 JSON。
- 后端能处理空输入。
- 后端能处理过长输入。
- 后端不调用任何外部大模型 API。
- 第一阶段后端不需要任何 API key。

---

### FR-3：Mock Analyzer

Mock Analyzer 是第一阶段使用的占位分析器。

目的：

1. 验证前后端通信。
2. 验证 JSON schema。
3. 验证颜色高亮。
4. 验证错误处理。
5. 为后续替换成 DeepSeek 或其他分析器做准备。

要求：

- 不调用任何外部 API。
- 不需要 API key。
- 返回格式必须和未来真实分析器保持一致。
- 至少要对以下句子提供较好的固定返回结果：

```text
The boy who won the prize is my brother.
```

对于其他输入，可以返回通用 mock 结果，但仍必须符合相同 JSON 格式。

验收标准：

- Mock Analyzer 可离线运行。
- Mock Analyzer 返回稳定结果。
- API 路由通过可替换接口调用 Mock Analyzer。
- 前端不需要知道当前使用的是 mock。

---

### FR-4：颜色高亮展示

前端必须用颜色高亮展示原句中的句子成分。

至少支持以下成分类型：

| Type | 中文含义 |
|---|---|
| subject | 主语 |
| predicate | 谓语 |
| object | 宾语 |
| complement | 表语 / 补语 |
| modifier | 修饰成分 |
| clause | 从句 |

高亮颜色映射：

| Type | 颜色 |
|---|---|
| subject | 蓝色 |
| predicate | 绿色 |
| object | 橙色 |
| complement | 紫色 |
| modifier | 灰色 |
| clause | 黄色 |

要求：

- 颜色应柔和、易读。
- 同一类型成分必须始终使用同一颜色。
- UI 必须包含小型图例，用于解释颜色含义。
- 如果 `start` 和 `end` 位置无效，前端应降级展示成分列表，而不是崩溃。

验收标准：

- 不同句子成分在视觉上可以区分。
- 用户能理解每种颜色代表什么。
- 无效位置不会导致页面崩溃。

---

### FR-5：结果展示

前端必须展示：

1. 原句。
2. 高亮后的句子。
3. 主句结构摘要。
4. 成分列表。
5. 从句列表。
6. 中文解释。
7. warnings / 提示信息。

结果区域应清晰、紧凑。

---

### FR-6：简洁工具风 UI

第一阶段 MVP 使用简洁工具风设计。

设计原则：

1. 实用、清晰。
2. 不使用复杂动画。
3. 不做营销落地页风格。
4. 不使用复杂背景。
5. 重点突出输入框和分析结果。
6. 颜色主要用于语法成分高亮，而不是装饰。
7. 适合英语学习者使用。

推荐布局：

```text
顶部：
  应用名称
  一句简短说明

主体：
  句子输入框
  分析按钮
  错误 / 加载状态

结果区域：
  高亮句子
  主句结构卡片
  成分列表
  从句列表
  中文解释
  warnings
  图例
```

视觉风格：

- 白色或浅灰背景。
- 卡片式结果区。
- 字体清晰。
- 高亮颜色柔和。
- 装饰元素尽量少。

---

## 8. 错误处理

### 空输入

前端提示：

```text
请输入英文句子
```

后端响应：

```http
400
```

```json
{
  "error": "请输入英文句子"
}
```

### 输入过长

超过 500 个字符时返回：

```http
400
```

```json
{
  "error": "句子过长，请缩短后重试"
}
```

### 后端错误

前端显示：

```text
分析服务暂时不可用，请稍后重试
```

### 响应格式异常

如果后端响应缺少必要字段，前端应显示可读错误提示，而不是崩溃。

---

## 9. 推荐项目结构

```text
sentence-agent/
  SPEC.md
  README.md
  .gitignore

  frontend/
    package.json
    index.html
    vite.config.js
    .env.example
    src/
      main.jsx
      App.jsx
      api/
        client.js
      components/
        SentenceInput.jsx
        HighlightedSentence.jsx
        AnalysisResult.jsx
        Legend.jsx

  backend/
    requirements.txt
    .env.example
    app/
      main.py
      schemas.py
      analyzers/
        base.py
        mock_analyzer.py
```

最终结构可以略有不同，但分析器层必须保持可替换。

---

## 10. 环境变量

### 后端

第一阶段后端 `.env.example`：

```env
ANALYZER_PROVIDER=mock
```

第一阶段不需要模型 API key。

### 前端

前端 `.env.example`：

```env
VITE_API_BASE_URL=http://localhost:8000
```

前端必须使用 `VITE_API_BASE_URL`，不得硬编码后端地址。

---

## 11. 安全要求

即使第一阶段不使用真实 API key，也必须遵守：

1. 不得在前端代码中暴露 API key。
2. 不得提交 `.env`。
3. 必须提供 `.env.example`。
4. 前后端都要校验用户输入。
5. 不得把内部错误堆栈直接暴露给前端。
6. 不得硬编码未来模型 provider 的密钥。
7. 分析器实现只能放在后端。

---

## 12. 本地开发要求

README 应包含前后端本地运行命令。

预期后端命令可能是：

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

预期前端命令可能是：

```bash
cd frontend
npm install
npm run dev
```

具体命令可根据最终项目结构微调。

---

## 13. 测试要求

第一阶段至少手动测试：

```text
1. 空输入
2. 超长输入
3. The boy who won the prize is my brother.
4. I love English.
5. She is a teacher.
```

预期：

- 应用不崩溃。
- 后端返回合法 JSON。
- 前端能尽可能展示高亮句子。
- warnings 能正常显示。
- 错误提示可读。

---

## 14. 第一阶段验收清单

第一阶段完成条件：

- [ ] 前端可以本地运行。
- [ ] 后端可以本地运行。
- [ ] 前端可以调用后端 `/api/analyze`。
- [ ] 后端只使用 Mock Analyzer。
- [ ] 不调用任何真实大模型 API。
- [ ] 不需要任何 API key。
- [ ] 响应 JSON 符合定义的格式。
- [ ] 前端能展示高亮句子。
- [ ] 前端能展示颜色图例。
- [ ] 前端能展示中文解释。
- [ ] 空输入能被处理。
- [ ] 超长输入能被处理。
- [ ] README 说明如何运行项目。
- [ ] 分析器层后续可以被替换。

---

## 15. Agent 工作规则

任何 AI coding agent 在本项目中必须遵守：

1. 修改代码前必须先阅读 `SPEC.md`。
2. 只实现第一阶段功能。
3. 不得实现 DeepSeek、OpenAI、Claude 或任何真实 LLM API。
4. 不得实现登录。
5. 不得实现数据库。
6. 不得实现计费。
7. 不得实现支付。
8. 不得实现管理后台。
9. 不得实现手机 APP 或微信小程序。
10. 不得在前端暴露任何 secret。
11. 必须小步修改。
12. 优先实现简单可运行版本，不要过度架构设计。
13. 如果遇到本文档没有确定的产品决策，必须询问用户。
14. 修改后必须总结改动文件和运行 / 测试方式。

---

## 16. 后续阶段说明

第二阶段可能加入：

1. DeepSeek Analyzer。
2. 真实大模型 API 接入。
3. 模型输出 JSON 校验。
4. 语法分析 prompt 优化。
5. 通过环境变量切换 analyzer provider。

第三阶段可能加入：

1. 数据库。
2. 历史记录。
3. 用户系统。
4. 计费或 mock 计费。
5. 部署强化。

这些后续阶段不得在第一阶段实现。
