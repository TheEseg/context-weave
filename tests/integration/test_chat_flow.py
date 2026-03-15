from app.db.models import Chunk, Document


def test_chat_endpoint_persists_and_returns_grounded_response(client, db_session) -> None:
    document = Document(title="Architecture", source="architecture-doc")
    db_session.add(document)
    db_session.flush()
    db_session.add(
        Chunk(
            document_id=document.id,
            chunk_index=0,
            content="The system uses FastAPI, Redis, and PostgreSQL for the demo stack.",
        )
    )
    db_session.commit()

    response = client.post(
        "/chat",
        json={
            "session_id": "chat-flow",
            "user_id": "demo-user",
            "message": "What stack should I remember?",
            "memory_enabled": True,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["session_id"] == "chat-flow"
    assert "FastAPI" in body["response"]
    assert body["debug"]["memory_enabled"] is True
    assert "Current user message:" in body["debug"]["final_packed_context"]
    assert body["debug"]["context_length_chars"] > 0


def test_chat_endpoint_can_bypass_memory_layers(client, db_session) -> None:
    response = client.post(
        "/chat",
        json={
            "session_id": "memory-off",
            "user_id": "demo-user",
            "message": "What architecture did we decide?",
            "memory_enabled": False,
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert "Memory is off" in body["response"]
    assert body["debug"]["memory_enabled"] is False
    assert body["debug"]["session_summary"] == "disabled"
    assert body["debug"]["retrieved_facts"] == []
    assert body["debug"]["retrieved_chunks"] == []
    assert body["debug"]["final_packed_context"] == "Current user message:\nWhat architecture did we decide?"


def test_chat_endpoint_creates_context_snapshot(client, memory_store) -> None:
    response = client.post(
        "/chat",
        json={
            "session_id": "snapshot-demo",
            "user_id": "demo-user",
            "message": "The architecture uses FastAPI and Redis.",
            "memory_enabled": True,
        },
    )

    assert response.status_code == 200
    snapshots = memory_store.get_context_snapshots("snapshot-demo")
    assert len(snapshots) == 1
    assert snapshots[0]["turn"] == 1
    assert "Current user message:" in snapshots[0]["packed_context"]
    assert snapshots[0]["facts"] == []
    assert snapshots[0]["recent_messages"] == []
