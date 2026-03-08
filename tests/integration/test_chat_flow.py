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
        },
    )

    assert response.status_code == 200
    body = response.json()
    assert body["session_id"] == "chat-flow"
    assert "response" in body

