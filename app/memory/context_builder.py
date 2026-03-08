from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Chunk, Document, Fact
from app.memory.redis_store import RedisMemoryStore
from app.retrieval.retriever import BaseRetriever


@dataclass(slots=True)
class ContextPack:
    recent_messages: list[dict[str, str]]
    summary: str
    facts: list[dict[str, str]]
    chunks: list[dict[str, str | int]]


class ContextBuilder:
    def __init__(self, memory_store: RedisMemoryStore, retriever: BaseRetriever, recent_limit: int = 6):
        self.memory_store = memory_store
        self.retriever = retriever
        self.recent_limit = recent_limit

    def build(self, db: Session, session_id: str, user_message: str) -> ContextPack:
        recent_messages = self.memory_store.get_recent_messages(session_id)[-self.recent_limit :]
        summary = self.memory_store.get_summary(session_id)
        facts = self._load_facts(db, session_id)
        chunks = self.retriever.retrieve(db, user_message)
        return ContextPack(
            recent_messages=recent_messages,
            summary=summary,
            facts=facts,
            chunks=chunks,
        )

    @staticmethod
    def _load_facts(db: Session, session_id: str) -> list[dict[str, str]]:
        rows = db.scalars(
            select(Fact).where(Fact.session_id == session_id, Fact.is_active.is_(True)).order_by(Fact.created_at.desc())
        ).all()
        return [{"fact_key": row.fact_key, "fact_value": row.fact_value} for row in rows[:5]]

