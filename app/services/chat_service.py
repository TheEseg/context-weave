from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.db.models import Fact, Message, Session as ChatSession
from app.memory.context_builder import ContextBuilder
from app.memory.fact_extractor import FactExtractor
from app.memory.redis_store import RedisMemoryStore
from app.memory.summarizer import SessionSummarizer
from app.schemas.chat import ChatRequest, ChatResponse, ContextDebug
from app.services.llm_provider import BaseLLMProvider

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(
        self,
        db: Session,
        memory_store: RedisMemoryStore,
        summarizer: SessionSummarizer,
        fact_extractor: FactExtractor,
        context_builder: ContextBuilder,
        llm_provider: BaseLLMProvider,
        settings: Settings,
    ):
        self.db = db
        self.memory_store = memory_store
        self.summarizer = summarizer
        self.fact_extractor = fact_extractor
        self.context_builder = context_builder
        self.llm_provider = llm_provider
        self.settings = settings

    def handle_chat(self, payload: ChatRequest) -> ChatResponse:
        session = self._get_or_create_session(payload.session_id, payload.user_id)
        context = self.context_builder.build(self.db, session.id, payload.message)
        assistant_response = self.llm_provider.generate(payload.message, context)

        user_message = Message(session_id=session.id, role="user", content=payload.message)
        assistant_message = Message(session_id=session.id, role="assistant", content=assistant_response)
        self.db.add_all([user_message, assistant_message])
        self.db.commit()

        self.memory_store.append_recent_message(
            session.id,
            {"role": "user", "content": payload.message},
            limit=self.settings.recent_message_limit,
        )
        self.memory_store.append_recent_message(
            session.id,
            {"role": "assistant", "content": assistant_response},
            limit=self.settings.recent_message_limit,
        )
        updated_recent = self.memory_store.get_recent_messages(session.id)
        summary = self.summarizer.summarize(self.memory_store.get_summary(session.id), updated_recent)
        self.memory_store.set_summary(session.id, summary)
        self.memory_store.set_task_state(session.id, {"last_user_message": payload.message})

        self._store_facts(payload.session_id, payload.user_id, payload.message)

        debug = None
        if self.settings.debug_context:
            debug = ContextDebug(
                recent_messages=context.recent_messages,
                summary=context.summary,
                facts=context.facts,
                chunks=context.chunks,
            )

        return ChatResponse(
            session_id=payload.session_id,
            user_id=payload.user_id,
            response=assistant_response,
            debug=debug,
        )

    def _get_or_create_session(self, session_id: str, user_id: str) -> ChatSession:
        session = self.db.scalar(select(ChatSession).where(ChatSession.id == session_id))
        if session:
            return session

        session = ChatSession(id=session_id, user_id=user_id)
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session

    def _store_facts(self, session_id: str, user_id: str, message: str) -> None:
        extracted_facts = self.fact_extractor.extract(message)
        for fact in extracted_facts:
            self.db.add(
                Fact(
                    session_id=session_id,
                    user_id=user_id,
                    fact_key=fact.fact_key,
                    fact_value=fact.fact_value,
                    confidence=fact.confidence,
                    source_type=fact.source_type,
                )
            )
        try:
            self.db.commit()
        except IntegrityError:
            logger.info("Duplicate facts skipped for session %s", session_id)
            self.db.rollback()

