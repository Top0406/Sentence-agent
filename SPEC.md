# Project SPEC Index

## 1. Project Overview

本项目是“英语句子结构图解器”，目标是为中国英语学习者提供一个 Web 工具：用户输入英文句子后，系统返回句子结构分析结果，并以前端颜色高亮等方式展示句子成分。

项目采用分阶段开发方式。每个阶段的具体需求、范围、限制和验收标准，以对应阶段的 SPEC 文档为准。

---

## 2. Current Phase

当前阶段：

```text
Phase 2.2 — 分析质量优化
```

Phase 2（DeepSeek Analyzer Integration）已完成并上线。当前阶段目标是建立测试集、优化 prompt，提升分析质量和输出稳定性，不新增产品功能。

---

## 3. Spec Documents

请 AI coding agent 在修改代码前阅读以下文档：

```text
docs/PHASE_1_SPEC.md
docs/PHASE_1_SUMMARY.md
docs/PHASE_2_SPEC.md
docs/PHASE_2_SUMMARY.md
```

文档说明：

| 文件 | 作用 |
|---|---|
| `docs/PHASE_1_SPEC.md` | 第一阶段原始需求与验收标准 |
| `docs/PHASE_1_SUMMARY.md` | 第一阶段完成情况、部署情况和限制 |
| `docs/PHASE_2_SPEC.md` | 第二阶段严格需求、限制、验收标准 |
| `docs/PHASE_2_SUMMARY.md` | 第二阶段完成情况（含 Phase 2.1、Phase 2.2 进展） |

---

## 4. Active Development Rule

当前只允许开发：

```text
Phase 2 — DeepSeek Analyzer Integration
```

不得擅自实现以下功能：

1. 登录 / 注册。
2. 用户账号。
3. 数据库。
4. 分析历史记录。
5. mock 计费。
6. 真实支付。
7. 退款系统。
8. 管理后台。
9. 手机 APP。
10. 微信小程序。
11. 多语言国际版。
12. RAG 系统。
13. 文档上传系统。
14. 用户记忆系统。
15. 完整本地 NLP 规则引擎。
16. 任何未在当前阶段 SPEC 中明确允许的功能。

---

## 5. Key Architecture Rule

分析器层必须保持可替换。

当前支持或计划支持：

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

以下内容必须由用户确认，或由用户提供官方文档 / 控制台信息后才能填写：

```text
DeepSeek API endpoint
DeepSeek model name
DeepSeek API price
DeepSeek account quota
DeepSeek JSON / structured output capability
Render production environment variables
Vercel production environment variables
fallback behavior after model failure
```

---

## 7. Security Rule

任何阶段都必须遵守：

1. API key 不得出现在前端代码中。
2. API key 不得提交到 GitHub。
3. API key 不得写入 README。
4. API key 不得写入 `.env.example`。
5. `.env` 必须被 `.gitignore` 忽略。
6. 后端日志不得打印完整 secret。
7. 前端不得直接请求 DeepSeek / OpenAI / Claude 等模型 API。
8. 只有后端可以调用外部模型 API。

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
Render 后端通过 `/api/analyze` 返回 JSON。  

---

## 9. Agent Workflow

AI coding agent 在执行任何任务前必须：

1. 阅读本 `SPEC.md`。
2. 阅读当前阶段相关文档。
3. 总结当前阶段目标、范围、不做的内容和验收标准。
4. 如果存在未确认问题，先询问用户。
5. 在用户确认后再修改文件。
6. 每次只做小步修改。
7. 修改后总结：
   - 修改了哪些文件；
   - 为什么修改；
   - 如何本地运行；
   - 如何测试；
   - 是否影响部署。

---

## 10. Current User-Confirmed Decisions

当前已确认：

1. Phase 1 已完成并部署。
2. Phase 2 目标是接入 DeepSeek Analyzer。
3. Mock Analyzer 必须保留。
4. 前端尽量不改。
5. `/api/analyze` 接口路径保持不变。
6. DeepSeek API key 只能放后端。
7. 未确认的 DeepSeek endpoint、model、价格、额度等不得由 agent 擅自填写。

---

## 11. Current Open Questions

以下问题仍需用户确认：

1. DeepSeek API 是否已经开通？
2. DeepSeek API key 是否已经准备好？
3. DeepSeek API endpoint 是什么？
4. DeepSeek 模型名称使用哪个？
5. DeepSeek 当前价格如何？
6. DeepSeek 账户是否有免费额度或充值余额？
7. DeepSeek 是否支持 JSON mode / structured output？
8. DeepSeek 调用失败时，是返回错误，还是 fallback 到 mock？
9. Render 是否切换到 `ANALYZER_PROVIDER=deepseek`？
10. 是否需要保留 `mock` 作为线上 fallback？

在这些问题确认前，不得擅自实现生产级 DeepSeek 部署。
