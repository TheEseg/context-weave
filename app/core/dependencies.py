from fastapi import Depends

from app.core.config import Settings, get_settings
from app.db.session import get_db
from app.memory.context_builder import ContextBuilder
from app.memory.fact_extractor import FactExtractor
from app.memory.redis_store import RedisMemoryStore
from app.memory.summarizer import SessionSummarizer
from app.retrieval.retriever import KeywordRetriever
from app.services.chat_service import ChatService
from app.services.ingestion_service import IngestionService
from app.services.llm_provider import build_llm_provider


def get_memory_store(settings: Settings = Depends(get_settings)) -> RedisMemoryStore:
    return RedisMemoryStore(settings.redis_url)


def get_chat_service(
    settings: Settings = Depends(get_settings),
    db=Depends(get_db),
    memory_store: RedisMemoryStore = Depends(get_memory_store),
) -> ChatService:
    retriever = KeywordRetriever(limit=settings.retrieval_limit)
    context_builder = ContextBuilder(
        memory_store=memory_store,
        retriever=retriever,
        recent_limit=settings.recent_message_limit,
    )
    return ChatService(
        db=db,
        memory_store=memory_store,
        summarizer=SessionSummarizer(char_limit=settings.summary_char_limit),
        fact_extractor=FactExtractor(),
        context_builder=context_builder,
        llm_provider=build_llm_provider(settings),
        settings=settings,
    )


def get_ingestion_service(
    settings: Settings = Depends(get_settings),
    db=Depends(get_db),
) -> IngestionService:
    return IngestionService(db=db, retrieval_limit=settings.retrieval_limit)

