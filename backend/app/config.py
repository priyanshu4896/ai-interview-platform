from functools import lru_cache

from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application configuration loaded from backend/.env."""

    app_name: str = "AI Interview Preparation Platform API"
    environment: str = "development"
    openai_api_key: str | None = None
    openai_model: str = "gpt-5.4-mini"
    use_mock_ai: bool = False
    mongo_uri: str
    mongo_db_name: str = "ai_interview_platform"
    jwt_secret: str = Field(min_length=16)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    allowed_origins: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @model_validator(mode="after")
    def validate_ai_configuration(self):
        if not self.use_mock_ai and not self.openai_api_key:
            raise ValueError("OPENAI_API_KEY is required when USE_MOCK_AI=false")
        return self

    @property
    def cors_origins(self) -> list[str]:
        origins = {
            origin.strip().rstrip("/")
            for origin in self.allowed_origins.split(",")
            if origin.strip()
        }
        if self.environment.lower() == "development":
            origins.update({"http://localhost:5173", "http://127.0.0.1:5173"})
        return sorted(origins)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
