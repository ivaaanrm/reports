from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from tempfile import NamedTemporaryFile

from redis.asyncio import Redis

from app.core.config import settings
from app.models.theme import Theme

CACHE_KEY_PREFIX = "pdf-cache"

_redis: Redis | None = None


@dataclass(frozen=True)
class CacheTarget:
    key: str
    path: Path


def _cache_dir() -> Path:
    return Path(settings.pdf_cache_dir)


def _get_redis() -> Redis:
    if _redis is None:
        raise RuntimeError("Redis cache is not initialized")
    return _redis


def build_cache_target(markdown_text: str, theme: Theme) -> CacheTarget:
    digest = sha256(
        f"{theme.slug}\0{theme.updated_at.isoformat()}\0{markdown_text}".encode("utf-8")
    ).hexdigest()
    filename = f"{theme.slug}-{digest}.pdf"
    return CacheTarget(
        key=f"{CACHE_KEY_PREFIX}:{theme.slug}:{digest}",
        path=_cache_dir() / filename,
    )


async def init_cache() -> None:
    global _redis

    _cache_dir().mkdir(parents=True, exist_ok=True)
    _redis = Redis.from_url(settings.redis_url, decode_responses=True)
    await _redis.ping()


async def close_cache() -> None:
    global _redis

    if _redis is not None:
        await _redis.aclose()
        _redis = None


async def get_cached_pdf_path(target: CacheTarget) -> Path | None:
    redis = _get_redis()
    cached_path = await redis.get(target.key)

    if cached_path:
        path = Path(cached_path)
        if path.is_file():
            return path
        await redis.delete(target.key)

    if target.path.is_file():
        await redis.set(target.key, str(target.path))
        return target.path

    return None


async def store_cached_pdf(target: CacheTarget, pdf_bytes: bytes) -> Path:
    redis = _get_redis()
    target.path.parent.mkdir(parents=True, exist_ok=True)

    with NamedTemporaryFile(
        mode="wb",
        dir=target.path.parent,
        prefix=f"{target.path.stem}-",
        suffix=".tmp",
        delete=False,
    ) as handle:
        handle.write(pdf_bytes)
        temp_path = Path(handle.name)

    temp_path.replace(target.path)
    await redis.set(target.key, str(target.path))
    return target.path
