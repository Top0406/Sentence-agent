from abc import ABC, abstractmethod
from app.schemas import AnalyzeResponse


class BaseAnalyzer(ABC):
    @abstractmethod
    def analyze(self, sentence: str) -> AnalyzeResponse:
        ...
