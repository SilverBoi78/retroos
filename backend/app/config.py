import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "dev-secret-change-me-in-production"
    DATABASE_URL: str = f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'retroos.db')}"
    ALGORITHM: str = "HS256"
    CORS_ORIGINS: list[str] = ["http://localhost:5173", "http://localhost:4173"]

    model_config = {"env_file": os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env"), "extra": "ignore"}

settings = Settings()
