import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.schemas import AnalyzeRequest, AnalyzeResponse

load_dotenv()


def _get_analyzer():
    provider = os.getenv("ANALYZER_PROVIDER", "mock").lower()
    if provider == "mock":
        from app.analyzers.mock_analyzer import MockAnalyzer
        return MockAnalyzer()
    raise ValueError(f"Unknown ANALYZER_PROVIDER: {provider}")


analyzer = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global analyzer
    analyzer = _get_analyzer()
    yield


app = FastAPI(title="英语句子结构图解器 API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest):
    return analyzer.analyze(request.sentence)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    msg = errors[0].get("msg", "输入无效") if errors else "输入无效"
    msg = msg.removeprefix("Value error, ")
    return JSONResponse(status_code=400, content={"error": msg})
