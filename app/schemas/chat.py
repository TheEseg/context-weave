from pydantic import BaseModel, ConfigDict, Field


class ChatRequest(BaseModel):
    session_id: str = Field(min_length=1, max_length=128)
    user_id: str = Field(min_length=1, max_length=128)
    message: str = Field(min_length=1, max_length=4000)
    memory_enabled: bool = True


class ContextDebug(BaseModel):
    model_config = ConfigDict(extra="forbid")

    class ContextBudget(BaseModel):
        model_config = ConfigDict(extra="forbid")

        unit: str
        system_prompt: int
        session_summary: int
        facts: int
        retrieved_chunks: int
        recent_messages: int
        final_packed_context_total: int
        model_limit: int
        usage_ratio: float
        warning: str | None = None
        truncated: bool = False

    memory_enabled: bool
    recent_messages: list[dict[str, str]]
    session_summary: str
    retrieved_facts: list[dict[str, str]]
    retrieved_chunks: list[dict[str, str | int]]
    final_packed_context: str
    context_length_chars: int
    context_budget: ContextBudget


class ChatResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    session_id: str
    user_id: str
    response: str
    debug: ContextDebug | None = None
