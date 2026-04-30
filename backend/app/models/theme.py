from datetime import datetime, timezone
from typing import Annotated, Literal

from beanie import Document, Indexed
from pydantic import BaseModel, Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class LogoAsset(BaseModel):
    file_name: str = ""
    mime_type: str = "image/png"
    data: str
    width: float = 96.0


class PaletteSettings(BaseModel):
    primary_color: str = "#000000"
    secondary_color: str = "#666666"
    accent_color: str = "#0F766E"
    background_color: str = "#FFFFFF"
    surface_color: str = "#F8FAFC"
    muted_color: str = "#CBD5E1"


class HeaderFooterSettings(BaseModel):
    enabled: bool = True
    text: str | None = None
    align: Literal["left", "center", "right"] = "left"
    show_logo: bool = False
    divider: bool = True
    show_page_numbers: bool = False


class TypographySettings(BaseModel):
    font_family: str = "Helvetica"
    font_size_body: int = 11
    font_size_heading: int = 18
    line_spacing: float = 1.2


class LayoutSettings(BaseModel):
    page_size: str = "A4"
    margin_top: float = 72.0
    margin_bottom: float = 72.0
    margin_left: float = 72.0
    margin_right: float = 72.0
    columns: int = 1


class HeadingStyle(BaseModel):
    color: str | None = None
    font_size: int | None = None
    space_before: float | None = None
    space_after: float | None = None


class HeadingStyles(BaseModel):
    h1: HeadingStyle = Field(default_factory=HeadingStyle)
    h2: HeadingStyle = Field(default_factory=HeadingStyle)
    h3: HeadingStyle = Field(default_factory=HeadingStyle)
    h4: HeadingStyle = Field(default_factory=HeadingStyle)


class BodyStyle(BaseModel):
    color: str | None = None
    font_size: int | None = None
    space_after: float | None = None


class ListStyle(BaseModel):
    text_color: str | None = None
    bullet_color: str | None = None
    item_spacing: float | None = None
    left_indent: float | None = None


class BlockquoteStyle(BaseModel):
    text_color: str | None = None
    border_color: str | None = None
    background_color: str | None = None
    left_indent: float | None = None
    padding: float | None = None


class CodeStyle(BaseModel):
    text_color: str | None = None
    background_color: str | None = None
    border_color: str | None = None
    font_size: int | None = None
    padding: float | None = None


class HorizontalRuleStyle(BaseModel):
    color: str | None = None
    thickness: float | None = None
    spacing_before: float | None = None
    spacing_after: float | None = None


class TableStyleSettings(BaseModel):
    header_background_color: str | None = None
    header_text_color: str | None = None
    row_background_color: str | None = None
    alternate_row_background_color: str | None = None
    border_color: str | None = None
    cell_padding: float | None = None


class MarkdownStyles(BaseModel):
    headings: HeadingStyles = Field(default_factory=HeadingStyles)
    body: BodyStyle = Field(default_factory=BodyStyle)
    lists: ListStyle = Field(default_factory=ListStyle)
    blockquotes: BlockquoteStyle = Field(default_factory=BlockquoteStyle)
    code: CodeStyle = Field(default_factory=CodeStyle)
    horizontal_rules: HorizontalRuleStyle = Field(default_factory=HorizontalRuleStyle)
    tables: TableStyleSettings = Field(default_factory=TableStyleSettings)


class AdvancedTemplateSettings(BaseModel):
    typography: TypographySettings = Field(default_factory=TypographySettings)
    layout: LayoutSettings = Field(default_factory=LayoutSettings)
    header: HeaderFooterSettings = Field(
        default_factory=lambda: HeaderFooterSettings(show_logo=True)
    )
    footer: HeaderFooterSettings = Field(
        default_factory=lambda: HeaderFooterSettings(show_page_numbers=True)
    )
    markdown_styles: MarkdownStyles = Field(default_factory=MarkdownStyles)


class Theme(Document):
    name: str
    slug: Annotated[str, Indexed(unique=True)]
    description: str = ""
    is_default: bool = False
    company_name: str = ""
    logo: LogoAsset | None = None
    palette: PaletteSettings = Field(default_factory=PaletteSettings)
    markdown_preset: Literal[
        "default-light", "default-dark", "modern-corporate", "creative-studio"
    ] = "default-light"
    advanced: AdvancedTemplateSettings = Field(default_factory=AdvancedTemplateSettings)
    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)

    class Settings:
        name = "themes"
