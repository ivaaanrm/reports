from app.models.theme import Theme

DEFAULT_THEMES: list[dict] = [
    {
        "name": "Corporate Blue",
        "slug": "corporate-blue",
        "description": "Professional theme with a deep navy palette — ideal for business reports",
        "is_default": True,
        "font_family": "Helvetica",
        "font_size_body": 11,
        "font_size_heading": 20,
        "primary_color": "#003366",
        "secondary_color": "#4A4A4A",
        "background_color": "#FFFFFF",
        "page_size": "A4",
        "margin_top": 72.0,
        "margin_bottom": 72.0,
        "margin_left": 72.0,
        "margin_right": 72.0,
        "line_spacing": 1.3,
        "columns": 1,
        "show_header": True,
        "header_text": "Confidential",
        "show_footer": True,
        "show_page_numbers": True,
    },
    {
        "name": "Editorial Warm",
        "slug": "editorial-warm",
        "description": "Generous whitespace and warm accents — magazine-style spread",
        "is_default": False,
        "font_family": "Helvetica",
        "font_size_body": 12,
        "font_size_heading": 24,
        "primary_color": "#B8531C",
        "secondary_color": "#3D3D3D",
        "background_color": "#FFFFFF",
        "page_size": "LETTER",
        "margin_top": 96.0,
        "margin_bottom": 96.0,
        "margin_left": 108.0,
        "margin_right": 108.0,
        "line_spacing": 1.5,
        "columns": 1,
        "show_header": False,
        "header_text": None,
        "show_footer": True,
        "show_page_numbers": True,
    },
]


async def seed_themes() -> None:
    if await Theme.find_one() is not None:
        return
    for data in DEFAULT_THEMES:
        await Theme(**data).insert()
