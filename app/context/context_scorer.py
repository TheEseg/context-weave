from __future__ import annotations

from dataclasses import dataclass

from app.retrieval.ranking import keyword_score


@dataclass(frozen=True, slots=True)
class ScoredContextItem:
    item_type: str
    value: dict[str, str] | dict[str, str | int] | str
    score: int


class ContextScorer:
    def score(
        self,
        *,
        query: str,
        summary: str,
        facts: list[dict[str, str]],
        recent_messages: list[dict[str, str]],
        chunks: list[dict[str, str | int]],
    ) -> list[ScoredContextItem]:
        scored_items: list[ScoredContextItem] = []

        if summary:
            scored_items.append(
                ScoredContextItem(
                    item_type="summary",
                    value=summary,
                    score=3 + keyword_score(query, summary),
                )
            )

        for fact in facts:
            scored_items.append(
                ScoredContextItem(
                    item_type="fact",
                    value=fact,
                    score=4 + keyword_score(query, f'{fact["fact_key"]} {fact["fact_value"]}'),
                )
            )

        for message in recent_messages:
            scored_items.append(
                ScoredContextItem(
                    item_type="recent_message",
                    value=message,
                    score=2 + keyword_score(query, message["content"]),
                )
            )

        for chunk in chunks:
            scored_items.append(
                ScoredContextItem(
                    item_type="retrieval_chunk",
                    value=chunk,
                    score=3 + keyword_score(query, str(chunk["content"])),
                )
            )

        return sorted(scored_items, key=self._sort_key, reverse=True)

    @staticmethod
    def _sort_key(item: ScoredContextItem) -> tuple[int, str, str]:
        return item.score, item.item_type, str(item.value)
