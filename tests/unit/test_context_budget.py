from app.context.context_budget import calculate_context_budget


def test_context_budget_breakdown_uses_character_counts() -> None:
    budget = calculate_context_budget(
        system_prompt="You are ContextWeave.",
        session_summary="Summary: FastAPI and Redis were selected.",
        facts_text="Retrieved facts:\n- technology: FastAPI",
        retrieved_chunks_text="Retrieved chunks:\n[Architecture#0] Redis stores working memory.",
        recent_messages_text="Recent messages:\n- user: What stack did we choose?",
        final_packed_context="Summary + facts + chunks + recent messages + current user message",
        model_limit=4096,
    )

    assert budget.unit == "chars"
    assert budget.system_prompt == len("You are ContextWeave.")
    assert budget.session_summary > 0
    assert budget.facts > 0
    assert budget.retrieved_chunks > 0
    assert budget.recent_messages > 0
    assert budget.final_packed_context_total == len(
        "Summary + facts + chunks + recent messages + current user message"
    )
    assert budget.warning is None


def test_context_budget_warns_when_near_limit() -> None:
    budget = calculate_context_budget(
        system_prompt="",
        session_summary="summary",
        facts_text="facts",
        retrieved_chunks_text="chunks",
        recent_messages_text="recent",
        final_packed_context="x" * 90,
        model_limit=100,
    )

    assert budget.usage_ratio == 0.9
    assert budget.warning == "Prompt budget is approaching the configured model limit."


def test_context_budget_warns_when_truncated() -> None:
    budget = calculate_context_budget(
        system_prompt="",
        session_summary="",
        facts_text="",
        retrieved_chunks_text="",
        recent_messages_text="",
        final_packed_context="x" * 120,
        model_limit=100,
        truncated=True,
    )

    assert budget.warning == "Packed context was truncated to stay within the configured model limit."
    assert budget.truncated is True
