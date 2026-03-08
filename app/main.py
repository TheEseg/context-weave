import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_chat import router as chat_router
from app.api.routes_health import router as health_router
from app.api.routes_sessions import router as sessions_router
from app.core.config import get_cors_origins, get_settings
from app.core.logging import configure_logging
from app.db.session import init_db

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    configure_logging()
    settings = get_settings()
    raw_database_url = os.getenv("DATABASE_URL")
    logger.info(
        "Railway config diagnostics: env DATABASE_URL present=%s env_has_localhost=%s settings_has_localhost=%s",
        raw_database_url is not None,
        "localhost" in raw_database_url if raw_database_url else False,
        "localhost" in settings.database_url,
    )
    init_db()
    yield


app = FastAPI(title="ContextWeave", version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(get_settings()),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(health_router)
app.include_router(chat_router)
app.include_router(sessions_router)
