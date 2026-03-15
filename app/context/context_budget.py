from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ContextBudgetBreakdown:
    unit: str
    system_prompt: int
    session_summary: int
    facts: int
    retrieved_chunks: int
    recent_messages: int
    final_packed_context_total: int
    model_limit: int
    usage_ratio: float
    warning: str | None
    truncated: bool


def calculate_context_budget(
    *,
    system_prompt: str,
    session_summary: str,
    facts_text: str,
    retrieved_chunks_text: str,
    recent_messages_text: str,
    final_packed_context: str,
    model_limit: int,
    truncated: bool = False,
) -> ContextBudgetBreakdown:
    safe_limit = max(model_limit, 1)
    total = len(final_packed_context)
    usage_ratio = total / safe_limit

    warning: str | None = None
    if truncated:
        warning = "Packed context was truncated to stay within the configured model limit."
    elif usage_ratio >= 1.0:
        warning = "Prompt budget exceeded the configured model limit."
    elif usage_ratio >= 0.8:
        warning = "Prompt budget is approaching the configured model limit."

    return ContextBudgetBreakdown(
        unit="chars",
        system_prompt=len(system_prompt),
        session_summary=len(session_summary),
        facts=len(facts_text),
        retrieved_chunks=len(retrieved_chunks_text),
        recent_messages=len(recent_messages_text),
        final_packed_context_total=total,
        model_limit=safe_limit,
        usage_ratio=round(usage_ratio, 4),
        warning=warning,
        truncated=truncated,
    )
