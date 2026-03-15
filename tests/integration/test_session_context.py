from app.db.models import Chunk, Document


def test_session_context_endpoint_returns_messages_and_memory(client, db_session) -> None:
    document = Document(title="Memory Guide", source="memory-guide")
    db_session.add(document)
    db_session.flush()
    db_session.add(
        Chunk(
            document_id=document.id,
            chunk_index=0,
            content="Redis and PostgreSQL are part of the ContextWeave stack.",
        )
    )
    db_session.commit()

    response = client.post(
        "/chat",
        json={
            "session_id": "context-demo",
            "user_id": "demo-user",
            "message": "The architecture uses Redis and PostgreSQL.",
        },
    )
    assert response.status_code == 200

    context_response = client.get("/sessions/context-demo/context")
    assert context_response.status_code == 200

    body = context_response.json()
    assert body["session_id"] == "context-demo"
    assert len(body["messages"]) == 2
    assert body["summary"]
    assert any(fact["fact_value"] == "Redis" for fact in body["facts"])
    assert body["task_state"]["last_user_message"] == "The architecture uses Redis and PostgreSQL."
    assert body["latest_turn"] == 1


def test_context_diff_endpoint_compares_current_turn_with_previous(client) -> None:
    first = client.post(
        "/chat",
        json={
            "session_id": "diff-demo",
            "user_id": "demo-user",
            "message": "The architecture uses Redis.",
            "memory_enabled": True,
        },
    )
    second = client.post(
        "/chat",
        json={
            "session_id": "diff-demo",
            "user_id": "demo-user",
            "message": "The architecture also uses FastAPI.",
            "memory_enabled": True,
        },
    )
    third = client.post(
        "/chat",
        json={
            "session_id": "diff-demo",
            "user_id": "demo-user",
            "message": "What architecture did we decide?",
            "memory_enabled": True,
        },
    )

    assert first.status_code == 200
    assert second.status_code == 200
    assert third.status_code == 200

    diff_response = client.get("/sessions/diff-demo/context-diff/3")
    assert diff_response.status_code == 200

    body = diff_response.json()
    assert body["turn"] == 3
    assert any(item["value"] == "technology = FastAPI" for item in body["diff"]["added"])
    assert any(item["type"] == "fact" for item in body["diff"]["unchanged"])
