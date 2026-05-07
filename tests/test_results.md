# Phase 2.2 测试结果记录

## 说明

对 `tests/test_sentences.md` 中每个测试句调用 `/api/analyze`，记录实际输出评估。

### 评估字段说明

| 字段 | 含义 |
|---|---|
| 输出合理 | Y = 完全合理，P = 部分合理，N = 明显问题 |
| 分类问题 | 成分 type 分类是否准确（填 Y/N 或简述问题） |
| 高亮问题 | start/end 是否准确，是否触发降级（填 Y/N 或简述） |
| 解释过长 | explanation_zh 是否超过 3 句（Y/N） |
| 过度修改 | text 是否包含非原句文字，或 explanation 建议改写（Y/N） |
| 备注 | 其他观察 |

---

## 测试结果总表

| ID | 句子（简） | 输出合理 | 分类问题 | 高亮问题 | 解释过长 | 过度修改 | 备注 |
|---|---|---|---|---|---|---|---|
| T01 | I love English. | Y | N | N | N | N | 三成分准确，start/end 精确，explanation 3句，warnings [] |
| T02 | She is a teacher. | Y | N | N | N | N | S+V+C 正确，predicate 只含 is，complement=a teacher，explanation 2句，warnings [] |
| T03 | Birds sing beautifully. | | | | | | |
| T04 | She gave me a book. | | | | | | |
| T05 | They painted the wall white. | | | | | | |
| T06 | The boy who won the prize... | Y | N | N | N | N | 定语从句正确识别，start/end 精确，explanation 2句；main_structure.subject="The boy"（不含定语从句，属设计选择） |
| T07 | I stayed home because... | Y | N | N | N | N | 原因状语从句识别正确，home 标为 complement（可接受），explanation 2句，warnings [] |
| T08 | What he said surprised me. | Y | N | N | N | N | 名词性主语从句正确标为 type=subject，clauses 里也有 noun_clause，explanation 2句，warnings [] |
| T09 | If it rains tomorrow... | Y | N | N | N | N | 条件状语从句识别正确，predicate 含助动词 will cancel，start/end 精确，explanation 2句，warnings [] |
| T10 | Although she was tired... | Y | N | N | N | N | 让步状语从句正确，working 标为 object（catenative verb 可接受），explanation 2句，warnings [] |
| T11 | The teacher explained that... | | | | | | |
| T12 | The man standing near the door... | | | | | | |
| T13 | What the committee decided... | | | | | | |
| T14 | The fact that she passed... | | | | | | |
| T15 | Although it was raining heavily... | | | | | | |
| T16 | Although the proposal that... | Y | N | N | P | N | 5个从句识别正确，主结构正确，explanation 4句（稍长但可接受），start/end 均给出，warnings [] |
| T17 | My English is not very good... | | | | | | |
| T18 | The reason why I came here... | | | | | | |
| T19 | We should pay more attentions... | | | | | | |
| T20 | I think this movie is very boring... | | | | | | |
| T21 | The students was very excited... | Y | N | N | N | N | 结构正确，"was"保留原文，语法错误在explanation末句注明，warnings [] |
| T22 | Yesterday I go to school... | | | | | | |
| T23 | She is teacher. | | | | | | |
| T24 | I'm looking forward to see you... | | | | | | |
| T25 | He very handsome and kind... | Y | N | N | N | N | predicate=null 正确，modifier 和结果从句识别合理，语法错误在 explanation 中注明，warnings []，text 均保留原文 |
| T26 | The movie was very bored. | | | | | | |
| T27 | I made a mistake that... | | | | | | |
| T28 | She has a very interested personality. | | | | | | |
| T29 | He is good at speak English. | | | | | | |
| T30 | After the president met... | | | | | | |
| T31 | Running through the park... | | | | | | |
| T32 | John told Paul that he had failed... | P | Y | N | N | N | 问题1：that从句在components里标为clause而非object；问题2：代词he歧义未提及 |
| T33 | Visiting relatives can be boring. | | | | | | |
| T34 | Due to the fact that it was raining... | | | | | | |
| T35 | It is important that we should... | | | | | | |
| T36 | The reason is because... | | | | | | |
| T37 | In spite of the fact that... | | | | | | |
| T38 | I very interest in learning English... | P | N | N | N | P | 问题1：修改建议出现在explanation第1句而非仅最后一句；问题2：translation_zh是意译版本而非字面翻译 |
| T39 | Yesterday I go to school and meet... | | | | | | |
| T40 | My mother she always tell me... | | | | | | |
| T41 | Although I don't know many word... | | | | | | |

---

## 分类型汇总

完成所有测试后，在此记录各类型的整体问题：

| 类型 | 主要问题 | 问题率 |
|---|---|---|
| 类型一：简单句（T01–T05） | | |
| 类型二：含常见从句（T06–T11） | | |
| 类型三：长句/多层嵌套（T12–T16） | | |
| 类型四：非母语/不自然（T17–T20） | | |
| 类型五：有明显语法错误（T21–T25） | | |
| 类型六：用词问题（T26–T29） | | |
| 类型七：含义不清/歧义（T30–T33） | | |
| 类型八：正确但可优化（T34–T37） | | |
| 类型九：多处错误（T38–T41） | | |

---

## 详细备注区

记录需要深入分析的句子的完整 JSON 输出和问题描述。

### 格式

```
### T??：句子原文

**实际输出（关键字段）：**
- components: ...
- clauses: ...
- explanation_zh: ...
- warnings: ...

**问题描述：**
...
```

---

### T01：I love English.

**实际输出（关键字段）：**
- components: subject="I"(0,1)，predicate="love"(2,6)，object="English"(7,14)
- clauses: []
- explanation_zh: 该句是简单的主谓宾结构。主语是"I"，谓语动词是"love"，宾语是"English"。没有从句。
- warnings: []

**评估：** 完全合理。三成分均正确，start/end 精确，explanation 3句（刚好在限制内），warnings []。

---

### T16：Although the proposal that...（超长嵌套句）

**实际输出（关键字段）：**
- components: clause(让步状语从句,0,102)，subject="many researchers"(104,120)，predicate="argued"(121,127)，object="that the evidence..."(128,248)
- clauses: 5个，包括 adverbial_clause（让步）、relative_clause×2（修饰 proposal / evidence）、noun_clause（宾语从句）、relative_clause（recommended... 作定语）
- explanation_zh: 4句（主句骨架 + 让步从句 + 宾语从句 + 内层定语从句）
- warnings: []

**评估：** 整体合理（Y），解释稍长（P）。模型正确识别了5层嵌套从句和主句骨架。explanation_zh 4句，超过2-3句限制，但考虑到T16复杂度，可接受。start/end 均给出，未触发降级。与预期不同：原本预期T16可能触发全量降级，实际模型仍给出了全部位置信息。

---

### T21：The students was very excited about the trip.

**实际输出（关键字段）：**
- components: subject="The students"(0,12)，predicate="was"(13,16)，complement="very excited about the trip"(17,44)
- clauses: []
- explanation_zh: 主句主语是"The students"，谓语动词"was"，表语是"very excited about the trip"。注意原句主谓不一致，"students"是复数，应使用"were"。
- warnings: []

**评估：** 完全合理。结构正确，"was"原词保留，语法错误在explanation末句注明，未放进warnings。符合新prompt规则。

---

### T32：John told Paul that he had failed the exam.

**实际输出（关键字段）：**
- components: subject="John"(0,4)，predicate="told"(5,9)，object="Paul"(10,14)，**clause="that he had failed the exam"(15,42)**
- clauses: noun_clause="that he had failed the exam"，function_zh="宾语从句"
- explanation_zh: 主句是"John told Paul"，主语是John，谓语是told，间接宾语是Paul。后面跟一个由that引导的宾语从句"that he had failed the exam"，作直接宾语。
- warnings: []

**问题1（分类）：** that从句在components里标为 type=`clause`，而非 type=`object`。Prompt明确说明"名词性从句作主语/宾语时改用subject/object"，这里未遵守。

**问题2（歧义遗漏）：** "he"的指代歧义（John还是Paul）在explanation和warnings中均未提及，完全忽略了这一歧义结构。

---

### T38：I very interest in learning English because it is very useful language in my daily life.

**实际输出（关键字段）：**
- components: subject="I"(0,1)，modifier="very"(2,6)，predicate="interest"(7,15)，modifier="in learning English"(16,35)，clause="because it is very useful language in my daily life."(36,88)
- clauses: adverbial_clause="because..."，function_zh="原因状语从句"
- explanation_zh: 主句结构为"I interest"，但缺少系动词，**应为"I am interested"**。从句"because..."作原因状语，修饰主句谓语。原句存在语法错误：动词"interest"使用不当，且缺少冠词"a"。
- translation_zh: 我对学习英语非常感兴趣，因为它是我日常生活中非常有用的语言。
- warnings: []

**问题1（修改建议位置）：** 修改建议（"应为'I am interested'"）出现在explanation第1句，而非仅在最后一句。Prompt要求"只能写在explanation_zh的最后一句"。

**问题2（translation_zh）：** 翻译是意译/修正版本（"我对学习英语非常感兴趣"），而非原句字面翻译。Prompt要求"有语法错误也按字面翻译"。

**正确的部分：** text字段均保留原词（"interest" 未被替换），start/end 全部精确，warnings []，因为从句识别正确。

---

## 本轮测试问题汇总（5句）

| 问题类型 | 出现句子 | 描述 |
|---|---|---|
| 名词性从句在components里标为clause（应标为object/subject） | T32 | 宾语从句 type=clause，应为 type=object |
| 歧义/模糊结构未在explanation/warnings说明 | T32 | 代词he的指代歧义完全未提 |
| 修改建议不在explanation最后一句 | T38 | "应为I am interested"出现在第1句 |
| translation_zh未按字面翻译 | T38 | 有语法错误时给出了意译版本 |
| explanation_zh超过3句 | T16 | 4句（复杂句可接受，待确认是否需调整） |

---

### T02：She is a teacher.

**实际输出（关键字段）：**
- components: subject="She"(0,3)，predicate="is"(4,6)，complement="a teacher"(7,16)
- explanation_zh: 主句结构为主系表：主语是She，系动词is，表语a teacher。句子简单，无从句。
- warnings: []

**评估：** 完全合理。predicate 只含 `is`，complement 分类正确，start/end 精确，explanation 2句。

---

### T06：The boy who won the prize is my brother.

**实际输出（关键字段）：**
- components: subject="The boy"(0,7)，clause="who won the prize"(8,25)，predicate="is"(26,28)，complement="my brother"(29,39)
- clauses: relative_clause="who won the prize"，modifies="The boy"，function_zh="定语从句"
- explanation_zh: 主句是"The boy is my brother"，主语是"The boy"，谓语是"is"，表语是"my brother"。从句"who won the prize"是定语从句，修饰主语"The boy"。
- warnings: []

**评估：** 合理。定语从句识别正确，start/end 精确，explanation 2句。注意：main_structure.subject="The boy"（不含定语从句），这是将从句独立拆出的设计，语法上可接受。相对从句在 components 里标为 type=clause（不是 subject/object），符合 prompt 对 clause 类型的定义（定语从句无法归入 object/subject/complement）。

---

### T08：What he said surprised me.

**实际输出（关键字段）：**
- components: subject="What he said"(0,12)，predicate="surprised"(13,22)，object="me"(23,25)
- clauses: noun_clause="What he said"，function_zh="主语从句"
- explanation_zh: 主句骨架是主语从句作主语，谓语动词是surprised，宾语是me。主语从句"What he said"在整个句子中充当主语。
- warnings: []

**评估：** 完全合理。名词性主语从句正确标为 type=subject（而非 clause），这是 T32 prompt 修改后的预期效果，在主语从句场景中已生效。explanation 2句，start/end 精确。

---

### T25：He very handsome and kind, so many girl like him.

**实际输出（关键字段）：**
- components: subject="He"(0,2)，modifier="very handsome and kind"(3,25)，clause="so many girl like him"(27,48)
- clauses: adverbial_clause="so many girl like him"，function_zh="结果状语从句"
- main_structure: subject="He"，predicate=null，object_or_complement=null
- explanation_zh: 主句缺少谓语动词，'very handsome and kind'是形容词短语作主语补足语。'so'引导结果状语从句，从句中主语'many girl'与谓语'like'在数上不一致。
- translation_zh: 他非常英俊和善良，所以很多女孩喜欢他。
- warnings: []

**评估：** 合理。predicate=null 正确处理了缺失谓语，text 全部来自原句，两处语法错误（缺谓语、many girl 复数）均在 explanation 中注明，未放进 warnings。translation_zh 是字面语义翻译，非修正版。

（测试时按需在此追加）
