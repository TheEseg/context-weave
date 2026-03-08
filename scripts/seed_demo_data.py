from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.models import Fact, Message, Session
from app.db.session import SessionLocal, init_db


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        session = db.get(Session, "demo-session")
        if session is None:
            session = Session(id="demo-session", user_id="demo-user")
            db.add(session)
            db.flush()

        existing_messages = (
            db.query(Message).filter(Message.session_id == "demo-session").count()  # noqa: PLR2004
        )
        if existing_messages == 0:
            db.add_all(
                [
                    Message(
                        session_id="demo-session",
                        role="user",
                        content="The architecture uses FastAPI, Redis, and PostgreSQL.",
                    ),
                    Message(
                        session_id="demo-session",
                        role="assistant",
                        content="Recorded the architecture stack in layered memory.",
                    ),
                ]
            )

        existing_facts = db.query(Fact).filter(Fact.session_id == "demo-session").count()  # noqa: PLR2004
        if existing_facts == 0:
            db.add_all(
                [
                    Fact(
                        session_id="demo-session",
                        user_id="demo-user",
                        fact_key="technology",
                        fact_value="FastAPI",
                        confidence=0.9,
                        source_type="seed",
                    ),
                    Fact(
                        session_id="demo-session",
                        user_id="demo-user",
                        fact_key="technology",
                        fact_value="Redis",
                        confidence=0.9,
                        source_type="seed",
                    ),
                    Fact(
                        session_id="demo-session",
                        user_id="demo-user",
                        fact_key="technology",
                        fact_value="PostgreSQL",
                        confidence=0.9,
                        source_type="seed",
                    ),
                    Fact(
                        session_id="demo-session",
                        user_id="demo-user",
                        fact_key="report_name",
                        fact_value="rai_occulto",
                        confidence=0.8,
                        source_type="seed",
                    ),
                ]
            )

        db.commit()
        print("Seeded demo session: demo-session")
    finally:
        db.close()


if __name__ == "__main__":
    main()
