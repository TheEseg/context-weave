from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_env: str = "development"
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    database_url: str = "postgresql+psycopg://contextweave:contextweave@localhost:5432/contextweave"
    redis_url: str = "redis://localhost:6379/0"

    openai_api_key: str | None = None
    llm_provider: str = "mock"
    debug_context: bool = False
    cors_origins: str = "http://localhost:5173"

    recent_message_limit: int = 6
    retrieval_limit: int = 3
    summary_char_limit: int = 400
    model_context_limit: int = 4096

    model_config = SettingsConfigDict(
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()


def get_cors_origins(settings: Settings) -> list[str]:
    return [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]
