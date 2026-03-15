from datetime import datetime

from pydantic import BaseModel


class SessionMessage(BaseModel):
    role: str
    content: str
    created_at: datetime | None = None


class SessionFact(BaseModel):
    fact_key: str
    fact_value: str


class SessionChunk(BaseModel):
    document_title: str
    chunk_index: int
    content: str


class ContextDiffItem(BaseModel):
    type: str
    value: str


class ContextDiffPayload(BaseModel):
    added: list[ContextDiffItem]
    removed: list[ContextDiffItem]
    unchanged: list[ContextDiffItem]


class SessionContextResponse(BaseModel):
    session_id: str
    user_id: str
    messages: list[SessionMessage]
    recent_messages: list[SessionMessage]
    summary: str
    facts: list[SessionFact]
    chunks: list[SessionChunk]
    task_state: dict[str, str]
    latest_turn: int


class ContextDiffResponse(BaseModel):
    turn: int
    diff: ContextDiffPayload
