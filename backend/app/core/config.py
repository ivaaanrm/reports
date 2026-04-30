from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "reports"
    redis_url: str = "redis://localhost:6379/0"
    redis_key_prefix: str = Field(default="pdf-cache", min_length=1)
    redis_cache_ttl_seconds: int = Field(default=60, ge=1)
    redis_sweep_interval_seconds: int = Field(default=30, ge=1)
    redis_socket_connect_timeout_seconds: float = Field(default=2.0, gt=0)
    redis_socket_timeout_seconds: float = Field(default=5.0, gt=0)
    redis_health_check_interval_seconds: int = Field(default=30, ge=0)
    redis_max_connections: int = Field(default=50, ge=1)
    redis_retry_on_timeout: bool = True
    redis_client_name: str = Field(default="reports-backend", min_length=1)
    pdf_cache_dir: str = "generated-pdfs"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
