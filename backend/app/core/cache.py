import asyncio
import time
from dataclasses import dataclass
from hashlib import sha256
from pathlib import Path
from tempfile import NamedTemporaryFile

from redis.asyncio import Redis

from app.core.config import settings
from app.models.theme import Theme

_redis: Redis | None = None
_sweeper_task: asyncio.Task | None = None


@dataclass(frozen=True)
class CacheTarget:
    key: str
    path: Path


def _cache_dir() -> Path:
    return Path(settings.pdf_cache_dir)


def _cache_key_prefix() -> str:
    return settings.redis_key_prefix.strip(":") or "pdf-cache"


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
        key=f"{_cache_key_prefix()}:{theme.slug}:{digest}",
        path=_cache_dir() / filename,
    )


async def _sweep_expired_files() -> None:
    cache_dir = _cache_dir()
    while True:
        await asyncio.sleep(settings.redis_sweep_interval_seconds)
        try:
            cutoff = time.time() - settings.redis_cache_ttl_seconds
            for pdf_file in cache_dir.glob("*.pdf"):
                try:
                    if pdf_file.stat().st_mtime < cutoff:
                        _delete_pdf_file(pdf_file)
                except OSError:
                    pass
        except asyncio.CancelledError:
            return
        except Exception:
            pass


async def init_cache() -> None:
    global _redis, _sweeper_task

    _cache_dir().mkdir(parents=True, exist_ok=True)
    _redis = Redis.from_url(
        settings.redis_url,
        decode_responses=True,
        socket_connect_timeout=settings.redis_socket_connect_timeout_seconds,
        socket_timeout=settings.redis_socket_timeout_seconds,
        health_check_interval=settings.redis_health_check_interval_seconds,
        max_connections=settings.redis_max_connections,
        retry_on_timeout=settings.redis_retry_on_timeout,
        client_name=settings.redis_client_name,
    )
    await _redis.ping()
    _sweeper_task = asyncio.create_task(_sweep_expired_files())


async def close_cache() -> None:
    global _redis, _sweeper_task

    if _sweeper_task is not None:
        _sweeper_task.cancel()
        await asyncio.gather(_sweeper_task, return_exceptions=True)
        _sweeper_task = None

    if _redis is not None:
        await _redis.aclose()
        _redis = None


def _delete_pdf_file(path: Path) -> None:
    try:
        path.unlink(missing_ok=True)
    except OSError:
        pass


async def get_cached_pdf_path(target: CacheTarget) -> Path | None:
    redis = _get_redis()
    cached_path = await redis.get(target.key)

    if cached_path:
        path = Path(cached_path)
        if path.is_file():
            return path
        await redis.delete(target.key)
        return None

    # Key expired or was never set — clean up any orphaned file on disk
    if target.path.is_file():
        _delete_pdf_file(target.path)

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
    await redis.set(target.key, str(target.path), ex=settings.redis_cache_ttl_seconds)
    return target.path
