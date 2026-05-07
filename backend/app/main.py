import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.analyzers.base import AnalyzerError
from app.database import get_history, init_db, save_analysis
from app.schemas import AnalyzeRequest, AnalyzeResponse, HistoryItem

load_dotenv()


def _get_analyzer():
    provider = os.getenv("ANALYZER_PROVIDER", "mock").lower()
    if provider == "mock":
        from app.analyzers.mock_analyzer import MockAnalyzer
        return MockAnalyzer()
    if provider == "deepseek":
        from app.analyzers.deepseek_analyzer import DeepSeekAnalyzer
        return DeepSeekAnalyzer()
    raise ValueError(
        f"不支持的 ANALYZER_PROVIDER 值: '{provider}'，仅支持 mock 或 deepseek"
    )


analyzer = None
_db_path: str = ""


@asynccontextmanager
async def lifespan(app: FastAPI):
    global analyzer, _db_path
    analyzer = _get_analyzer()
    _db_path = os.getenv("HISTORY_DB_PATH", "history.db")
    await init_db(_db_path)
    yield


app = FastAPI(title="英语句子结构图解器 API", lifespan=lifespan)


def _get_allowed_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "")
    extra = [o.strip() for o in raw.split(",") if o.strip()]
    defaults = ["http://localhost:5173", "http://127.0.0.1:5173"]
    return list(dict.fromkeys(defaults + extra))


app.add_middleware(
    CORSMiddleware,
    allow_origins=_get_allowed_origins(),
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    result = await analyzer.analyze(request.sentence)
    try:
        await save_analysis(request.sentence, result.model_dump_json(), db_path=_db_path)
    except Exception:
        pass
    return result


@app.get("/api/history", response_model=list[HistoryItem])
async def history(limit: int = Query(default=20, ge=1, le=200)):
    records = await get_history(limit=limit, db_path=_db_path)
    return [
        HistoryItem(
            id=r["id"],
            sentence=r["sentence"],
            result=AnalyzeResponse.model_validate_json(r["result_json"]),
            created_at=r["created_at"],
        )
        for r in records
    ]


@app.exception_handler(AnalyzerError)
async def analyzer_error_handler(request: Request, exc: AnalyzerError):
    return JSONResponse(status_code=exc.status_code, content={"error": exc.message})


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg", "输入无效") if errors else "输入无效"
    msg = msg.removeprefix("Value error, ")
    return JSONResponse(status_code=400, content={"error": msg})
