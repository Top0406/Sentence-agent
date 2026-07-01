# Phase 4.1 Summary — Inline Annotation Rendering Demo

## 1. 阶段定义

Phase 4 = 原句内嵌语法图解系统。

Phase 4.1 = Inline Annotation Rendering Demo。

本阶段目标是在不接入 parser、不修改后端、不调用外部服务的前提下，验证“在原句本身上直接展示语法图解”的前端 rendering layer 是否可行。

## 2. 本阶段完成内容

- 新增前端静态 annotation demo。
- 建立 `SentenceAnnotation` 数据结构约定。
- 建立 role color map，并按《图解高中英语句子结构》调整主要角色颜色。
- 建立 fontLevel、underlineStyle、backgroundStyle 的视觉映射。
- 实现 `buildAnnotationSegments(sentence, annotations)`，将原句切分为可渲染 segments。
- 实现连续 inline sentence rendering，避免词块卡片化。
- 实现 annotation 点击选择与 detail panel。
- 实现 annotation legend。
- 保留现有 analyze 输入框、按钮、结果展示和 history，不改后端逻辑。

## 3. 新增/修改的主要文件

新增：
- `frontend/src/annotation/types.js`
- `frontend/src/annotation/roleStyleMap.js`
- `frontend/src/annotation/visualStyleMap.js`
- `frontend/src/annotation/buildAnnotationSegments.js`
- `frontend/src/annotation/demoData.js`
- `frontend/src/components/annotation/AnnotatedSentence.jsx`
- `frontend/src/components/annotation/AnnotationDemo.jsx`
- `frontend/src/components/annotation/AnnotationDetailPanel.jsx`
- `frontend/src/components/annotation/AnnotationLegend.jsx`

修改：
- `frontend/src/App.jsx`
- `frontend/src/components/annotation/AnnotationDemo.jsx`

未修改：
- `backend/`
- `frontend/src/api/client.js`
- `frontend/src/api/localHistory.js`
- analyzer 相关文件
- history 相关逻辑

## 4. 当前 demo sentence

```text
The boy who won the prize is my brother, a quiet student reading by the window.
```

当前人工 annotation 覆盖：
- `The boy`：主句主语。
- `who won the prize`：定语从句容器。
- `who`：从句主语。
- `won`：从句谓语。
- `the prize`：从句直接宾语。
- `is my brother`：主句系表结构。
- `a quiet student`：`my brother` 的同位语。
- `quiet`：修饰 `student` 的定语。
- `student`：同位语中心词。
- `reading by the window`：非限定动词短语作后置定语。
- `reading`：非限定动词本身。
- `by the window`：修饰 `reading` 的状语。

## 5. 当前支持的能力

- `SentenceAnnotation`
- role color map
- `fontLevel`
- `underlineStyle`
- `backgroundStyle`
- `relation`
- `targetId`
- `parentId`
- `groupId`
- inline sentence rendering
- detail panel
- legend

## 6. 当前限制

- annotation ranges 仍为人工 demo 数据。
- 不包含 parser。
- 不自动分析输入句子。
- 不调用后端。
- 不调用 LLM / spaCy。
- 不调用外部 NLP 服务。
- 不与 history 集成。
- 不包含 annotation editor。
- 多层 overlap 仍为 MVP 降级处理：segment 保留完整 annotations，但主视觉只选择一个 primary annotation。

## 7. 下一步计划

- 稳定 `SentenceAnnotation` schema。
- 对齐图解书完整视觉规则。
- 增加更多静态测试句，覆盖并列、插入语、补足语、非限定结构、多层从句。
- 开始设计 parser/rule layer。
- 让 parser 输出 `SentenceAnnotation[]`。
- 将 parser 输出与前端图解层联调。
