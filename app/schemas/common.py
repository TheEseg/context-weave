from datetime import datetime

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str


class MessageView(BaseModel):
    role: str
    content: str
    created_at: datetime | None = None

