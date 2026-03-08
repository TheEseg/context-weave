from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=128)
    user_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=4000)


class ContextDebug(BaseModel):
    recent_messages: list[dict[str, str]]
    summary: str
    facts: list[dict[str, str]]
    chunks: list[dict[str, str | int]]


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_id: str
    user_id: str
    response: str
    debug: ContextDebug | None = None

