from __future__ import annotations

from abc import ABC, abstractmethod

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Chunk, Document
from app.retrieval.ranking import keyword_score


class BaseRetriever(ABC):
    @abstractmethod
    def retrieve(self, db: Session, query: str) -> list[dict[str, str | int]]:
        raise NotImplementedError


class KeywordRetriever(BaseRetriever):
    def __init__(self, limit: int = 3):
        self.limit = limit

    def retrieve(self, db: Session, query: str) -> list[dict[str, str | int]]:
        rows = db.execute(select(Chunk, Document).join(Document, Chunk.document_id == Document.id)).all()
        scored: list[tuple[int, Chunk, Document]] = []
        for chunk, document in rows:
            score = keyword_score(query, chunk.content)
            if score > 0:
                scored.append((score, chunk, document))
        scored.sort(key=lambda item: (-item[0], item[1].chunk_index))
        return [
            {
                "document_title": document.title,
                "chunk_index": chunk.chunk_index,
                "content": chunk.content,
            }
            for _, chunk, document in scored[: self.limit]
        ]

