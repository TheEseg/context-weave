from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class ContextDiffEntry:
    type: str
    value: str


@dataclass(frozen=True, slots=True)
class ContextSnapshot:
    turn: int
    packed_context: str
    facts: list[dict[str, str]]
    recent_messages: list[dict[str, str]]
    retrieved_chunks: list[dict[str, str | int]]


@dataclass(frozen=True, slots=True)
class ContextDiffResult:
    added: list[ContextDiffEntry]
    removed: list[ContextDiffEntry]
    unchanged: list[ContextDiffEntry]


def build_context_snapshot(
    turn: int,
    packed_context: str,
    facts: list[dict[str, str]],
    recent_messages: list[dict[str, str]],
    retrieved_chunks: list[dict[str, str | int]],
) -> ContextSnapshot:
    return ContextSnapshot(
        turn=turn,
        packed_context=packed_context,
        facts=facts,
        recent_messages=recent_messages,
        retrieved_chunks=retrieved_chunks,
    )


def diff_snapshots(previous: ContextSnapshot | None, current: ContextSnapshot) -> ContextDiffResult:
    previous_entries = _snapshot_entries(previous) if previous else set()
    current_entries = _snapshot_entries(current)

    added = sorted(current_entries - previous_entries, key=_sort_key)
    removed = sorted(previous_entries - current_entries, key=_sort_key)
    unchanged = sorted(current_entries & previous_entries, key=_sort_key)

    return ContextDiffResult(added=added, removed=removed, unchanged=unchanged)


def _snapshot_entries(snapshot: ContextSnapshot) -> set[ContextDiffEntry]:
    entries: set[ContextDiffEntry] = {ContextDiffEntry(type="packed_context", value=snapshot.packed_context)}

    for fact in snapshot.facts:
        entries.add(ContextDiffEntry(type="fact", value=f'{fact["fact_key"]} = {fact["fact_value"]}'))

    for message in snapshot.recent_messages:
        entries.add(ContextDiffEntry(type="recent_message", value=f'{message["role"]}: {message["content"]}'))

    for chunk in snapshot.retrieved_chunks:
        entries.add(
            ContextDiffEntry(
                type="retrieval_chunk",
                value=f'{chunk["document_title"]}#{chunk["chunk_index"]}: {chunk["content"]}',
            )
        )

    return entries


def _sort_key(entry: ContextDiffEntry) -> tuple[str, str]:
    return entry.type, entry.value
