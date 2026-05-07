import importlib
import pytest
from httpx import AsyncClient, ASGITransport
from app.database import init_db


@pytest.fixture
async def client(tmp_path, monkeypatch):
    monkeypatch.setenv("ANALYZER_PROVIDER", "mock")
    db = str(tmp_path / "test.db")
    monkeypatch.setenv("HISTORY_DB_PATH", db)

    import app.main as m
    importlib.reload(m)

    # ASGITransport does not trigger lifespan; initialize manually
    await init_db(db)
    m._db_path = db
    m.analyzer = m._get_analyzer()

    async with AsyncClient(transport=ASGITransport(app=m.app), base_url="http://test") as c:
        yield c


async def test_history_empty_on_fresh_start(client):
    response = await client.get("/api/history")
    assert response.status_code == 200
    assert response.json() == []


async def test_analyze_saves_sentence_to_history(client):
    post_resp = await client.post("/api/analyze", json={"sentence": "I love English."})
    assert post_resp.status_code == 200

    get_resp = await client.get("/api/history")
    items = get_resp.json()
    assert len(items) == 1
    assert items[0]["sentence"] == "I love English."
    assert "id" in items[0]
    assert "created_at" in items[0]
    assert "result" in items[0]


async def test_history_result_contains_analyze_response(client):
    await client.post("/api/analyze", json={"sentence": "I love English."})

    items = (await client.get("/api/history")).json()
    result = items[0]["result"]
    assert result["original_sentence"] == "I love English."
    assert isinstance(result["components"], list)


async def test_history_newest_first(client):
    for sentence in ["First.", "Second.", "Third."]:
        await client.post("/api/analyze", json={"sentence": sentence})

    items = (await client.get("/api/history")).json()
    assert items[0]["sentence"] == "Third."
    assert items[-1]["sentence"] == "First."


async def test_history_limit_query_param(client):
    for i in range(5):
        await client.post("/api/analyze", json={"sentence": f"Sentence {i}."})

    items = (await client.get("/api/history?limit=3")).json()
    assert len(items) == 3


async def test_failed_analyze_does_not_save_to_history(client):
    await client.post("/api/analyze", json={"sentence": ""})

    items = (await client.get("/api/history")).json()
    assert items == []
