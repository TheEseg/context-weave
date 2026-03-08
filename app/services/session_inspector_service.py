from __future__ import annotations

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Message, Session as ChatSession
from app.memory.context_builder import ContextBuilder
from app.memory.redis_store import RedisMemoryStore
from app.schemas.session import SessionChunk, SessionContextResponse, SessionFact, SessionMessage


class SessionInspectorService:
    def __init__(self, db: Session, memory_store: RedisMemoryStore, context_builder: ContextBuilder):
        self.db = db
        self.memory_store = memory_store
        self.context_builder = context_builder

    def get_context(self, session_id: str) -> SessionContextResponse:
        session = self.db.scalar(select(ChatSession).where(ChatSession.id == session_id))
        if session is None:
            raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

        task_state = self.memory_store.get_task_state(session_id)
        retrieval_query = task_state.get("last_user_message") or self.memory_store.get_summary(session_id)
        context = self.context_builder.build(self.db, session_id, retrieval_query or "")

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
        )
