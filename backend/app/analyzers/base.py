from abc import ABC, abstractmethod
from app.schemas import AnalyzeResponse


class AnalyzerError(Exception):
    def __init__(self, message: str, status_code: int = 503):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class BaseAnalyzer(ABC):
    @abstractmethod
    async def analyze(self, sentence: str) -> AnalyzeResponse:
        ...
