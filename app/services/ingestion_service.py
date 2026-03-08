from __future__ import annotations

from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import Chunk, Document
from app.retrieval.chunker import chunk_text


class IngestionService:
    def __init__(self, db: Session, retrieval_limit: int = 3):
        self.db = db
        self.retrieval_limit = retrieval_limit

    def ingest_directory(self, directory: Path) -> int:
        processed = 0
        for path in sorted(directory.glob("*")):
            if path.is_file():
                self.ingest_document(path)
                processed += 1
        return processed

    def ingest_document(self, path: Path) -> Document:
        existing = self.db.scalar(select(Document).where(Document.source == str(path)))
        if existing:
            return existing

        document = Document(title=path.stem.replace("_", " ").title(), source=str(path))
        self.db.add(document)
        self.db.flush()

        for index, content in enumerate(chunk_text(path.read_text(encoding="utf-8"))):
            self.db.add(Chunk(document_id=document.id, chunk_index=index, content=content, embedding=None))

        self.db.commit()
        self.db.refresh(document)
        return document

