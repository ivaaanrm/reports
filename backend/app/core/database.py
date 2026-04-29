from beanie import init_beanie
from pymongo import AsyncMongoClient
from app.core.config import settings
from app.core.seed import seed_themes
from app.models.theme import Theme


async def init_db() -> None:
    client = AsyncMongoClient(settings.mongodb_url)
    await init_beanie(
        database=client[settings.database_name],
        document_models=[Theme],
    )
    await seed_themes()
