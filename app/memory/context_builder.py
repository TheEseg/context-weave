from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Chunk, Document, Fact
from app.memory.redis_store import RedisMemoryStore
from app.retrieval.retriever import BaseRetriever


@dataclass(slots=True)
class ContextPack:
    memory_enabled: bool
    recent_messages: list[dict[str, str]]
    summary: str
    facts: list[dict[str, str]]
    chunks: list[dict[str, str | int]]

    @classmethod
    def direct_message_only(cls) -> "ContextPack":
        return cls(
            memory_enabled=False,
            recent_messages=[],
            summary="disabled",
            facts=[],
            chunks=[],
        )

    def pack_for_model(self, user_message: str) -> str:
        if not self.memory_enabled:
            return f"Current user message:\n{user_message}"

        parts: list[str] = []
        if self.summary:
            parts.append(f"Session summary:\n{self.summary}")
        if self.facts:
            fact_lines = "\n".join(f'- {fact["fact_key"]}: {fact["fact_value"]}' for fact in self.facts)
            parts.append(f"Retrieved facts:\n{fact_lines}")
        if self.chunks:
            chunk_lines = "\n\n".join(
                f'[{chunk["document_title"]}#{chunk["chunk_index"]}] {chunk["content"]}'
                for chunk in self.chunks
            )
            parts.append(f"Retrieved chunks:\n{chunk_lines}")
        if self.recent_messages:
            recent_lines = "\n".join(f'- {message["role"]}: {message["content"]}' for message in self.recent_messages)
            parts.append(f"Recent messages:\n{recent_lines}")
        parts.append(f"Current user message:\n{user_message}")
        return "\n\n".join(parts)

    def context_length_chars(self, user_message: str) -> int:
        return len(self.pack_for_model(user_message))


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
            memory_enabled=True,
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
