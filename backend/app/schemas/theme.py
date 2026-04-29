from datetime import datetime
from pydantic import BaseModel, Field
from app.models.theme import HeaderFooterSettings, LogoAsset, MarkdownStyles


class ThemeCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    is_default: bool = False
    company_name: str = ""
    font_family: str = "Helvetica"
    font_size_body: int = 11
    font_size_heading: int = 18
    primary_color: str = "#000000"
    secondary_color: str = "#666666"
    accent_color: str = "#0F766E"
    background_color: str = "#FFFFFF"
    surface_color: str = "#F8FAFC"
    muted_color: str = "#CBD5E1"
    page_size: str = "A4"
    margin_top: float = 72.0
    margin_bottom: float = 72.0
    margin_left: float = 72.0
    margin_right: float = 72.0
    line_spacing: float = 1.2
    columns: int = 1
    logo: LogoAsset | None = None
    header: HeaderFooterSettings = Field(
        default_factory=lambda: HeaderFooterSettings(show_logo=True)
    )
    footer: HeaderFooterSettings = Field(
        default_factory=lambda: HeaderFooterSettings(show_page_numbers=True)
    )
    markdown_preset: str = "enterprise"
    markdown_styles: MarkdownStyles = Field(default_factory=MarkdownStyles)


class ThemeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_default: bool | None = None
    company_name: str | None = None
    font_family: str | None = None
    font_size_body: int | None = None
    font_size_heading: int | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    accent_color: str | None = None
    background_color: str | None = None
    surface_color: str | None = None
    muted_color: str | None = None
    page_size: str | None = None
    margin_top: float | None = None
    margin_bottom: float | None = None
    margin_left: float | None = None
    margin_right: float | None = None
    line_spacing: float | None = None
    columns: int | None = None
    logo: LogoAsset | None = None
    header: HeaderFooterSettings | None = None
    footer: HeaderFooterSettings | None = None
    markdown_preset: str | None = None
    markdown_styles: MarkdownStyles | None = None


class ThemeResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    is_default: bool
    company_name: str
    font_family: str
    font_size_body: int
    font_size_heading: int
    primary_color: str
    secondary_color: str
    accent_color: str
    background_color: str
    surface_color: str
    muted_color: str
    page_size: str
    margin_top: float
    margin_bottom: float
    margin_left: float
    margin_right: float
    line_spacing: float
    columns: int
    logo: LogoAsset | None
    header: HeaderFooterSettings
    footer: HeaderFooterSettings
    markdown_preset: str
    markdown_styles: MarkdownStyles
    created_at: datetime
    updated_at: datetime
