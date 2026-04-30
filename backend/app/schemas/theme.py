from datetime import datetime

from pydantic import BaseModel, Field

from app.models.theme import (
    AdvancedTemplateSettings,
    LogoAsset,
    PaletteSettings,
)


class ThemeCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    is_default: bool = False
    company_name: str = ""
    logo: LogoAsset | None = None
    palette: PaletteSettings = Field(default_factory=PaletteSettings)
    markdown_preset: str = "default-light"
    advanced: AdvancedTemplateSettings = Field(default_factory=AdvancedTemplateSettings)


class ThemeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_default: bool | None = None
    company_name: str | None = None
    logo: LogoAsset | None = None
    palette: PaletteSettings | None = None
    markdown_preset: str | None = None
    advanced: AdvancedTemplateSettings | None = None


class ThemeResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    is_default: bool
    company_name: str
    logo: LogoAsset | None
    palette: PaletteSettings
    markdown_preset: str
    advanced: AdvancedTemplateSettings
    created_at: datetime
    updated_at: datetime
