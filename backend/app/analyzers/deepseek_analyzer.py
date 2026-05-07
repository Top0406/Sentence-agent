import json
import os

import httpx

from app.analyzers.base import AnalyzerError, BaseAnalyzer
from app.schemas import AnalyzeResponse, Clause, Component, MainStructure

_SYSTEM_PROMPT = """\
你是一个英语句子结构分析助手，面向中国英语学习者。

任务：分析用户输入的英文句子，识别句子成分，以 JSON 对象返回结果。

【输出要求】
- 只返回一个 JSON 对象，不加任何 Markdown 代码块、注释或额外文字。
- 严格使用以下 JSON schema，所有字段必须存在：

{
  "original_sentence": "原始输入句子（原样复制，不得修改）",
  "translation_zh": "自然流畅的中文翻译（原句有语法错误也按字面翻译，不要翻译修正后的版本）",
  "main_structure": {
    "subject": "主语（字符串，无则为 null）",
    "predicate": "谓语动词（字符串，无则为 null）",
    "object_or_complement": "宾语或表语（字符串，无则为 null）"
  },
  "components": [
    {
      "type": "只能是 subject / predicate / object / complement / modifier / clause 之一",
      "text": "该成分在原句中的完整原始文本（必须逐字来自原句，不得修改或纠正）",
      "start": 0,
      "end": 5
    }
  ],
  "clauses": [
    {
      "type": "relative_clause / adverbial_clause / noun_clause / appositive_clause 等",
      "text": "从句文本（逐字来自原句）",
      "modifies": "修饰的词（无则为 null）",
      "function_zh": "从句功能（如 定语从句、原因状语从句、宾语从句）"
    }
  ],
  "explanation_zh": "2-3 句话，说明主句骨架和从句关系，不要逐一复述每个成分的内容",
  "warnings": []
}

【成分类型说明】
- subject：主语（名词短语或名词性从句）
- predicate：谓语动词（含助动词），不含宾语或补语
- object：宾语
- complement：表语或宾语补足语
- modifier：修饰语（分词短语、形容词短语、副词短语等）
- clause：状语从句，或无法归入 subject / object / complement / modifier 的从句；如果 that / what / whether 等从句充当动词宾语（如 "He said that..."、"John told Paul that..."），type 必须为 object，不要标为 clause

【关于 start 和 end】
- 是 text 在 original_sentence 中的字符下标（0-based，end 不含）。
- 请给出准确值；无法确定时在 warnings 中注明，并给出合理估计。

【warnings 使用规则】
warnings 只用于下列情况，其余情况保持 []：
1. 某成分的分类存在不确定性（如"此成分可能是 object 或 complement"）
2. 某成分的 start/end 无法可靠确定
3. 句子结构过于复杂，分析可能有遗漏

warnings 不用于：
- 指出原句语法错误或用词不当
- 提供改写、优化或"更自然的说法"建议
- 对语法正确的句子添加任何提示

如果句子语法正确且结构清晰，warnings 必须为空数组 []。

【处理有语法错误的句子】
- components 的 text 必须是原句中的原始文字，不得修改或替换。不要把"修正后的文字"写进 text。
- translation_zh 只翻译原句字面意思，不翻译修正后的版本。
- 如需指出语法错误或给出修改建议，只能写在 explanation_zh 的最后一句，简短说明（不超过一句话）。
- warnings 不用于语法错误说明，请保持 []（除非分析本身有不确定性）。\
"""


class DeepSeekAnalyzer(BaseAnalyzer):
    def __init__(self):
        self._api_key = os.getenv("DEEPSEEK_API_KEY", "")
        self._base_url = os.getenv("DEEPSEEK_BASE_URL", "")
        self._model = os.getenv("DEEPSEEK_MODEL", "")

    async def analyze(self, sentence: str) -> AnalyzeResponse:
        self._check_config()

        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": f"请分析以下英文句子：\n\n{sentence}"},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.1,
        }

        try:
            async with httpx.AsyncClient(timeout=45.0) as client:
                response = await client.post(
                    f"{self._base_url.rstrip('/')}/v1/chat/completions",
                    headers={
                        "Authorization": f"Bearer {self._api_key}",
                        "Content-Type": "application/json",
                    },
                    json=payload,
                )
                response.raise_for_status()
        except httpx.TimeoutException:
            raise AnalyzerError("分析服务响应超时，请稍后重试")
        except httpx.HTTPStatusError:
            raise AnalyzerError("分析服务暂时不可用，请稍后重试")
        except httpx.RequestError:
            raise AnalyzerError("分析服务暂时不可用，请稍后重试")

        try:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
        except (KeyError, IndexError, ValueError):
            raise AnalyzerError("分析结果格式异常，请稍后重试")

        try:
            result = json.loads(content)
        except (json.JSONDecodeError, TypeError):
            raise AnalyzerError("分析结果格式异常，请稍后重试")

        return self._validate_and_build(sentence, result)

    def _check_config(self):
        if not self._api_key:
            raise AnalyzerError("DeepSeek API key 未配置")
        if not self._base_url or self._base_url.upper() == "TBD":
            raise AnalyzerError("DeepSeek API endpoint 未配置")
        if not self._model or self._model.upper() == "TBD":
            raise AnalyzerError("DeepSeek 模型名称未配置")

    def _validate_and_build(self, sentence: str, data: dict) -> AnalyzeResponse:
        required = [
            "original_sentence", "translation_zh", "main_structure",
            "components", "clauses", "explanation_zh",
        ]
        for field in required:
            if field not in data:
                raise AnalyzerError("分析结果字段缺失，请稍后重试")

        if not isinstance(data.get("components"), list):
            raise AnalyzerError("分析结果字段缺失，请稍后重试")
        if not isinstance(data.get("clauses"), list):
            raise AnalyzerError("分析结果字段缺失，请稍后重试")

        warnings = data.get("warnings", [])
        if not isinstance(warnings, list):
            warnings = []

        components, has_bad_positions = self._build_components(sentence, data["components"])
        if has_bad_positions:
            warnings.append("部分成分位置信息不可靠，已降级展示。")

        ms = data.get("main_structure") or {}
        main_structure = MainStructure(
            subject=ms.get("subject") if isinstance(ms, dict) else None,
            predicate=ms.get("predicate") if isinstance(ms, dict) else None,
            object_or_complement=ms.get("object_or_complement") if isinstance(ms, dict) else None,
        )

        clauses = self._build_clauses(data["clauses"])

        return AnalyzeResponse(
            original_sentence=str(data.get("original_sentence", sentence)),
            translation_zh=str(data.get("translation_zh", "")),
            main_structure=main_structure,
            components=components,
            clauses=clauses,
            explanation_zh=str(data.get("explanation_zh", "")),
            warnings=warnings,
        )

    def _build_components(
        self, sentence: str, raw: list
    ) -> tuple[list[Component], bool]:
        resolved = []
        has_unreliable = False

        for item in raw:
            if not isinstance(item, dict):
                continue

            c_text = str(item.get("text", ""))
            if not c_text.strip():
                has_unreliable = True
                continue

            try:
                model_start = int(item.get("start", 0))
                model_end = int(item.get("end", 0))
            except (ValueError, TypeError):
                model_start, model_end = 0, 0

            c_start, c_end, verified = self._resolve_span(
                sentence, c_text, model_start, model_end
            )
            if not verified:
                has_unreliable = True

            resolved.append(
                Component(
                    type=str(item.get("type", "")),
                    text=c_text,
                    start=c_start,
                    end=c_end,
                )
            )

        if has_unreliable:
            resolved = [
                Component(type=c.type, text=c.text, start=0, end=0)
                for c in resolved
            ]

        return resolved, has_unreliable

    @staticmethod
    def _resolve_span(
        sentence: str, text: str, model_start: int, model_end: int
    ) -> tuple[int, int, bool]:
        t_len = len(text)
        n = len(sentence)

        # Step 1: exact match at model's reported position (case-sensitive)
        if 0 <= model_start < model_end <= n and sentence[model_start:model_end] == text:
            return model_start, model_end, True

        def _find_all(haystack: str, needle: str) -> list[int]:
            result, start = [], 0
            while (idx := haystack.find(needle, start)) != -1:
                result.append(idx)
                start = idx + 1
            return result

        def _pick_best(positions: list[int]) -> int | None:
            if not positions:
                return None
            if len(positions) == 1:
                return positions[0]
            nearest = min(positions, key=lambda p: abs(p - model_start))
            # Reject ties: two positions equally close to model_start
            if sum(1 for p in positions if abs(p - model_start) == abs(nearest - model_start)) == 1:
                return nearest
            return None

        # Step 2: case-sensitive search across full sentence
        pos = _pick_best(_find_all(sentence, text))
        if pos is not None:
            return pos, pos + t_len, True

        # Step 3: case-insensitive search
        pos_ci = _pick_best(_find_all(sentence.lower(), text.lower()))
        if pos_ci is not None:
            return pos_ci, pos_ci + t_len, True

        return 0, 0, False

    def _build_clauses(self, raw: list) -> list[Clause]:
        clauses = []
        for item in raw:
            if not isinstance(item, dict):
                continue
            try:
                clauses.append(
                    Clause(
                        type=str(item.get("type", "")),
                        text=str(item.get("text", "")),
                        modifies=item.get("modifies"),
                        function_zh=str(item.get("function_zh", "")),
                    )
                )
            except Exception:
                continue
        return clauses
