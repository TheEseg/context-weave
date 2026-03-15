from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ContextPack:
    memory_enabled: bool
    recent_messages: list[dict[str, str]]
    summary: str
    facts: list[dict[str, str]]
    chunks: list[dict[str, str | int]]
    packed_context: str

    @classmethod
    def direct_message_only(cls, user_message: str) -> "ContextPack":
        packed_context = f"Current user message:\n{user_message}"
        return cls(
            memory_enabled=False,
            recent_messages=[],
            summary="disabled",
            facts=[],
            chunks=[],
            packed_context=packed_context,
        )

    def pack_for_model(self, user_message: str | None = None) -> str:
        return self.packed_context

    def context_length_chars(self, user_message: str | None = None) -> int:
        return len(self.packed_context)


def pack_context(
    *,
    user_message: str,
    memory_enabled: bool,
    summary: str,
    facts: list[dict[str, str]],
    recent_messages: list[dict[str, str]],
    chunks: list[dict[str, str | int]],
) -> ContextPack:
    if not memory_enabled:
        return ContextPack.direct_message_only(user_message)

    parts: list[str] = []
    if summary:
        parts.append(f"Session summary:\n{summary}")
    if facts:
        fact_lines = "\n".join(f'- {fact["fact_key"]}: {fact["fact_value"]}' for fact in facts)
        parts.append(f"Retrieved facts:\n{fact_lines}")
    if chunks:
        chunk_lines = "\n\n".join(
            f'[{chunk["document_title"]}#{chunk["chunk_index"]}] {chunk["content"]}'
            for chunk in chunks
        )
        parts.append(f"Retrieved chunks:\n{chunk_lines}")
    if recent_messages:
        recent_lines = "\n".join(f'- {message["role"]}: {message["content"]}' for message in recent_messages)
        parts.append(f"Recent messages:\n{recent_lines}")
    parts.append(f"Current user message:\n{user_message}")

    return ContextPack(
        memory_enabled=True,
        recent_messages=recent_messages,
        summary=summary,
        facts=facts,
        chunks=chunks,
        packed_context="\n\n".join(parts),
    )
