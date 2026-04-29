from datetime import datetime, timezone
from typing import Annotated
from beanie import Document, Indexed
from pydantic import Field


def _now() -> datetime:
    return datetime.now(timezone.utc)


class Theme(Document):
    name: str
    slug: Annotated[str, Indexed(unique=True)]
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

    created_at: datetime = Field(default_factory=_now)
    updated_at: datetime = Field(default_factory=_now)

    class Settings:
        name = "themes"
