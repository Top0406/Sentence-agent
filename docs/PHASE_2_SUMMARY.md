# 第二阶段总结

## 1. 第二阶段目标

在第一阶段 Mock Analyzer MVP 完成并上线的基础上，新增 DeepSeek Analyzer，使系统能够对用户输入的英文句子进行真实的大模型语法结构分析，同时保留 Mock Analyzer 和通过环境变量切换分析器的能力。

核心约束：
- 前端零改动。
- `/api/analyze` 接口路径不变。
- Mock Analyzer 不得删除。
- API key 不得进入代码、文档或前端。

---

## 2. 已实现功能

| 功能 | 状态 |
|---|---|
| Mock Analyzer 保留可用 | ✅ |
| DeepSeek Analyzer 新增 | ✅ |
| 通过 `ANALYZER_PROVIDER` 环境变量切换分析器 | ✅ |
| 未知 `ANALYZER_PROVIDER` 启动时报配置错误 | ✅ |
| DeepSeek API key 只存后端环境变量 | ✅ |
| 启用 JSON mode（`response_format={"type":"json_object"}`） | ✅ |
| 后端对 DeepSeek 返回结果做 JSON parse + schema 校验 | ✅ |
| `start/end` 超出句子长度时重置为 0, 0 并附 warning | ✅ |
| API key 缺失返回可读错误（不崩溃） | ✅ |
| endpoint 缺失返回可读错误 | ✅ |
| 模型名称缺失返回可读错误 | ✅ |
| 网络错误 / 限流 / 服务不可用返回可读错误 | ✅ |
| 请求超时（45 秒）返回可读错误 | ✅ |
| 返回非 JSON 时返回可读错误 | ✅ |
| 字段缺失时返回可读错误 | ✅ |
| `AnalyzerError` 自定义异常统一错误处理 | ✅ |
| 前端零改动 | ✅ |
| `httpx` 异步 HTTP 客户端 | ✅ |
| `backend/.env.example` 更新 | ✅ |
| `README.md` 更新至 Phase 2 | ✅ |
| Render 生产环境切换至 deepseek 模式 | ✅ |
| Vercel 前端调用 Render 后端并显示真实分析结果 | ✅ |

---

## 3. 修改过的主要文件

| 文件 | 类型 | 改动说明 |
|---|---|---|
| `backend/app/analyzers/base.py` | 修改 | 新增 `AnalyzerError` 异常类；`analyze()` 改为 `async def` |
| `backend/app/analyzers/mock_analyzer.py` | 修改 | `analyze()` 加 `async` 关键字，内部逻辑不变 |
| `backend/app/analyzers/deepseek_analyzer.py` | **新建** | 完整 DeepSeek Analyzer 实现 |
| `backend/app/main.py` | 修改 | 新增 deepseek 分支；`/api/analyze` 改为 `async def`；新增 `AnalyzerError` 错误处理 |
| `backend/requirements.txt` | 修改 | 新增 `httpx>=0.27.0` |
| `backend/.env.example` | 修改 | 新增 DeepSeek 变量模板 |
| `README.md` | 修改 | 更新至 Phase 2，新增环境变量说明、常见错误表、测试用例 |

前端文件：**未修改任何内容。**

---

## 4. 当前 Analyzer 切换方式

通过后端环境变量 `ANALYZER_PROVIDER` 切换：

```env
ANALYZER_PROVIDER=mock      # 使用 Mock Analyzer（默认）
ANALYZER_PROVIDER=deepseek  # 使用 DeepSeek Analyzer
```

切换逻辑在 `backend/app/main.py` 的 `_get_analyzer()` 中：

- `mock` → `MockAnalyzer`（离线可用，无需 API key）
- `deepseek` → `DeepSeekAnalyzer`（需要配置 DeepSeek 相关环境变量）
- 其他值 → 服务启动失败，报错 `不支持的 ANALYZER_PROVIDER 值，仅支持 mock 或 deepseek`

前端无法得知当前使用的是哪种分析器，只调用 `/api/analyze`。

---

## 5. DeepSeek 环境变量说明

### 后端 `backend/.env`

| 变量 | 说明 | 第二阶段确认值 |
|---|---|---|
| `ANALYZER_PROVIDER` | 分析器类型 | `mock` 或 `deepseek` |
| `DEEPSEEK_API_KEY` | DeepSeek API key，**只能放后端** | 用户自行在 DeepSeek 平台获取 |
| `DEEPSEEK_BASE_URL` | DeepSeek API endpoint | `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | 使用的模型名称 | `deepseek-chat`（第一轮，复杂句效果不够再评估是否切换 `deepseek-reasoner`） |

调用 endpoint 由代码构造为：

```
{DEEPSEEK_BASE_URL}/v1/chat/completions
```

DeepSeek API 使用 OpenAI 兼容格式，启用 `response_format={"type":"json_object"}` JSON mode，请求超时 45 秒，temperature=0.1。

### 安全规则

- `DEEPSEEK_API_KEY` 不得出现在代码、`.env.example`、README、前端或 GitHub 中。
- 本地使用 `backend/.env`（已被 `.gitignore` 忽略）。
- 生产环境在 Render Dashboard → Environment Variables 中配置。
- 后端日志不打印完整 API key，错误信息只暴露错误类型，不暴露 key 或内部堆栈。

---

## 6. 本地测试方式

### 环境准备

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env，填入 ANALYZER_PROVIDER 和 DeepSeek 相关变量
```

### 启动后端

```bash
uvicorn app.main:app --reload
```

后端运行在 `http://localhost:8000`，可访问 `/api/health` 确认正常。

### Mock 模式测试

将 `.env` 中 `ANALYZER_PROVIDER=mock`，重启服务后：

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"sentence": "The boy who won the prize is my brother."}'
```

预期：返回精确 mock 结果，含定语从句，附 1 条 warning。

### DeepSeek 配置缺失测试

将 `.env` 中 `ANALYZER_PROVIDER=deepseek`，`DEEPSEEK_API_KEY` 留空，重启服务后提交任意句子：

预期：

```json
{"error": "DeepSeek API key 未配置"}
```

服务不崩溃，HTTP 状态码 503。

### DeepSeek 模式测试

将 `.env` 中配置完整，重启服务后：

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"sentence": "I stayed home because it was raining."}'
```

预期：返回真实语法分析 JSON，含主句结构、成分列表、状语从句识别和中文解释。

### 已验证的测试句子

| 句子 | 结果 |
|---|---|
| `I love English.` | 主谓宾正确，`start/end` 精确，无 warnings |
| `She is a teacher.` | 主系表正确 |
| `The boy who won the prize is my brother.` | 主句 + 定语从句正确 |
| `I stayed home because it was raining.` | 主句 + 原因状语从句正确 |
| 复杂嵌套长句（247 字符） | 识别出 5 个从句，中文解释清晰，无 warnings |

---

## 7. Render 部署方式

**当前状态：已完成。** Render 后端已切换至 `ANALYZER_PROVIDER=deepseek`，Vercel 前端已成功调用线上 Render 后端并显示 DeepSeek 真实分析结果。

部署步骤（供参考）：

1. `git push` 推送代码到 GitHub（Render 自动触发重新部署）。
2. 在 Render Dashboard → 你的 Web Service → **Environment Variables** 中填写：

   ```
   ANALYZER_PROVIDER=deepseek
   DEEPSEEK_API_KEY=你的真实 key
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   DEEPSEEK_MODEL=deepseek-chat
   ALLOWED_ORIGINS=https://你的-vercel-url.vercel.app
   ```

3. 保存后 Render 自动重启服务，等待部署完成。
4. 访问 `/api/health` 确认后端正常。
5. 打开 Vercel 前端测试完整流程。

> **注意**：`DEEPSEEK_API_KEY` 只能在 Render Dashboard 中填写，不得出现在 `render.yaml` 或 GitHub 仓库中。

---

## 8. Vercel 前端是否需要修改

**不需要。** 前端只调用 `/api/analyze`，不感知后端使用的分析器类型。

Phase 2 前端零改动，Vercel 无需重新部署（除非 Render 后端地址发生变化）。

---

## 9. 当前已知限制

1. **`start/end` 精度不保证。** DeepSeek 模型有时会给出不准确的字符偏移量，后端会将超出句子长度或逻辑无效（`start >= end`）的位置重置为 `(0, 0)` 并在 warnings 中注明。前端依赖 Phase 1 已有的降级展示逻辑，不会崩溃，但该成分的高亮将失效。
2. **复杂句分析准确率不保证。** 对于多层嵌套从句、超长句子，模型可能给出不完整或有偏差的分析，属于正常行为，会在 warnings 中说明。
3. **无 fallback 到 mock。** DeepSeek 调用失败时返回可读错误，不回退到 mock 结果，不伪造分析结论。
4. **单句输入，最大 500 字符。** 不支持多句或段落分析（前端和后端均有校验）。
5. **无用户系统。** 无登录、无历史记录、无个人设置。
6. **无数据持久化。** 分析结果仅保存在当前页面内存中，刷新后消失。
7. **前端 fetch 无超时设置。** 后端有 45 秒超时，前端侧暂无。
8. **Render Free 冷启动。** 15 分钟无请求后服务休眠，首次响应约需 30 秒。

---

## 10. 复杂句和 start/end 高亮不完全可靠的问题

### 问题描述

DeepSeek 模型在返回 `components` 时，`start` 和 `end` 字段（文本在原句中的字符下标）并不总是精确：

- 对于简单句（`I love English.`），模型通常给出精确偏移，高亮正常。
- 对于含从句的中等复杂句，偏移量通常可用，高亮效果较好。
- 对于多层嵌套的复杂长句，偏移量可能出现轻微偏差，部分成分的高亮区域会与实际文字略有不符。

### 后端处理策略

后端在 `_build_components()` 中对每个 component 做如下校验：

1. 尝试将 `start` 和 `end` 转换为整数；转换失败则视为无效。
2. 检查：`start < 0`、`end < 0`、`start > 句子长度`、`end > 句子长度`、`start >= end`；任一条件成立则视为无效。
3. 无效位置重置为 `(0, 0)`，并在最终响应的 `warnings` 中追加 `"部分成分位置信息不可靠，已降级展示。"`。
4. 轻微偏差（偏移量在范围内但不完全准确）不触发重置，由前端高亮展示出实际文字。

### 前端降级展示

Phase 1 已实现对无效 `start/end` 的降级展示逻辑：当 `start=0, end=0` 时，该成分不参与原句高亮，但仍在成分列表中展示 `type` 和 `text` 字段。

### 后续优化方向

见第 11 节 Phase 2.1 建议。

---

## 11. 后续 Phase 2.1 建议

以下是在不进入 Phase 3 产品化的前提下，可以针对性改善分析质量的方向：

1. **Prompt 优化**：在 prompt 中提供更多字符定位示例，引导模型给出更精确的 `start/end`，例如要求模型在回答前逐字计算偏移。
2. **后端 start/end 修复**：对于偏差较小的位置，在后端通过 `sentence.find(text)` 做二次修正，自动将模型给出的近似偏移对齐到原句中 `text` 的实际位置。
3. **deepseek-reasoner 评估**：对于复杂嵌套句，可以评估 `deepseek-reasoner` 模型是否能给出更准确的结构分析（需同步评估延迟和成本）。
4. **请求重试**：对临时网络错误或限流错误，可以在后端加入简单的指数退避重试（1–2 次），减少用户侧感知到的失败率。
5. **前端超时提示**：前端 fetch 加 `AbortController` 超时（建议 50 秒），在超时时显示比"加载中"更具体的提示。
6. **更多精确 mock 句子**：扩展 Mock Analyzer 的固定句库，覆盖更多常见句型，方便离线调试。

---

## 12. 验收清单（19 / 19 ✅）

| # | 验收项 | 状态 |
|---|---|---|
| 1 | Mock Analyzer 仍可使用 | ✅ |
| 2 | DeepSeek Analyzer 已新增 | ✅ |
| 3 | `ANALYZER_PROVIDER=mock` 时不调用 DeepSeek | ✅ |
| 4 | `ANALYZER_PROVIDER=deepseek` 时调用 DeepSeek | ✅ |
| 5 | DeepSeek API key 只存在后端环境变量中 | ✅ |
| 6 | 前端没有任何 API key | ✅ |
| 7 | `/api/analyze` 接口路径不变 | ✅ |
| 8 | DeepSeek endpoint 不被擅自硬编码 | ✅ |
| 9 | DeepSeek model 不被擅自硬编码 | ✅ |
| 10 | DeepSeek 返回结果被校验 | ✅ |
| 11 | 非 JSON 返回能被处理 | ✅ |
| 12 | 字段缺失能被处理 | ✅ |
| 13 | API 失败能返回可读错误 | ✅ |
| 14 | 配置缺失能返回可读错误 | ✅ |
| 15 | 前端不因真实分析结果崩溃 | ✅ |
| 16 | README 已更新 | ✅ |
| 17 | `.env.example` 已更新 | ✅ |
| 18 | Render 可切换到 deepseek 模式 | ✅ 已完成 |
| 19 | Vercel 前端可调用 Render 后端并显示真实分析结果 | ✅ 已完成 |

---

## Phase 2.1: Component Span Validation

### 目标

DeepSeek Analyzer 已能返回真实语法分析结果，但模型返回的 `components` 中 `start` 和 `end` 字段有时不可靠：位置数值在句子长度范围内，但 `sentence[start:end]` 与 `component.text` 并不相等。这导致前端用错误的字符区间高亮，在原句中标出错误的文字（"乱高亮"）。

Phase 2.1 的目标：后端在返回 `components` 之前，用 `component.text` 回到 `original_sentence` 中重新验证并修正 `start/end`，保证最终返回的每个有效位置满足 `sentence[start:end] == component.text`。

---

### 实现方式

**唯一修改的文件：`backend/app/analyzers/deepseek_analyzer.py`**

新增私有静态方法 `_resolve_span(sentence, text, model_start, model_end)`，在 `_build_components()` 中对每个 component 调用。

验证与修正逻辑（三步）：

1. **精确位置验证（大小写敏感）**：若 `sentence[model_start:model_end] == text`，则位置正确，直接采用。
2. **全句搜索（大小写敏感）**：若步骤 1 失败，在整句中搜索 `text` 的所有出现位置：
   - 唯一匹配：使用该位置。
   - 多处匹配：选取与模型原始 `model_start` 距离最近的位置；若存在平局（两处距离相等），视为无法可靠定位。
3. **全句搜索（大小写不敏感）**：若步骤 2 也失败，用同样逻辑做大小写不敏感搜索。

---

### 降级处理（all-or-nothing）

若任意一个 component 经过三步验证仍无法可靠定位（文本不存在于原句、多处匹配且无法选择、文本为空），则：

- 该批次所有 components 的 `start` 和 `end` 全部重置为 `0, 0`；
- 空文本的 component 直接从列表中删除；
- 在响应的 `warnings` 数组中追加：`"部分成分位置信息不可靠，已降级展示。"`

前端的 all-or-nothing fallback 行为（任一 component `start >= end` 则整组回退至纯文本）与这一设计配合，确保不会出现部分正确、部分错误的混合高亮状态。

---

### 修改的文件

| 文件 | 改动 |
|---|---|
| `backend/app/analyzers/deepseek_analyzer.py` | `_build_components()` 重写：移除旧的手动边界检查，改为调用 `_resolve_span()`；空/纯空白 text 过滤删除；all-or-nothing 重置逻辑 |
| `backend/app/analyzers/deepseek_analyzer.py` | 新增 `_resolve_span()` 静态方法：三步验证 + 就近选择 + 大小写不敏感回退 |

前端文件、`main.py`、`base.py`、`mock_analyzer.py`、`schemas.py`、`/api/analyze` 路径：**均未修改。**

---

### 测试句子与结果

**触发报告问题的句子：**

```
Although it was raining heavily, the students who had prepared for the exam continued studying in the library.
```

**Phase 2.1 修复前（模型返回的错误位置）：**

| component | text | 模型 start | 模型 end | sentence[start:end] |
|---|---|---|---|---|
| predicate | `continued` | 6 | 85 | `"gh it was raining heavily, the students who had prepared for the exam continued"` ✗ |
| object | `studying in the library` | 6 | 109 | `"gh it was raining heavily, the students who had prepared for the exam continued studying in the library"` ✗ |

**Phase 2.1 修复后（本地 DeepSeek 实测）：**

| component | text | 修正后 start | 修正后 end | sentence[start:end] |
|---|---|---|---|---|
| clause | `Although it was raining heavily` | 0 | 31 | ✓ |
| subject | `the students who had prepared for the exam` | 33 | 75 | ✓ |
| predicate | `continued` | 76 | 85 | ✓ |
| object | `studying in the library` | 86 | 109 | ✓ |

无 warnings，所有成分可正常高亮。

---

### 当前限制

1. **高亮可靠性提高，但语法分析准确率不保证。** 位置修正只保证 `sentence[start:end] == text`，不保证模型对句子结构的分析本身是正确的（如成分类型判断、从句识别）。
2. **多处匹配且平局时仍降级。** 若 `component.text` 是原句中频繁出现的短词（如 `"the"`、`"is"`）且出现位置相对模型原始 start 等距，无法自动选择，该批次全部降级为 `(0, 0)`。
3. **空 text component 直接过滤。** 模型偶尔返回空文本的成分，会被删除并触发降级 warning。
4. **前端 all-or-nothing 行为。** 只要有一个 component 无法定位，整句所有高亮均回退为纯文本。这是有意的设计（避免混合正确/错误高亮），但用户体验上会损失部分可靠成分的高亮。

---

## 13. 安全注意事项

以下规则在整个项目生命周期内始终有效：

1. `DEEPSEEK_API_KEY` **不得**出现在：
   - 任何 `.py`、`.js`、`.jsx`、`.ts`、`.tsx` 源代码文件中。
   - `README.md` 或任何文档文件中。
   - `backend/.env.example` 中（只提供空值模板）。
   - 前端代码或浏览器可访问的任何资源中。
   - GitHub 仓库的任何提交历史中。
2. 本地 `backend/.env` 已被 `.gitignore` 忽略，**提交前必须确认 `.env` 不在 `git status` 中**。
3. 生产 API key 只能通过 Render Dashboard → Environment Variables 配置，不得写入 `render.yaml`。
4. 后端日志和错误响应不得包含完整 API key，错误信息只暴露错误类型（如 `"DeepSeek API key 未配置"`）。
5. 前端不得直接请求 DeepSeek API，所有模型调用只能经过后端。
6. 如果 API key 不慎泄漏到 GitHub，应立即在 DeepSeek 控制台吊销该 key 并生成新 key。

---

## Phase 2.2：分析质量优化

### 目标

在 Phase 2.1 解决"乱高亮"问题的基础上，Phase 2.2 专注于提升分析质量和输出稳定性：

1. 建立测试集（41 个代表性句子），覆盖 9 种句型。
2. 建立标准化测试结果记录格式。
3. 分析当前 `_SYSTEM_PROMPT` 的已知问题并优化。

本阶段不新增产品功能，不修改 analyzer 核心逻辑（`analyze`、`_validate_and_build`、`_build_components`、`_resolve_span`）。

---

### 当前 Prompt 问题分析

通过代码审查和 Phase 2 已知测试结果，识别出以下主要问题：

| 问题 | 描述 | 严重程度 |
|---|---|---|
| `explanation_zh` 冗长 | 无长度约束，模型倾向于逐一解释每个成分，输出 4–6 句话 | 中 |
| `warnings` 语义模糊 | 原 prompt 未明确使用场景，模型可能将语法建议、风格意见放入 warnings | 中 |
| 对有错句子过度介入 | 无"不要改写原句"明确说明，模型可能在 explanation 中提供修改建议 | 中 |
| `clause` 类型使用不一致 | 名词性从句应在 components 中标为 subject/object，模型有时统一标为 clause | 低 |
| 正确句子触发多余 warning | 原 prompt "如果不确定则在 warnings 中说明"过于宽泛，正确句子可能出现不必要警告 | 低 |
| `translation_zh` 可能被修正 | 原 prompt 未说明有语法错误的句子应按字面翻译，模型可能翻译修正后的版本 | 低 |

---

### Prompt 调整内容

**修改文件**：`backend/app/analyzers/deepseek_analyzer.py`，只改 `_SYSTEM_PROMPT`，不修改 analyzer 核心逻辑。

**主要改动**：

1. **角色定义**：从"专业英语语法分析助手"改为"英语句子结构分析助手"，更强调结构分析而非纠错功能。

2. **`explanation_zh` 长度约束**：明确要求"2–3 句话，说明主句骨架和从句关系，不要逐一复述每个成分的内容"。

3. **`warnings` 规则重写**：
   - 明确列出 warnings 的合法使用场景（3 种：成分分类不确定、start/end 无法确定、结构过于复杂）
   - 明确列出 warnings 不应包含的内容（语法错误、改写建议、风格意见）
   - 新增："如果句子语法正确且结构清晰，warnings 必须为空数组 []"

4. **处理有语法错误的句子**：新增专门规则
   - `text` 必须是原句原始文字，不得修改或替换
   - `explanation_zh` 只描述结构，不建议改写
   - 如语法错误严重影响结构识别，可在 `explanation_zh` 最后一句简短说明

5. **成分类型说明**：新增各类型使用边界，特别是 `clause`（仅用于状语从句；名词性从句改用 subject/object）

6. **`translation_zh`**：明确"有语法错误也按字面翻译，不翻译修正后的版本"

---

### 测试集

新建文件 `tests/test_sentences.md`，共 41 个测试句：

| 类型 | 数量 | 句子范围 |
|---|---|---|
| 简单句 | 5 | T01–T05 |
| 含常见从句的复杂句 | 6 | T06–T11 |
| 长句和多层嵌套 | 5 | T12–T16 |
| 非母语/表达不自然 | 4 | T17–T20 |
| 有明显语法错误 | 5 | T21–T25 |
| 用词问题 | 4 | T26–T29 |
| 含义不清/歧义 | 4 | T30–T33 |
| 语法正确但可优化 | 4 | T34–T37 |
| 多处错误但不应过度改写 | 4 | T38–T41 |

---

### 测试结果记录

新建文件 `tests/test_results.md`，包含标准化记录表格（待用户实际测试后填写）。

记录字段：输出是否合理（Y/P/N）、分类问题、高亮问题、解释是否过长、是否过度修改、备注。

---

### 如何运行测试

```bash
cd backend
source .venv/bin/activate
# 确认 .env 中 ANALYZER_PROVIDER=deepseek 且 DEEPSEEK_API_KEY 已填写
uvicorn app.main:app --reload
```

对每个测试句发送请求：

```bash
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"sentence": "I love English."}'
```

将输出结果与 `tests/test_sentences.md` 中对应句子的预期关注点对比，填入 `tests/test_results.md`。

---

### 实际测试结果（共 11 句）

分三轮完成，测试句覆盖简单句、常见从句、超长嵌套句、语法错误句、多处错误句：

| 轮次 | 测试句 | 结果 |
|---|---|---|
| 第一轮 | T01, T16, T21, T32, T38 | T01/T16/T21=Y，T32=P，T38=P |
| Prompt 调整 | 针对 T32（名词性宾语从句分类）和 T38（修改建议位置、translation_zh）做两处小改 | — |
| 第二轮 | T02, T06, T08, T25 | 全部 Y |
| 第三轮 | T07, T09, T10 | 全部 Y |

完整记录见 `tests/test_results.md`。

---

### 当前状态（Phase 2.2 初版完成）

- [x] Prompt 优化完成（含两轮小幅调整）
- [x] 测试集（41 句）建立完成（`tests/test_sentences.md`）
- [x] 测试结果记录格式建立完成（`tests/test_results.md`）
- [x] 实际 DeepSeek API 测试：11 句已测，9 句完全合理，2 句有已知小问题
- [x] 根据测试结果完成二轮 prompt 调整

剩余 30 句（T03–T05、T11–T15、T17–T20、T22–T24、T26–T31、T33–T41）待后续按需补测。

---

### Known Issues（不继续深挖，记录存档）

| # | 问题 | 涉及句子 | 严重程度 |
|---|---|---|---|
| KI-1 | that 宾语从句接在双宾语结构后（told Paul that...），components 仍标为 type=clause 而非 type=object | T32 | 低：不影响从句识别，clauses 数组正确 |
| KI-2 | 代词指代歧义（he/she 指代不清）未在 explanation 或 warnings 中主动提及 | T32 | 低：歧义识别属语义分析，超出当前 prompt 可靠控制范围 |
| KI-3 | 有语法错误的句子，修改建议有时出现在 explanation_zh 第一句而非最后一句 | T38 | 低：信息仍在 explanation_zh 内，未进入 text 或 warnings |
| KI-4 | 超长嵌套句（T16 级别）explanation_zh 可能超过 3 句（实测 4 句） | T16 | 低：复杂度高时可接受 |

---

### 后续 Phase 2.3 或 Phase 3 MVP 建议

**Phase 2.3 方向（如需继续优化分析质量）：**
- 补测剩余 30 句，重点关注类型四（非母语表达）、类型七（歧义句）、类型九（多处错误句）
- 针对 KI-2 歧义句，考虑在 warnings 中补充提示（需权衡：过多警告会降低简单句的体验）
- 评估是否需要对 T16 类超长句单独处理（如 explanation 长度上限放宽或分段）

**Phase 3 MVP 方向（产品化）：**
- 用户账号与历史记录
- 数据库持久化（PostgreSQL）
- 请求频率限制（rate limiting）
- 前端 fetch 加超时与重试逻辑
- 冷启动预热或升级 Render 套餐
