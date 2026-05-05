from app.analyzers.base import BaseAnalyzer
from app.schemas import AnalyzeResponse, Component, Clause, MainStructure

_FIXED_SENTENCE = "The boy who won the prize is my brother."

_FIXED_RESULT = AnalyzeResponse(
    original_sentence=_FIXED_SENTENCE,
    translation_zh="获得奖项的那个男孩是我的兄弟。",
    main_structure=MainStructure(
        subject="The boy who won the prize",
        predicate="is",
        object_or_complement="my brother",
    ),
    components=[
        Component(type="subject", text="The boy who won the prize", start=0, end=25),
        Component(type="predicate", text="is", start=26, end=28),
        Component(type="complement", text="my brother", start=29, end=39),
    ],
    clauses=[
        Clause(
            type="relative_clause",
            text="who won the prize",
            modifies="boy",
            function_zh="定语从句",
        )
    ],
    explanation_zh=(
        "主句结构为 The boy ... is my brother，"
        "其中 who won the prize 是修饰 boy 的定语从句。"
    ),
    warnings=["当前结果由 Mock Analyzer 返回，仅用于界面和接口测试。"],
)


def _generic_result(sentence: str) -> AnalyzeResponse:
    end = len(sentence)
    stripped = sentence.rstrip(".")
    return AnalyzeResponse(
        original_sentence=sentence,
        translation_zh="（通用 mock，暂不提供翻译）",
        main_structure=MainStructure(
            subject=stripped,
            predicate=None,
            object_or_complement=None,
        ),
        components=[
            Component(type="subject", text=sentence, start=0, end=end),
        ],
        clauses=[],
        explanation_zh="当前输入未能匹配已知句型，已返回通用 mock 结构，仅用于接口测试。",
        warnings=[
            "当前结果由 Mock Analyzer 返回，仅用于界面和接口测试。",
            "此句未能匹配精确 mock，已使用覆盖全句的通用成分。",
        ],
    )


class MockAnalyzer(BaseAnalyzer):
    def analyze(self, sentence: str) -> AnalyzeResponse:
        if sentence.strip() == _FIXED_SENTENCE:
            return _FIXED_RESULT
        return _generic_result(sentence)
