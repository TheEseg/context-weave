from __future__ import annotations

from collections.abc import Generator

import fakeredis
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.core.dependencies import get_chat_service
from app.db.base import Base
from app.memory.context_builder import ContextBuilder
from app.memory.fact_extractor import FactExtractor
from app.memory.redis_store import RedisMemoryStore
from app.memory.summarizer import SessionSummarizer
from app.retrieval.retriever import KeywordRetriever
from app.services.chat_service import ChatService
from app.services.llm_provider import MockLLMProvider


@pytest.fixture()
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        "sqlite://",
        future=True,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def memory_store() -> RedisMemoryStore:
    return RedisMemoryStore("redis://unused", client=fakeredis.FakeRedis(decode_responses=True))


@pytest.fixture()
def test_settings() -> Settings:
    return Settings(
        APP_ENV="test",
        APP_HOST="127.0.0.1",
        APP_PORT=8000,
        DATABASE_URL="sqlite://",
        REDIS_URL="redis://unused",
        LLM_PROVIDER="mock",
        DEBUG_CONTEXT=True,
    )


@pytest.fixture()
def client(
    db_session: Session,
    memory_store: RedisMemoryStore,
    test_settings: Settings,
) -> Generator[TestClient, None, None]:
    from app.main import app

    def override_chat_service() -> ChatService:
        retriever = KeywordRetriever(limit=3)
        context_builder = ContextBuilder(memory_store=memory_store, retriever=retriever, recent_limit=6)
        return ChatService(
            db=db_session,
            memory_store=memory_store,
            summarizer=SessionSummarizer(char_limit=400),
            fact_extractor=FactExtractor(),
            context_builder=context_builder,
            llm_provider=MockLLMProvider(),
            settings=test_settings,
        )

    app.dependency_overrides[get_chat_service] = override_chat_service
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()

