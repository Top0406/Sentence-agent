from pydantic import BaseModel, field_validator
from typing import Optional, Any


class AnalyzeRequest(BaseModel):
    sentence: str

    @field_validator("sentence")
    @classmethod
    def sentence_must_not_be_empty(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("请输入英文句子")
        if len(v) > 500:
            raise ValueError("句子过长，请缩短后重试")
        return v.strip()


class Component(BaseModel):
    type: str
    text: str
    start: int
    end: int


class Clause(BaseModel):
    type: str
    text: str
    modifies: Optional[str] = None
    function_zh: str


class MainStructure(BaseModel):
    subject: Optional[str] = None
    predicate: Optional[str] = None
    object_or_complement: Optional[str] = None


class AnalyzeResponse(BaseModel):
    original_sentence: str
    translation_zh: str
    main_structure: MainStructure
    components: list[Component]
    clauses: list[Clause]
    explanation_zh: str
    warnings: list[str]


class HistoryItem(BaseModel):
    id: int
    sentence: str
    result: AnalyzeResponse
    created_at: str
