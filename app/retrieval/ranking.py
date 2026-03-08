from __future__ import annotations


def keyword_score(query: str, content: str) -> int:
    query_terms = {token.lower() for token in query.split() if token.strip()}
    content_terms = {token.lower().strip(".,") for token in content.split() if token.strip()}
    return len(query_terms & content_terms)

