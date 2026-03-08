from sqlalchemy import select

from app.db.models import Message, Session


def test_postgresql_model_persistence_shape(db_session) -> None:
    session = Session(id="persist-1", user_id="user-1")
    db_session.add(session)
    db_session.add(Message(session_id="persist-1", role="user", content="Persist this"))
    db_session.commit()

    stored_session = db_session.scalar(select(Session).where(Session.id == "persist-1"))
    stored_message = db_session.scalar(select(Message).where(Message.session_id == "persist-1"))

    assert stored_session is not None
    assert stored_message is not None
    assert stored_message.content == "Persist this"

