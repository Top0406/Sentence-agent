import json
import pytest
from app.database import init_db, save_analysis, get_history


async def test_init_db_creates_usable_table(db_path):
    await init_db(db_path)
    result = await get_history(limit=10, db_path=db_path)
    assert result == []


async def test_save_analysis_and_fetch(db_path):
    await init_db(db_path)
    result_json = json.dumps({"original_sentence": "I love English.", "components": []})

    await save_analysis("I love English.", result_json, db_path=db_path)

    history = await get_history(limit=10, db_path=db_path)
    assert len(history) == 1
    assert history[0]["sentence"] == "I love English."
    assert json.loads(history[0]["result_json"])["original_sentence"] == "I love English."
    assert "id" in history[0]
    assert "created_at" in history[0]


async def test_history_ordered_newest_first(db_path):
    await init_db(db_path)
    for sentence in ["First.", "Second.", "Third."]:
        await save_analysis(sentence, json.dumps({}), db_path=db_path)

    history = await get_history(limit=10, db_path=db_path)
    assert history[0]["sentence"] == "Third."
    assert history[-1]["sentence"] == "First."


async def test_history_limit_respected(db_path):
    await init_db(db_path)
    for i in range(5):
        await save_analysis(f"Sentence {i}.", json.dumps({}), db_path=db_path)

    history = await get_history(limit=3, db_path=db_path)
    assert len(history) == 3


async def test_history_limit_default_is_twenty(db_path):
    await init_db(db_path)
    for i in range(25):
        await save_analysis(f"Sentence {i}.", json.dumps({}), db_path=db_path)

    history = await get_history(db_path=db_path)
    assert len(history) == 20


async def test_empty_history_returns_empty_list(db_path):
    await init_db(db_path)
    history = await get_history(limit=20, db_path=db_path)
    assert history == []
