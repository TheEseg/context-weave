from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(slots=True)
class ExtractedFact:
    fact_key: str
    fact_value: str
    confidence: float = 0.7
    source_type: str = "heuristic"


class FactExtractor:
    stack_pattern = re.compile(
        r"(?:uses|use|chosen|includes|include)\s+([A-Za-z0-9_,\-\s]+(?:and\s+[A-Za-z0-9_\-]+)?)",
        re.IGNORECASE,
    )
    named_pattern = re.compile(
        r"(?:the\s+)?(?P<key>[a-zA-Z][a-zA-Z0-9_\s]+?)\s+(?:is|=)\s+(?P<value>[A-Za-z0-9_\-]+)",
        re.IGNORECASE,
    )

    def extract(self, message: str) -> list[ExtractedFact]:
        results: list[ExtractedFact] = []
        normalized = message.strip()

        stack_match = self.stack_pattern.search(normalized)
        if stack_match:
            technologies = self._split_items(stack_match.group(1))
            for tech in technologies:
                results.append(ExtractedFact(fact_key="technology", fact_value=tech, confidence=0.8))

        for match in self.named_pattern.finditer(normalized):
            key = "_".join(match.group("key").lower().split())
            value = match.group("value")
            results.append(ExtractedFact(fact_key=key, fact_value=value, confidence=0.75))

        unique: dict[tuple[str, str], ExtractedFact] = {}
        for fact in results:
            unique[(fact.fact_key, fact.fact_value)] = fact
        return list(unique.values())

    @staticmethod
    def _split_items(raw: str) -> list[str]:
        cleaned = raw.replace(".", "")
        parts = re.split(r",| and ", cleaned)
        return [part.strip() for part in parts if part.strip()]
