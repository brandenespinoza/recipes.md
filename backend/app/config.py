from functools import lru_cache
from pathlib import Path

from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "RECIPES.MD"
    api_prefix: str = "/api"

    # JWT / multi-user auth
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    cookie_secure: bool = False

    # Storage (Docker: hard-coded to /recipes)
    output_dir: Path = Path("/recipes")
    # OpenAI / LLM
    openai_api_key: str
    openai_model: str

    # CORS / Frontend
    frontend_origin: AnyHttpUrl | None = None

    class Config:
        env_file = str(Path(__file__).resolve().parents[2] / ".env")
        env_prefix = ""
        case_sensitive = False


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    settings = Settings()
    settings.output_dir.mkdir(parents=True, exist_ok=True)
    return settings
