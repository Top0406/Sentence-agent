import aiosqlite
from datetime import datetime, timezone

_DEFAULT_PATH = "history.db"


async def init_db(db_path: str = _DEFAULT_PATH) -> None:
    async with aiosqlite.connect(db_path) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS analyses (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                sentence    TEXT NOT NULL,
                result_json TEXT NOT NULL,
                created_at  TEXT NOT NULL
            )
        """)
        await db.commit()


async def save_analysis(
    sentence: str, result_json: str, db_path: str = _DEFAULT_PATH
) -> None:
    created_at = datetime.now(timezone.utc).isoformat()
    async with aiosqlite.connect(db_path) as db:
        await db.execute(
            "INSERT INTO analyses (sentence, result_json, created_at) VALUES (?, ?, ?)",
            (sentence, result_json, created_at),
        )
        await db.commit()


async def get_history(
    limit: int = 20, db_path: str = _DEFAULT_PATH
) -> list[dict]:
    async with aiosqlite.connect(db_path) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT id, sentence, result_json, created_at FROM analyses"
            " ORDER BY created_at DESC LIMIT ?",
            (limit,),
        )
        rows = await cursor.fetchall()
        return [dict(row) for row in rows]
