from __future__ import annotations


class SessionSummarizer:
    def __init__(self, char_limit: int = 400):
        self.char_limit = char_limit

    def summarize(self, existing_summary: str, recent_messages: list[dict[str, str]]) -> str:
        snippets: list[str] = []
        if existing_summary:
            snippets.append(existing_summary.strip())
        for message in recent_messages[-6:]:
            role = message["role"]
            content = " ".join(message["content"].split())
            snippets.append(f"{role}: {content}")
        joined = " | ".join(snippets)
        return joined[: self.char_limit].strip(" |")

