from __future__ import annotations

import logging

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.context.context_budget import calculate_context_budget
from app.context.context_diff import build_context_snapshot
from app.context.context_packer import (
    ContextPack,
    format_facts_section,
    format_recent_messages_section,
    format_summary_section,
    format_chunks_section,
)
from app.context.context_selector import ContextSelector
from app.context.fact_extractor import FactExtractor
from app.core.config import Settings
from app.db.models import Fact, Message, Session as ChatSession
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
        context_selector: ContextSelector,
        llm_provider: BaseLLMProvider,
        settings: Settings,
    ):
        self.db = db
        self.memory_store = memory_store
        self.summarizer = summarizer
        self.fact_extractor = fact_extractor
        self.context_selector = context_selector
        self.llm_provider = llm_provider
        self.settings = settings

    def handle_chat(self, payload: ChatRequest) -> ChatResponse:
        session = self._get_or_create_session(payload.session_id, payload.user_id)
        user_message = Message(session_id=session.id, role="user", content=payload.message)
        self.db.add(user_message)
        self.db.commit()

        if payload.memory_enabled:
            self._store_facts(payload.session_id, payload.user_id, payload.message)
            retrieved_memory = self.context_selector.retrieve_memory(self.db, session.id, payload.message)
            scored_items = self.context_selector.score_context(payload.message, retrieved_memory)
            context = self.context_selector.select_context(
                user_message=payload.message,
                retrieved_memory=retrieved_memory,
                scored_items=scored_items,
                memory_enabled=True,
            )
        else:
            context = ContextPack.direct_message_only(payload.message)

        packed_context = context.pack_for_model(payload.message)
        summary_section = format_summary_section(context.summary if payload.memory_enabled else "")
        facts_section = format_facts_section(context.facts if payload.memory_enabled else [])
        chunks_section = format_chunks_section(context.chunks if payload.memory_enabled else [])
        recent_messages_section = format_recent_messages_section(context.recent_messages if payload.memory_enabled else [])
        context_budget = calculate_context_budget(
            system_prompt="",
            session_summary=summary_section,
            facts_text=facts_section,
            retrieved_chunks_text=chunks_section,
            recent_messages_text=recent_messages_section,
            final_packed_context=packed_context,
            model_limit=self.settings.model_context_limit,
        )

        assistant_response = self.llm_provider.generate(
            payload.message,
            context,
            memory_enabled=payload.memory_enabled,
        )

        assistant_message = Message(session_id=session.id, role="assistant", content=assistant_response)
        self.db.add(assistant_message)
        self.db.commit()

        if payload.memory_enabled:
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

        debug = ContextDebug(
            memory_enabled=payload.memory_enabled,
            recent_messages=context.recent_messages,
            session_summary=context.summary,
            retrieved_facts=context.facts,
            retrieved_chunks=context.chunks,
            final_packed_context=packed_context,
            context_length_chars=context.context_length_chars(payload.message),
            context_budget=ContextDebug.ContextBudget(
                unit=context_budget.unit,
                system_prompt=context_budget.system_prompt,
                session_summary=context_budget.session_summary,
                facts=context_budget.facts,
                retrieved_chunks=context_budget.retrieved_chunks,
                recent_messages=context_budget.recent_messages,
                final_packed_context_total=context_budget.final_packed_context_total,
                model_limit=context_budget.model_limit,
                usage_ratio=context_budget.usage_ratio,
                warning=context_budget.warning,
                truncated=context_budget.truncated,
            ),
        )
        next_turn = self.memory_store.get_latest_turn(session.id) + 1
        snapshot = build_context_snapshot(
            turn=next_turn,
            packed_context=debug.final_packed_context,
            facts=context.facts,
            recent_messages=context.recent_messages,
            retrieved_chunks=context.chunks,
        )
        self.memory_store.append_context_snapshot(
            session.id,
            {
                "turn": snapshot.turn,
                "packed_context": snapshot.packed_context,
                "facts": snapshot.facts,
                "recent_messages": snapshot.recent_messages,
                "retrieved_chunks": snapshot.retrieved_chunks,
            },
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
