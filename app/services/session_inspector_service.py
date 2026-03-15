from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.context.context_diff import ContextSnapshot, diff_snapshots
from app.context.context_selector import ContextSelector
from app.db.models import Message, Session as ChatSession
from app.memory.redis_store import RedisMemoryStore
from app.schemas.session import (
    ContextDiffPayload,
    ContextDiffResponse,
    SessionChunk,
    SessionContextResponse,
    SessionFact,
    SessionMessage,
)


class SessionInspectorService:
    def __init__(self, db: Session, memory_store: RedisMemoryStore, context_selector: ContextSelector):
        self.db = db
        self.memory_store = memory_store
        self.context_selector = context_selector

    def get_context(self, session_id: str) -> SessionContextResponse:
        session = self.db.scalar(select(ChatSession).where(ChatSession.id == session_id))
        if session is None:
            raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

        task_state = self.memory_store.get_task_state(session_id)
        retrieval_query = task_state.get("last_user_message") or self.memory_store.get_summary(session_id)
        retrieved_memory = self.context_selector.retrieve_memory(self.db, session_id, retrieval_query or "")
        scored_items = self.context_selector.score_context(retrieval_query or "", retrieved_memory)
        context = self.context_selector.select_context(
            user_message=retrieval_query or "",
            retrieved_memory=retrieved_memory,
            scored_items=scored_items,
            memory_enabled=True,
        )

        message_rows = self.db.scalars(
            select(Message).where(Message.session_id == session_id).order_by(Message.created_at.asc(), Message.id.asc())
        ).all()

        return SessionContextResponse(
            session_id=session.id,
            user_id=session.user_id,
            messages=[
                SessionMessage(role=row.role, content=row.content, created_at=row.created_at) for row in message_rows
            ],
            recent_messages=[
                SessionMessage(role=item["role"], content=item["content"]) for item in context.recent_messages
            ],
            summary=context.summary,
            facts=[SessionFact(**fact) for fact in context.facts],
            chunks=[SessionChunk(**chunk) for chunk in context.chunks],
            task_state=task_state,
            latest_turn=self.memory_store.get_latest_turn(session_id),
        )

    def get_context_diff(self, session_id: str, turn: int) -> ContextDiffResponse:
        session = self.db.scalar(select(ChatSession).where(ChatSession.id == session_id))
        if session is None:
            raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

        current_snapshot = self.memory_store.get_context_snapshot(session_id, turn)
        if current_snapshot is None:
            raise HTTPException(status_code=404, detail=f"Context snapshot for turn {turn} not found")

        previous_snapshot = self.memory_store.get_context_snapshot(session_id, turn - 1) if turn > 1 else None
        diff = diff_snapshots(
            self._to_snapshot(previous_snapshot) if previous_snapshot else None,
            self._to_snapshot(current_snapshot),
        )
        return ContextDiffResponse(
            turn=turn,
            diff=ContextDiffPayload(
                added=[{"type": item.type, "value": item.value} for item in diff.added],
                removed=[{"type": item.type, "value": item.value} for item in diff.removed],
                unchanged=[{"type": item.type, "value": item.value} for item in diff.unchanged],
            ),
        )

    @staticmethod
    def _to_snapshot(snapshot: dict[str, object]) -> ContextSnapshot:
        return ContextSnapshot(
            turn=int(snapshot["turn"]),
            packed_context=str(snapshot["packed_context"]),
            facts=list(snapshot["facts"]),
            recent_messages=list(snapshot["recent_messages"]),
            retrieved_chunks=list(snapshot["retrieved_chunks"]),
        )
