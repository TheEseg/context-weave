def test_context_continuity_recalls_selected_stack(client) -> None:
    turns = [
        "The architecture uses FastAPI, Redis, and PostgreSQL.",
        "Also note that the report name is rai_occulto.",
        "Can you remind me which stack we chose earlier?",
    ]

    final_response = ""
    for message in turns:
        response = client.post(
            "/chat",
            json={"session_id": "scenario-1", "user_id": "scenario-user", "message": message},
        )
        assert response.status_code == 200
        final_response = response.json()["response"]

    assert "FastAPI" in final_response
    assert "Redis" in final_response
    assert "PostgreSQL" in final_response

