# Phase 4 Plan — 原句内嵌语法图解系统

## 1. Phase 4 目标

Phase 4 的目标是构建“原句内嵌语法图解系统”：在英文原句本身上直接呈现语法结构，通过颜色、字体层级、下划线、轻量底纹、关系说明和点击解释帮助学习者理解句子。

Phase 4 不再以登录、账号、云端历史或支付为主线。登录和 user-scoped history 仍可作为未来产品化方向，但不属于当前 Phase 4 主目标。

## 2. Phase 4 原则

- annotation rendering layer 与 parser 解耦。
- 前端图解层接收 `sentence` 与 `SentenceAnnotation[]`，不关心 annotation 来源。
- 当前阶段不新增后端 API，不修改 `/api/analyze`，不接入 LLM、spaCy、NLP parser 或外部服务。
- 现有 DeepSeek analyzer、history、backend 保持稳定，避免与 Phase 4 图解层混杂。

## 3. Phase 4.1 — Inline Annotation Rendering Demo

Phase 4.1 是前端静态演示阶段。

范围：
- 使用人工编写的 annotation ranges。
- 在原句中连续 inline 展示语法标注。
- 支持 role color、fontLevel、underlineStyle、backgroundStyle、relation/targetId/parentId/groupId。
- 支持点击 annotation 后在 detail panel 展示解释。
- 支持 legend 展示视觉规则。

不做：
- parser。
- API。
- 后端改动。
- LLM / spaCy / 外部服务。
- annotation editor。
- history 集成。

## 4. Phase 4.2 — Annotation Schema 与图解规则稳定化

目标：
- 稳定 `SentenceAnnotation` schema。
- 完整梳理 role、relation、underlineStyle、backgroundStyle、fontLevel 的含义。
- 继续对齐《图解高中英语句子结构》的颜色和图解规则。
- 明确 overlap、container、nonfinite group、parallel relation 的长期表达方式。
- 建立更系统的 demo sentence 集，用于验证复杂句视觉规则。

## 5. Phase 4.3 — 核心解析引擎 MVP

目标：
- 设计核心解析/rule layer。
- 输入英文句子，输出 `SentenceAnnotation[]`。
- 先覆盖有限句型，不追求完整英语语法。
- 输出必须能被 Phase 4.1 的 rendering layer 直接消费。

约束：
- parser 与 rendering layer 保持解耦。
- 不把 parser 逻辑写进 React 组件。
- 不破坏现有 `/api/analyze`。

## 6. Phase 4.4 — 解析引擎与前端图解层联调

目标：
- 将 parser 输出接入前端图解层。
- 验证 `SentenceAnnotation[]` 在真实 parser 输出下的稳定性。
- 比较 parser 输出与人工 annotation demo 的差异。
- 处理 range 对齐、overlap 降级和错误提示。

## 7. Phase 4.5 — QA、测试句、交付文档

目标：
- 建立 Phase 4 测试句集。
- 记录 parser 输出质量和 rendering 表现。
- 完成端到端 QA。
- 整理交付文档、限制和下一阶段建议。
