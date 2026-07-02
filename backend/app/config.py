from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from backend/.env."""

    app_name: str = "AI Interview Preparation Platform API"
    environment: str = "development"
    openai_api_key: str = ""
    openai_model: str = "gpt-5.4-mini"
    use_mock_ai: bool = False
    mongo_uri: str = "mongodb://localhost:27017/ai_interview_platform"
    mongo_db_name: str = "ai_interview_platform"
    jwt_secret: str = Field(min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
