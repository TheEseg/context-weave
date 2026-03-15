from app.db.models import Document, Chunk, Fact
from app.context.context_scorer import ContextScorer
from app.context.context_selector import ContextSelector
from app.retrieval.retriever import KeywordRetriever


def test_context_builder_merges_memory_facts_and_chunks(db_session, memory_store) -> None:
    document = Document(title="Stack Guide", source="stack-guide")
    db_session.add(document)
    db_session.flush()
    db_session.add(Chunk(document_id=document.id, chunk_index=0, content="FastAPI and Redis work well together."))
    db_session.add(
        Fact(
            session_id="sess-1",
            user_id="user-1",
            fact_key="technology",
            fact_value="PostgreSQL",
            confidence=0.9,
            source_type="test",
        )
    )
    db_session.commit()

    memory_store.append_recent_message("sess-1", {"role": "user", "content": "Hello"}, limit=6)
    memory_store.set_summary("sess-1", "Earlier we selected a web stack.")

    selector = ContextSelector(
        memory_store=memory_store,
        retriever=KeywordRetriever(limit=2),
        scorer=ContextScorer(),
        recent_limit=6,
        chunk_limit=2,
    )
    retrieved_memory = selector.retrieve_memory(db_session, "sess-1", "Tell me about FastAPI")
    scored_items = selector.score_context("Tell me about FastAPI", retrieved_memory)
    pack = selector.select_context(
        user_message="Tell me about FastAPI",
        retrieved_memory=retrieved_memory,
        scored_items=scored_items,
        memory_enabled=True,
    )

    assert pack.summary == "Earlier we selected a web stack."
    assert pack.recent_messages[0]["content"] == "Hello"
    assert {"fact_key": "technology", "fact_value": "PostgreSQL"} in pack.facts
    assert pack.chunks[0]["document_title"] == "Stack Guide"
