import json
import os

import httpx

from app.analyzers.base import AnalyzerError, BaseAnalyzer
from app.schemas import AnalyzeResponse, Clause, Component, MainStructure

_SYSTEM_PROMPT = """\
你是一个专业的英语语法分析助手，面向中国英语学习者。

分析用户输入的英文句子，识别句子成分，以 JSON 对象返回分析结果。

输出要求：
- 只返回一个 JSON 对象，不加任何 Markdown 代码块、注释或额外文字。
- 严格使用以下 JSON schema：

{
  "original_sentence": "原始输入句子（原样复制，不得修改）",
  "translation_zh": "中文翻译",
  "main_structure": {
    "subject": "主语（字符串，无则为 null）",
    "predicate": "谓语（字符串，无则为 null）",
    "object_or_complement": "宾语或表语（字符串，无则为 null）"
  },
  "components": [
    {
      "type": "成分类型，只能是 subject/predicate/object/complement/modifier/clause 之一",
      "text": "该成分在原句中的完整文本（必须来自原句，不得编造）",
      "start": 0,
      "end": 5
    }
  ],
  "clauses": [
    {
      "type": "从句类型（如 relative_clause/adverbial_clause/noun_clause 等）",
      "text": "从句文本",
      "modifies": "修饰的词（无则为 null）",
      "function_zh": "从句功能的中文说明（如 定语从句、状语从句、宾语从句）"
    }
  ],
  "explanation_zh": "整体句子结构的中文解释，清晰说明主句结构和各成分关系",
  "warnings": []
}

注意事项：
- components 中每个条目的 text 必须来自原句，不得编造。
- start 和 end 是 text 在 original_sentence 中的字符下标（0-based，end 不含）。
- 如果无法确定准确的 start/end，在 warnings 中注明，但仍需给出合理估计。
- 如果对某个成分不确定，在 warnings 中说明，不得强行给出确定结论。
- warnings 字段必须存在，若无警告则为空数组 []。\
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
        components = []
        has_bad_positions = False
        sent_len = len(sentence)

        for item in raw:
            if not isinstance(item, dict):
                continue
            try:
                c_start = int(item.get("start", 0))
                c_end = int(item.get("end", 0))
            except (ValueError, TypeError):
                c_start, c_end = 0, 0
                has_bad_positions = True

            if (
                c_start < 0
                or c_end < 0
                or c_start > sent_len
                or c_end > sent_len
                or c_start >= c_end
            ):
                c_start, c_end = 0, 0
                has_bad_positions = True

            components.append(
                Component(
                    type=str(item.get("type", "")),
                    text=str(item.get("text", "")),
                    start=c_start,
                    end=c_end,
                )
            )

        return components, has_bad_positions

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
