from __future__ import annotations

from pathlib import Path

from app.db.session import SessionLocal, init_db
from app.services.ingestion_service import IngestionService


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        service = IngestionService(db=db)
        root = Path(__file__).resolve().parent.parent / "examples" / "sample_documents"
        processed = service.ingest_directory(root)
        print(f"Ingested {processed} documents from {root}")
    finally:
        db.close()


if __name__ == "__main__":
    main()

