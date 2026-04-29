from datetime import datetime
from pydantic import BaseModel


class ThemeCreate(BaseModel):
    name: str
    slug: str
    description: str = ""
    is_default: bool = False
    font_family: str = "Helvetica"
    font_size_body: int = 11
    font_size_heading: int = 18
    primary_color: str = "#000000"
    secondary_color: str = "#666666"
    background_color: str = "#FFFFFF"
    page_size: str = "A4"
    margin_top: float = 72.0
    margin_bottom: float = 72.0
    margin_left: float = 72.0
    margin_right: float = 72.0
    line_spacing: float = 1.2
    columns: int = 1
    show_header: bool = True
    header_text: str | None = None
    show_footer: bool = True
    show_page_numbers: bool = True


class ThemeUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_default: bool | None = None
    font_family: str | None = None
    font_size_body: int | None = None
    font_size_heading: int | None = None
    primary_color: str | None = None
    secondary_color: str | None = None
    background_color: str | None = None
    page_size: str | None = None
    margin_top: float | None = None
    margin_bottom: float | None = None
    margin_left: float | None = None
    margin_right: float | None = None
    line_spacing: float | None = None
    columns: int | None = None
    show_header: bool | None = None
    header_text: str | None = None
    show_footer: bool | None = None
    show_page_numbers: bool | None = None


class ThemeResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: str
    is_default: bool
    font_family: str
    font_size_body: int
    font_size_heading: int
    primary_color: str
    secondary_color: str
    background_color: str
    page_size: str
    margin_top: float
    margin_bottom: float
    margin_left: float
    margin_right: float
    line_spacing: float
    columns: int
    show_header: bool
    header_text: str | None
    show_footer: bool
    show_page_numbers: bool
    created_at: datetime
    updated_at: datetime
