from app.context.context_diff import build_context_snapshot, diff_snapshots


def test_context_diff_is_deterministic() -> None:
    previous = build_context_snapshot(
        turn=1,
        packed_context="Current user message:\nWe chose Redis.",
        facts=[{"fact_key": "technology", "fact_value": "Redis"}],
        recent_messages=[{"role": "user", "content": "We chose Redis."}],
        retrieved_chunks=[],
    )
    current = build_context_snapshot(
        turn=2,
        packed_context="Current user message:\nWe chose Redis and FastAPI.",
        facts=[
            {"fact_key": "technology", "fact_value": "Redis"},
            {"fact_key": "technology", "fact_value": "FastAPI"},
        ],
        recent_messages=[{"role": "user", "content": "We chose Redis and FastAPI."}],
        retrieved_chunks=[],
    )

    diff = diff_snapshots(previous, current)

    assert [item.value for item in diff.added] == [
        "technology = FastAPI",
        "Current user message:\nWe chose Redis and FastAPI.",
        "user: We chose Redis and FastAPI.",
    ]
    assert [item.value for item in diff.removed] == [
        "Current user message:\nWe chose Redis.",
        "user: We chose Redis.",
    ]
    assert [item.value for item in diff.unchanged] == ["technology = Redis"]
