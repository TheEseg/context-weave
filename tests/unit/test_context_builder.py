from app.db.models import Document, Chunk, Fact
from app.memory.context_builder import ContextBuilder
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

    builder = ContextBuilder(memory_store=memory_store, retriever=KeywordRetriever(limit=2), recent_limit=6)
    pack = builder.build(db_session, "sess-1", "Tell me about FastAPI")

    assert pack.summary == "Earlier we selected a web stack."
    assert pack.recent_messages[0]["content"] == "Hello"
    assert {"fact_key": "technology", "fact_value": "PostgreSQL"} in pack.facts
    assert pack.chunks[0]["document_title"] == "Stack Guide"

