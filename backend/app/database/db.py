import os
import aiosqlite
from contextlib import asynccontextmanager

# Resolve absolute path to SQLite database file
BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BACKEND_DIR, "english_ai.db")
SCHEMA_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "schema.sql")

@asynccontextmanager
async def get_db():
    """Async context manager yielding a configured aiosqlite connection."""
    conn = await aiosqlite.connect(DB_PATH)
    conn.row_factory = aiosqlite.Row
    await conn.execute("PRAGMA foreign_keys = ON;")
    try:
        yield conn
    finally:
        await conn.close()

async def init_db():
    """Initialize database tables from schema.sql."""
    if not os.path.exists(SCHEMA_PATH):
        raise FileNotFoundError(f"Schema file not found at {SCHEMA_PATH}")
    
    with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
        schema_sql = f.read()

    async with get_db() as conn:
        await conn.executescript(schema_sql)
        await conn.commit()

async def query_one(sql: str, params: tuple = ()):
    """Convenience helper to fetch a single row as a dictionary."""
    async with get_db() as conn:
        async with conn.execute(sql, params) as cursor:
            row = await cursor.fetchone()
            if row:
                return dict(row)
            return None

async def query_all(sql: str, params: tuple = ()):
    """Convenience helper to fetch multiple rows as list of dictionaries."""
    async with get_db() as conn:
        async with conn.execute(sql, params) as cursor:
            rows = await cursor.fetchall()
            return [dict(r) for r in rows]

async def execute_commit(sql: str, params: tuple = ()):
    """Convenience helper to execute an INSERT/UPDATE/DELETE statement."""
    async with get_db() as conn:
        cursor = await conn.execute(sql, params)
        await conn.commit()
        return cursor.lastrowid
