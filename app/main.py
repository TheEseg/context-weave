from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes_chat import router as chat_router
from app.api.routes_health import router as health_router
from app.core.logging import configure_logging
from app.db.session import init_db


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    init_db()
    yield


app = FastAPI(title="ContextWeave", version="0.1.0", lifespan=lifespan)
app.include_router(health_router)
app.include_router(chat_router)

