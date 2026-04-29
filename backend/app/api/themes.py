from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from app.models.theme import Theme
from app.schemas.theme import ThemeCreate, ThemeUpdate, ThemeResponse

router = APIRouter(prefix="/themes", tags=["Themes"])


def _serialize(theme: Theme) -> ThemeResponse:
    data = theme.model_dump(mode="json", exclude={"revision_id"})
    data["id"] = str(theme.id)
    return ThemeResponse(**data)


@router.get("/", response_model=list[ThemeResponse])
async def list_themes():
    return [_serialize(t) for t in await Theme.find_all().to_list()]


@router.post("/", response_model=ThemeResponse, status_code=status.HTTP_201_CREATED)
async def create_theme(data: ThemeCreate):
    if await Theme.find_one(Theme.slug == data.slug):
        raise HTTPException(status_code=409, detail="Slug already exists")
    theme = Theme(**data.model_dump())
    await theme.insert()
    return _serialize(theme)


@router.get("/{slug}", response_model=ThemeResponse)
async def get_theme(slug: str):
    theme = await Theme.find_one(Theme.slug == slug)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    return _serialize(theme)


@router.put("/{slug}", response_model=ThemeResponse)
async def update_theme(slug: str, data: ThemeUpdate):
    theme = await Theme.find_one(Theme.slug == slug)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    updates = data.model_dump(exclude_none=True)
    updates["updated_at"] = datetime.now(timezone.utc)
    for key, value in updates.items():
        setattr(theme, key, value)
    await theme.save()
    return _serialize(theme)


@router.delete("/{slug}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_theme(slug: str):
    theme = await Theme.find_one(Theme.slug == slug)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")
    await theme.delete()
