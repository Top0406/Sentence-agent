# 英语句子结构图解器 — 第二阶段 SPEC（严格版）

## 0. 本文档目的

本文档定义“英语句子结构图解器”的第二阶段开发范围。

第二阶段的核心目标是：在第一阶段 Mock Analyzer MVP 已经完成并上线的基础上，新增一个真实大模型分析器 DeepSeek Analyzer，使系统能够对用户输入的英文句子进行真实的结构分析。

本版本是严格版 SPEC，核心原则是：

1. 不准瞎猜。
2. 不准擅自决定产品功能。
3. 不准擅自填写 API endpoint、模型名称、价格、额度、返回格式能力、部署配置。
4. 不准擅自实现未确认功能。
5. 所有不确定内容必须标记为 `TBD`。
6. 遇到需要决定的问题，AI coding agent 必须先问用户。
7. 如果没有用户确认或用户提供的官方文档依据，AI coding agent 不得把任何外部服务参数写死进代码或文档。

---

## 1. 当前项目状态

第一阶段已经完成：

1. React/Vite 前端。
2. FastAPI 后端。
3. Mock Analyzer。
4. `POST /api/analyze` 接口。
5. 颜色高亮展示。
6. 简洁工具风 UI。
7. Render 后端部署。
8. Vercel 前端部署。
9. 前后端线上连接。
10. `docs/PHASE_1_SUMMARY.md` 文档。
11. GitHub 仓库已同步。

第二阶段不得重做第一阶段内容，而是在现有架构上新增真实分析器。

---

## 2. 第二阶段目标

第二阶段目标是新增 DeepSeek Analyzer，但必须保持架构可替换。

第二阶段必须实现：

1. 保留现有 Mock Analyzer。
2. 新增 DeepSeek Analyzer。
3. 通过环境变量 `ANALYZER_PROVIDER` 在 `mock` 和 `deepseek` 之间切换。
4. DeepSeek API key 只能放在后端 `.env` 或 Render 环境变量中。
5. DeepSeek Analyzer 返回的数据格式必须与第一阶段 JSON schema 保持兼容。
6. 后端必须校验 DeepSeek 返回结果。
7. 后端必须处理 API 失败、超时、返回非 JSON、字段缺失等情况。
8. 前端尽量不改。
9. README 和文档必须更新，说明如何使用 DeepSeek Analyzer。
10. 所有 DeepSeek 相关 endpoint、模型名称、价格、额度、返回格式能力必须由用户确认后填写。

---

## 3. 第二阶段不做的内容

第二阶段不得实现以下内容：

1. 登录 / 注册。
2. 用户账号。
3. 数据库。
4. 分析历史记录。
5. mock 计费。
6. 真实支付。
7. 退款系统。
8. 管理后台。
9. 手机原生 APP。
10. 微信小程序。
11. 多语言国际版。
12. 完整本地 NLP 解析器。
13. 完整专利级语法分析引擎。
14. RAG 系统。
15. 文档上传系统。
16. 用户个性化记忆。
17. 任何前端大规模重构。
18. 任何将 API key 暴露给前端的实现。
19. 任何成本统计、余额扣费、用户套餐逻辑。
20. 任何自动购买、充值、支付、退款相关逻辑。

如果 AI coding agent 试图实现以上任何内容，必须停止并询问用户。

---

## 4. 严格禁止 AI Agent 擅自决定的内容

以下内容必须由用户确认，或由用户提供官方文档/控制台信息后才能填写：

### 4.1 API Endpoint

不得擅自写死：

```env
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

除非用户确认或提供官方文档依据。

在用户确认前，必须写成：

```env
DEEPSEEK_BASE_URL=TBD
```

### 4.2 模型名称

不得擅自写死任何模型名称，例如：

```env
DEEPSEEK_MODEL=deepseek-chat
```

除非用户确认或提供官方文档依据。

在用户确认前，必须写成：

```env
DEEPSEEK_MODEL=TBD
```

### 4.3 价格

不得在文档中擅自写具体价格。

不得写：

```text
每 100 万 tokens 多少钱
```

除非用户确认或提供官方价格页信息。

只能写：

```text
价格：TBD，由用户在 DeepSeek 控制台或官方价格页确认。
```

### 4.4 额度

不得擅自假设：

- 是否有免费额度；
- 是否必须充值；
- 是否有每日限额；
- 是否有 QPS / RPM / TPM 限流；
- 是否支持某种地区付款方式。

这些都必须标记为 `TBD`，由用户确认。

### 4.5 返回格式能力

不得擅自假设 DeepSeek 一定支持：

- JSON mode；
- structured output；
- function calling；
- tool calling；
- schema-constrained decoding。

如果没有用户确认或官方文档依据，必须按普通文本返回处理，并在后端进行 JSON 解析与校验。

### 4.6 部署配置

不得擅自改动 Render / Vercel 生产环境变量。

任何生产环境变量修改都必须由用户确认后执行。

### 4.7 Fallback 策略

如果 DeepSeek 分析失败，应该：

- 返回错误；
- 返回 warning；
- 回退 mock；
- 还是让用户重试；

这些属于产品行为，必须由用户确认。

默认第二阶段建议采用：

```text
返回可读错误 + 不伪造分析结果
```

但最终行为仍需用户确认。

---

## 5. 长期架构约束

分析器层必须继续保持可替换。

第二阶段支持：

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

前端不得知道当前使用的是哪一种分析器。

后端 API 应调用统一分析器接口，而不是在路由函数中直接写 DeepSeek 调用逻辑。

推荐后端结构：

```text
backend/
  app/
    main.py
    schemas.py
    analyzers/
      base.py
      mock_analyzer.py
      deepseek_analyzer.py
      factory.py
```

其中：

- `base.py`：定义通用分析器接口。
- `mock_analyzer.py`：第一阶段 Mock Analyzer。
- `deepseek_analyzer.py`：第二阶段新增 DeepSeek Analyzer。
- `factory.py`：根据 `ANALYZER_PROVIDER` 选择分析器。
- `main.py`：只调用通用 analyzer，不直接写 DeepSeek 逻辑。

---

## 6. 技术栈

### 前端

```text
React + Vite
```

第二阶段前端尽量不改。

### 后端

```text
FastAPI + Python
```

### 分析器

```text
Mock Analyzer + DeepSeek Analyzer
```

### 部署

```text
前端：Vercel
后端：Render
```

### DeepSeek API 配置

在用户确认前，DeepSeek 配置必须写成：

```env
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=TBD
DEEPSEEK_MODEL=TBD
```

说明：

- `DEEPSEEK_API_KEY` 由用户在 DeepSeek 平台创建。
- `DEEPSEEK_BASE_URL` 必须由用户确认。
- `DEEPSEEK_MODEL` 必须由用户确认。
- AI agent 不得擅自填写。
- AI agent 不得把真实 key 写入任何文件。

---

## 7. 核心用户流程

1. 用户打开 Vercel 前端网页。
2. 用户输入一个英文句子。
3. 用户点击“分析”按钮。
4. 前端发送请求到后端：

```http
POST /api/analyze
```

5. 后端读取环境变量 `ANALYZER_PROVIDER`。
6. 如果值为 `mock`，后端调用 Mock Analyzer。
7. 如果值为 `deepseek`，后端调用 DeepSeek Analyzer。
8. DeepSeek Analyzer 检查必要环境变量是否存在。
9. 如果缺少 `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL` 或 `DEEPSEEK_MODEL`，后端返回配置错误。
10. 如果配置完整，DeepSeek Analyzer 构造 prompt，请求 DeepSeek API。
11. DeepSeek 返回结果。
12. 后端解析并校验返回 JSON。
13. 如果结果合法，后端返回统一 JSON 给前端。
14. 如果结果异常，后端返回可读错误或用户确认后的 fallback。
15. 前端继续使用第一阶段展示逻辑显示结果。

---

## 8. 功能需求

## FR-1：保留 Mock Analyzer

第二阶段必须保留第一阶段的 Mock Analyzer。

要求：

- `ANALYZER_PROVIDER=mock` 时，系统行为应与第一阶段一致。
- Mock Analyzer 不得被删除。
- Mock Analyzer 不得依赖 DeepSeek API。
- Mock Analyzer 仍可离线运行。

验收标准：

- 设置 `ANALYZER_PROVIDER=mock` 后，本地和 Render 后端仍能返回 mock JSON。
- 第一阶段测试句子仍能显示高亮结果。
- 前端无需知道当前是 mock 模式。

---

## FR-2：新增 DeepSeek Analyzer

后端必须新增 DeepSeek Analyzer。

要求：

- DeepSeek Analyzer 必须放在后端。
- DeepSeek Analyzer 必须通过统一 analyzer 接口被调用。
- 不得在前端调用 DeepSeek API。
- 不得在前端保存 DeepSeek API key。
- DeepSeek Analyzer 必须使用后端环境变量读取 API key。
- DeepSeek Analyzer 返回结果必须适配现有前端。
- DeepSeek Analyzer 不得硬编码 endpoint。
- DeepSeek Analyzer 不得硬编码 model name。
- DeepSeek Analyzer 不得硬编码价格或额度。

验收标准：

- 设置 `ANALYZER_PROVIDER=deepseek` 后，后端尝试调用 DeepSeek API。
- 返回结果符合第一阶段 JSON schema。
- 前端可以正常展示结果。
- API key 不出现在前端代码、浏览器请求、GitHub 仓库或日志中。
- 如果 endpoint 或 model 未配置，后端返回清晰配置错误。

---

## FR-3：Analyzer Factory

后端应实现 analyzer factory，用于根据环境变量选择分析器。

逻辑：

```text
ANALYZER_PROVIDER=mock      -> MockAnalyzer
ANALYZER_PROVIDER=deepseek  -> DeepSeekAnalyzer
```

如果 `ANALYZER_PROVIDER` 缺失，默认使用：

```env
ANALYZER_PROVIDER=mock
```

如果 `ANALYZER_PROVIDER` 是未知值，后端应返回清晰错误，或默认回退到 mock。

默认建议：

```text
未知 provider 返回配置错误，不擅自 fallback。
```

最终行为如需变化，必须询问用户。

验收标准：

- 切换 `.env` 中的 `ANALYZER_PROVIDER` 后，后端可切换分析器。
- `/api/analyze` 路由不需要修改即可切换分析器。
- 未知 provider 不导致后端崩溃。

---

## FR-4：DeepSeek Prompt

DeepSeek Analyzer 必须构造明确 prompt，要求模型返回固定 JSON。

Prompt 必须要求：

1. 只返回 JSON。
2. 不返回 Markdown。
3. 不返回解释性外层文字。
4. 字段名必须使用约定 schema。
5. 面向中国英语学习者输出中文解释。
6. 如果不确定，应在 `warnings` 中说明。
7. 不得编造原句中不存在的词。
8. `components` 的 `text` 必须来自原句。
9. `components` 的 `start` 和 `end` 必须尽量匹配原句字符位置。
10. 如果无法可靠给出 `start/end`，应返回 warning。
11. 对复杂句允许承认不确定，不得强行给确定结论。

---

## FR-5：统一 JSON Schema

DeepSeek Analyzer 必须返回与第一阶段兼容的 JSON。

成功响应体必须包含：

```json
{
  "original_sentence": "string",
  "translation_zh": "string",
  "main_structure": {
    "subject": "string",
    "predicate": "string",
    "object_or_complement": "string"
  },
  "components": [
    {
      "type": "string",
      "text": "string",
      "start": 0,
      "end": 0
    }
  ],
  "clauses": [
    {
      "type": "string",
      "text": "string",
      "modifies": "string",
      "function_zh": "string"
    }
  ],
  "explanation_zh": "string",
  "warnings": []
}
```

允许新增字段，但不得删除前端当前依赖的字段。

最低必须保留：

- `original_sentence`
- `translation_zh`
- `main_structure`
- `components`
- `clauses`
- `explanation_zh`
- `warnings`

验收标准：

- 前端不因字段缺失而崩溃。
- 后端能识别缺失字段并返回错误或 fallback。
- DeepSeek 结果即使不完美，也必须保持 JSON 结构稳定。

---

## FR-6：JSON 校验与修复

DeepSeek 返回结果必须经过后端校验。

后端必须检查：

1. 是否是合法 JSON。
2. 是否包含必要字段。
3. `components` 是否是数组。
4. `clauses` 是否是数组。
5. `start/end` 是否为数字。
6. `start/end` 是否在原句长度范围内。
7. `component.text` 是否合理。
8. `warnings` 是否存在，不存在则补为空数组。

如果校验失败，后端应返回清晰错误，或执行用户确认后的 fallback。

默认建议：

```json
{
  "error": "分析结果格式异常，请稍后重试"
}
```

不得在校验失败时伪造一个看似确定的分析结果。

---

## FR-7：错误处理

第二阶段必须处理以下错误：

### DeepSeek API key 缺失

如果 `ANALYZER_PROVIDER=deepseek` 但未设置 `DEEPSEEK_API_KEY`，后端应返回：

```json
{
  "error": "DeepSeek API key 未配置"
}
```

不得崩溃。

### DeepSeek endpoint 缺失

如果 `DEEPSEEK_BASE_URL` 缺失或仍为 `TBD`，后端应返回：

```json
{
  "error": "DeepSeek API endpoint 未配置"
}
```

### DeepSeek 模型名称缺失

如果 `DEEPSEEK_MODEL` 缺失或仍为 `TBD`，后端应返回：

```json
{
  "error": "DeepSeek 模型名称未配置"
}
```

### DeepSeek API 请求失败

包括网络失败、限流、额度不足、服务不可用。

前端应显示：

```text
分析服务暂时不可用，请稍后重试
```

### DeepSeek 返回非 JSON

后端应捕获并返回可读错误。

### DeepSeek 返回字段缺失

后端应校验并 fallback。

### 请求超时

必须设置合理超时。

超时时应返回可读错误。

---

## FR-8：环境变量

后端 `.env.example` 应新增 DeepSeek 相关变量示例：

```env
ANALYZER_PROVIDER=mock

DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=TBD
DEEPSEEK_MODEL=TBD
```

说明：

- `DEEPSEEK_API_KEY` 不得填写真实 key。
- `.env.example` 只提供模板。
- 真实 key 只能写在本地 `.env` 或 Render Environment Variables 中。
- `.env` 不得提交 GitHub。
- `DEEPSEEK_BASE_URL` 和 `DEEPSEEK_MODEL` 必须由用户确认后填写。

Render 环境变量示例：

```env
ANALYZER_PROVIDER=deepseek
DEEPSEEK_API_KEY=真实 key
DEEPSEEK_BASE_URL=用户确认后的 endpoint
DEEPSEEK_MODEL=用户确认后的模型名
ALLOWED_ORIGINS=https://你的-vercel-url.vercel.app
```

---

## FR-9：README 更新

README 必须新增第二阶段说明。

至少包括：

1. Phase 2 目标。
2. 如何保持 mock 模式。
3. 如何启用 deepseek 模式。
4. 本地 `.env` 示例。
5. Render 环境变量配置方式。
6. DeepSeek API key 安全说明。
7. 哪些 DeepSeek 参数需要用户确认。
8. 常见错误：
   - key 缺失
   - endpoint 缺失
   - model 缺失
   - 额度不足
   - JSON 解析失败
   - CORS 错误
   - Render 未重启
9. 不得把 API key 提交到 GitHub。

README 不得包含真实 API key。

---

## 9. 安全要求

第二阶段必须遵守：

1. DeepSeek API key 不得出现在前端代码中。
2. DeepSeek API key 不得出现在 GitHub 中。
3. DeepSeek API key 不得出现在 README 中。
4. DeepSeek API key 不得出现在 `.env.example` 中。
5. `.env` 必须被 `.gitignore` 忽略。
6. 后端日志不得打印完整 API key。
7. 前端不得直接请求 DeepSeek API。
8. 只有后端可以请求 DeepSeek API。
9. 错误信息不得暴露完整内部异常堆栈。
10. 如果需要打印配置，只能打印 provider 名称，不能打印 secret。
11. 不得在代码注释中粘贴 API key。
12. 不得把用户输入和 API key 一起打印到日志中。

---

## 10. 测试要求

第二阶段至少测试以下模式：

### Mock 模式

```env
ANALYZER_PROVIDER=mock
```

测试句子：

```text
The boy who won the prize is my brother.
I love English.
She is a teacher.
```

预期：

- 行为与第一阶段一致。
- 不调用 DeepSeek。
- 不需要 API key。

### DeepSeek 配置缺失模式

```env
ANALYZER_PROVIDER=deepseek
DEEPSEEK_API_KEY=
DEEPSEEK_BASE_URL=TBD
DEEPSEEK_MODEL=TBD
```

预期：

- 后端不崩溃。
- 返回清晰配置错误。
- 不调用无效 endpoint。

### DeepSeek 模式

只有当用户确认以下信息后才测试：

```env
ANALYZER_PROVIDER=deepseek
DEEPSEEK_API_KEY=用户提供的真实 key
DEEPSEEK_BASE_URL=用户确认后的 endpoint
DEEPSEEK_MODEL=用户确认后的模型名
```

测试句子：

```text
I love English.
She is a teacher.
The boy who won the prize is my brother.
I stayed home because it was raining.
What he said surprised me.
The man standing near the door is my uncle.
Although the proposal that the committee had been reviewing for several months was eventually approved, many researchers argued that the evidence on which it relied was still too limited to justify the policy changes recommended in the final report.
```

预期：

- 后端返回合法 JSON。
- 前端不崩溃。
- 简单句能较合理分析。
- 复杂句允许有 warnings。
- `components` 尽量可高亮。
- 无法可靠分析时，不得胡乱伪造确定结论。

---

## 11. 部署要求

第二阶段部署流程：

1. 本地完成 DeepSeek Analyzer。
2. 本地测试 mock 模式。
3. 本地测试 deepseek 配置缺失模式。
4. 用户确认 DeepSeek endpoint、model、API key 后，本地测试 deepseek 模式。
5. commit 并 push 到 GitHub。
6. Render 自动部署后端。
7. 在 Render Environment Variables 中设置：
   - `ANALYZER_PROVIDER=deepseek`
   - `DEEPSEEK_API_KEY=真实 key`
   - `DEEPSEEK_BASE_URL=用户确认后的 endpoint`
   - `DEEPSEEK_MODEL=用户确认后的模型名`
8. Vercel 前端通常无需修改。
9. 若前端有新 build，则 Vercel 自动部署。
10. 打开 Vercel 前端测试。

AI agent 不得自行登录 DeepSeek、Render 或 Vercel 账号修改生产配置，除非用户明确要求并实时确认。

---

## 12. 第二阶段验收清单

第二阶段完成条件：

- [ ] Mock Analyzer 仍可使用。
- [ ] DeepSeek Analyzer 已新增。
- [ ] `ANALYZER_PROVIDER=mock` 时不调用 DeepSeek。
- [ ] `ANALYZER_PROVIDER=deepseek` 时调用 DeepSeek。
- [ ] DeepSeek API key 只存在后端环境变量中。
- [ ] 前端没有任何 API key。
- [ ] `/api/analyze` 接口路径不变。
- [ ] DeepSeek endpoint 不被擅自硬编码。
- [ ] DeepSeek model 不被擅自硬编码。
- [ ] DeepSeek 返回结果被校验。
- [ ] 非 JSON 返回能被处理。
- [ ] 字段缺失能被处理。
- [ ] API 失败能返回可读错误。
- [ ] 配置缺失能返回可读错误。
- [ ] 前端不因真实分析结果崩溃。
- [ ] README 已更新。
- [ ] `.env.example` 已更新。
- [ ] Render 可切换到 deepseek 模式。
- [ ] Vercel 前端可调用 Render 后端并显示真实分析结果。

---

## 13. Agent 工作规则

任何 AI coding agent 在第二阶段必须遵守：

1. 修改代码前必须阅读 `SPEC.md`、`docs/PHASE_1_SUMMARY.md` 和本文件。
2. 不得删除 Mock Analyzer。
3. 不得重写前端核心 UI。
4. 不得实现登录。
5. 不得实现数据库。
6. 不得实现计费。
7. 不得实现支付。
8. 不得实现管理后台。
9. 不得实现 APP 或微信小程序。
10. 不得把 DeepSeek API key 写入代码。
11. 不得把 DeepSeek API key 写入文档。
12. 不得把 DeepSeek API key 提交到 GitHub。
13. 不得擅自填写 endpoint。
14. 不得擅自填写模型名称。
15. 不得擅自填写价格。
16. 不得擅自填写额度。
17. 不得擅自假设 JSON mode / structured output 能力。
18. 不得擅自改动生产部署配置。
19. 每次只做小步修改。
20. 遇到模型名称、价格、账号、额度、专利规则、fallback 行为等不确定问题，必须询问用户。
21. 修改后必须总结改动文件、运行方式和测试结果。

---

## 14. 用户需要确认的问题

以下问题在实现或部署前需要用户确认：

1. DeepSeek API 是否已经开通？
2. DeepSeek API key 是否已准备好？
3. DeepSeek API endpoint 是什么？
4. DeepSeek 模型名称使用哪个？
5. DeepSeek 当前价格如何？
6. DeepSeek 账户是否有免费额度或充值余额？
7. DeepSeek 是否支持 JSON mode 或 structured output？
8. 如果不支持 JSON mode，是否接受 prompt-only JSON + 后端校验？
9. Render 上是否切换到 `ANALYZER_PROVIDER=deepseek`？
10. 是否保留 mock 模式作为 fallback？
11. 如果 DeepSeek API 失败，前端显示错误还是回退 mock？
12. 如果 DeepSeek 输出与预期不一致，是否允许后端返回 warning 而不是强行给确定答案？

在这些问题未确认前，AI coding agent 不得擅自填入模型名称、endpoint、价格、额度或生产环境配置。
