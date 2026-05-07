# Phase 2.2 测试集

## 概述

共 41 个代表性测试句，覆盖 9 种类型，用于系统评估 DeepSeek Analyzer 的分析质量和 prompt 输出稳定性。

测试结果记录在 `tests/test_results.md`。

## 使用方式

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

---

## 类型一：简单句（T01–T05）

**关注重点**：成分标注是否精准；start/end 是否准确；explanation 是否简洁；无明显问题时 warnings 是否为 []。

| ID | 句子 |
|---|---|
| T01 | I love English. |
| T02 | She is a teacher. |
| T03 | Birds sing beautifully. |
| T04 | She gave me a book. |
| T05 | They painted the wall white. |

### 各句预期关注点

**T01**：S+V+O 三成分是否都标出；start/end 是否精确；warnings 是否为 []。

**T02**：predicate 是否只含 `is`（不含 a teacher）；complement 分类是否正确（表语而非宾语）；warnings 是否为 []。

**T03**：`beautifully` 是否标为 modifier；`main_structure.object_or_complement` 是否为 null；warnings 是否为 []。

**T04**：双宾语结构（`me` = 间接宾语，`a book` = 直接宾语），是否两个都标为 object 或有合理区分；explanation 是否简洁。

**T05**：`the wall` = object，`white` = complement（宾语补足语）；分类是否稳定；explanation 是否不超过 3 句。

---

## 类型二：含常见从句的复杂句（T06–T11）

**关注重点**：从句类型识别是否正确；clauses 数组与 components 是否出现重复；function_zh 描述是否准确。

| ID | 句子 |
|---|---|
| T06 | The boy who won the prize is my brother. |
| T07 | I stayed home because it was raining. |
| T08 | What he said surprised me. |
| T09 | If it rains tomorrow, we will cancel the trip. |
| T10 | Although she was tired, she kept working. |
| T11 | The teacher explained that the exam would be postponed. |

### 各句预期关注点

**T06**：定语从句是否在 clauses 中（type=relative_clause，modifies=boy）；components 里是否重复标注 `who won the prize`；高亮范围是否避开从句与主句成分重叠。

**T07**：`because it was raining` 识别为 adverbial_clause；function_zh 是否为"原因状语从句"；主句成分（I / stayed home）是否分别标出。

**T08**：`What he said` 是名词性主语从句，在 clauses 中 type=noun_clause；在 components 中是否标为 type=subject；clauses.modifies 是否为 null。

**T09**：条件从句（if 引导）识别是否正确；主句 `we will cancel the trip` 成分是否分开；predicate 是否包含助动词 `will`。

**T10**：让步从句（although 引导）类型；逗号后主句 `she kept working` 成分是否正确；explanation 不超过 3 句。

**T11**：宾语从句（that 引导）在 clauses 中；components 是否标为 object；`that the exam would be postponed` 的 start/end 是否准确。

---

## 类型三：长句和多层嵌套（T12–T16）

**关注重点**：高亮可靠性；start/end 是否触发 all-or-nothing 降级；explanation 长度（是否超过 5 句）；是否过度拆分成分。

| ID | 句子 |
|---|---|
| T12 | The man standing near the door is my uncle. |
| T13 | What the committee decided after three weeks of debate will affect thousands of students. |
| T14 | The fact that she passed the exam despite studying only one night shows her exceptional ability. |
| T15 | Although it was raining heavily, the students who had prepared for the exam continued studying in the library. |
| T16 | Although the proposal that the committee had been reviewing for several months was eventually approved, many researchers argued that the evidence on which it relied was still too limited to justify the policy changes recommended in the final report. |

### 各句预期关注点

**T12**：`standing near the door` 是分词短语作定语，应标为 modifier，不应出现在 clauses；高亮范围是否正确。

**T13**：`What the committee decided` 是名词性主语从句，应在 components 中 type=subject；`after three weeks of debate` 是介词短语 modifier；start/end 是否准确。

**T14**：`that she passed the exam despite studying only one night` 是同位语从句（appositive_clause）；`the fact` 作主语；explanation 是否说明同位语结构。

**T15**：Phase 2.1 的修复测试句。验证 `_resolve_span()` 修复后高亮是否正确；predicate=`continued`、object=`studying in the library` 的 start/end 是否精确；无 warnings。

**T16**：Phase 2 spec 的超长嵌套句。预期可能全部降级为 (0,0) 并触发 warning；explanation 不应超过 5 句；warnings 应说明"结构过于复杂，分析可能有遗漏"，而非大量列出每个子从句的详细说明。

---

## 类型四：非母语/表达不自然（T17–T20）

**关注重点**：是否如实分析结构（不拒绝分析）；explanation 是否添加"建议改写"类内容；warnings 是否混入风格建议。

| ID | 句子 |
|---|---|
| T17 | My English is not very good, please forgive me. |
| T18 | The reason why I came here is because I wanted to see you. |
| T19 | We should pay more attentions to protect the environment. |
| T20 | I think this movie is very boring and I don't like it at all and I will not watch it again. |

### 各句预期关注点

**T17**：两个分句用逗号连接（comma splice），语法上有争议但可分析；是否如实分析结构；explanation 不添加"应改为句号"类建议。

**T18**：`reason...because` 冗余结构（常见非母语错误）；是否识别出 because 从句；text 来自原句；不在 explanation 中建议改为 `reason...that`。

**T19**：`attentions` 不可数名词误用复数；text 保留原词 `attentions`；`to protect the environment` 的分类（adverbial / complement）是否合理。

**T20**：多个 `and` 串联的松散句；是否给出主干分析；explanation 是否不超过 3 句；不建议"拆成短句"。

---

## 类型五：有明显语法错误（T21–T25）

**关注重点**：是否仍给出结构分析（不因错误而拒绝）；components 的 text 是否保持原始文字；warnings 是否简洁（不超过 2 条）。

| ID | 句子 |
|---|---|
| T21 | The students was very excited about the trip. |
| T22 | Yesterday I go to school and my teacher say I need more practice. |
| T23 | She is teacher. |
| T24 | I'm looking forward to see you next week. |
| T25 | He very handsome and kind, so many girl like him. |

### 各句预期关注点

**T21**：主谓不一致（students + was）；仍分析为 S+V+C；components 的 text 包含原词 `was`；是否在 explanation 末尾简短注明语法问题。

**T22**：go/say 时态错误；能否识别出两个并列分句；text 保持 `go`/`say` 原词；explanation 不建议改为 went/said。

**T23**：缺冠词（`a teacher`）；结构分析仍为 S+V+C；是否如实分析而非拒绝处理。

**T24**：`looking forward to see` 应为 `looking forward to seeing`；predicate = `am looking forward to`；成分标注是否合理。

**T25**：缺谓语动词（`He is very handsome` 的 `is` 缺失）；predicate 是否为 null 或给出合理处理；`many girl` 名词复数错误是否注明。

---

## 类型六：用词问题（T26–T29）

**关注重点**：components 的 text 是否来自原句（不修正词）；explanation 是否不建议替换原词。

| ID | 句子 |
|---|---|
| T26 | The movie was very bored. |
| T27 | I made a mistake that I forgot to bring my homework. |
| T28 | She has a very interested personality. |
| T29 | He is good at speak English. |

### 各句预期关注点

**T26**：complement = `bored`（原词，不替换为 boring）；是否在 explanation 末尾简短提到用词问题，而非在 explanation 主体中建议改写。

**T27**：`that I forgot to bring my homework` 的从句类型（同位语从句？宾语从句？）；text 来自原句；explanation 不提"应改为 of forgetting"。

**T28**：`interested` 作 modifier（原词保留）；是否在 explanation 末尾简短提到形容词方向性错误。

**T29**：`speak` 原词保留（不替换为 speaking）；`at speak English` 的成分分类是否合理。

---

## 类型七：含义不清/歧义句（T30–T33）

**关注重点**：是否在 explanation 或 warnings 中说明歧义；是否不强行给出唯一确定解读。

| ID | 句子 |
|---|---|
| T30 | After the president met the senator, he left for Paris. |
| T31 | Running through the park, my keys fell out of my pocket. |
| T32 | John told Paul that he had failed the exam. |
| T33 | Visiting relatives can be boring. |

### 各句预期关注点

**T30**：`he` 指代歧义（president 还是 senator）；是否在 warnings 或 explanation 中提到；主结构分析是否合理。

**T31**：悬垂分词（dangling modifier），逻辑主语不一致；`Running through the park` 如何标注（modifier 还是 clause）；是否说明逻辑主语问题。

**T32**：`he` 指代歧义（John 还是 Paul）；explanation 是否说明；clauses 中的 that 从句是否正确识别。

**T33**：`Visiting relatives` 有两种读法（动名词作主语 vs 分词修饰 relatives）；是否给出一种解读并在 warnings 中说明另一种可能性。

---

## 类型八：语法正确但可优化（T34–T37）

**关注重点**：是否只分析结构；explanation 和 warnings 是否不添加"建议简化/可以更自然"类内容；warnings 是否为 []。

| ID | 句子 |
|---|---|
| T34 | Due to the fact that it was raining, we decided that we would not go outside. |
| T35 | It is important that we should pay attention to environmental protection. |
| T36 | The reason is because he did not study enough. |
| T37 | In spite of the fact that she was tired, she continued to work. |

### 各句预期关注点

**T34**：含两个 that 从句（due to the fact that / decided that）；是否都识别；explanation 不提"due to the fact that 可简化为 because"；warnings 是否为 []。

**T35**：形式主语 it，真正主语从句（that we should pay...）；should 在此语境争议不大；是否直接给出分析，不在 warnings 中标记不确定。

**T36**：`reason is because` 有语法争议（某些语法书认为应为 reason is that）；是否仍给出结构分析；是否在 warnings 或 explanation 末尾简短说明争议，而非直接拒绝分析。

**T37**：类似 T34，介词短语引导的让步状语；语法正确；explanation 不提"可改为 although"；warnings 是否为 []。

---

## 类型九：多处错误但不应过度改写（T38–T41）

**关注重点**：是否仍给出结构分析（不因多处错误放弃分析）；text 是否完全来自原句；explanation 是否保持在 3 句以内；不建议整句改写。

| ID | 句子 |
|---|---|
| T38 | I very interest in learning English because it is very useful language in my daily life. |
| T39 | Yesterday I go to school and meet my friend, we play game in the afternoon. |
| T40 | My mother she always tell me to study hard and she say English is important for future. |
| T41 | Although I don't know many word in English, but I still try my best to communicate with foreign people. |

### 各句预期关注点

**T38**：缺 `am`，`interest` 应为 `interested`，缺冠词；是否仍识别 because 从句；text 保持 `interest`/`useful language` 原词；explanation 末尾可注明语法问题但不改写。

**T39**：时态错误，run-on sentence（逗号连接两个独立分句）；是否识别两个分句并分别分析；text 保持 `go`/`meet`/`play` 原词；explanation 不超过 3 句。

**T40**：主语重复（`My mother she`）；是否识别真实主语为 `My mother`；predicate 保持 `tell`/`say` 原词；`she` 作为代词如何处理（重复主语 vs 新句子）。

**T41**：`although...but` 并用（中式英语，两者选一即可）；是否仍识别让步从句结构；`many word` 复数错误；explanation 不建议"删掉 but 或改用虽然…但…"。
