from __future__ import annotations

from dataclasses import dataclass

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.context.context_packer import ContextPack, pack_context
from app.context.context_scorer import ContextScorer, ScoredContextItem
from app.db.models import Fact
from app.memory.redis_store import RedisMemoryStore
from app.retrieval.retriever import BaseRetriever


@dataclass(slots=True)
class RetrievedMemory:
    summary: str
    facts: list[dict[str, str]]
    recent_messages: list[dict[str, str]]
    chunks: list[dict[str, str | int]]


class ContextSelector:
    def __init__(
        self,
        memory_store: RedisMemoryStore,
        retriever: BaseRetriever,
        scorer: ContextScorer,
        recent_limit: int = 6,
        fact_limit: int = 5,
        chunk_limit: int = 3,
    ):
        self.memory_store = memory_store
        self.retriever = retriever
        self.scorer = scorer
        self.recent_limit = recent_limit
        self.fact_limit = fact_limit
        self.chunk_limit = chunk_limit

    def retrieve_memory(self, db: Session, session_id: str, user_message: str) -> RetrievedMemory:
        recent_messages = self.memory_store.get_recent_messages(session_id)[-self.recent_limit :]
        summary = self.memory_store.get_summary(session_id)
        facts = self._load_facts(db, session_id)
        chunks = self.retriever.retrieve(db, user_message)
        return RetrievedMemory(
            summary=summary,
            facts=facts,
            recent_messages=recent_messages,
            chunks=chunks,
        )

    def score_context(self, user_message: str, retrieved_memory: RetrievedMemory) -> list[ScoredContextItem]:
        return self.scorer.score(
            query=user_message,
            summary=retrieved_memory.summary,
            facts=retrieved_memory.facts,
            recent_messages=retrieved_memory.recent_messages,
            chunks=retrieved_memory.chunks,
        )

    def select_context(
        self,
        *,
        user_message: str,
        retrieved_memory: RetrievedMemory,
        scored_items: list[ScoredContextItem],
        memory_enabled: bool,
    ) -> ContextPack:
        if not memory_enabled:
            return ContextPack.direct_message_only(user_message)

        selected_facts: list[dict[str, str]] = []
        selected_recent: list[dict[str, str]] = []
        selected_chunks: list[dict[str, str | int]] = []
        include_summary = bool(retrieved_memory.summary)

        for item in scored_items:
            if item.item_type == "fact" and len(selected_facts) < self.fact_limit:
                if item.value not in selected_facts:
                    selected_facts.append(item.value)
            elif item.item_type == "recent_message" and len(selected_recent) < self.recent_limit:
                if item.value not in selected_recent:
                    selected_recent.append(item.value)
            elif item.item_type == "retrieval_chunk" and len(selected_chunks) < self.chunk_limit:
                if item.value not in selected_chunks:
                    selected_chunks.append(item.value)

        selected_recent = [
            message for message in retrieved_memory.recent_messages if message in selected_recent
        ]
        selected_facts = [
            fact for fact in retrieved_memory.facts if fact in selected_facts
        ]
        selected_chunks = [
            chunk for chunk in retrieved_memory.chunks if chunk in selected_chunks
        ]

        return pack_context(
            user_message=user_message,
            memory_enabled=memory_enabled,
            summary=retrieved_memory.summary if include_summary else "",
            facts=selected_facts,
            recent_messages=selected_recent,
            chunks=selected_chunks,
        )

    @staticmethod
    def _load_facts(db: Session, session_id: str) -> list[dict[str, str]]:
        rows = db.scalars(
            select(Fact).where(Fact.session_id == session_id, Fact.is_active.is_(True)).order_by(Fact.created_at.desc())
        ).all()
        return [{"fact_key": row.fact_key, "fact_value": row.fact_value} for row in rows[:5]]
