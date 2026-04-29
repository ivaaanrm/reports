from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "reports"
    redis_url: str = "redis://localhost:6379/0"
    pdf_cache_dir: str = "generated-pdfs"

    model_config = SettingsConfigDict(env_file=".env")


settings = Settings()
