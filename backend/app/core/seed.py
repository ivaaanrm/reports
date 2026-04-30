from app.models.theme import Theme

DEFAULT_THEMES: list[dict] = [
    {
        "name": "Corporate Blue",
        "slug": "corporate-blue",
        "description": "Professional template with a deep navy palette for business reports",
        "is_default": True,
        "company_name": "Northwind Advisory",
        "palette": {
            "primary_color": "#003366",
            "secondary_color": "#4A4A4A",
            "accent_color": "#0F766E",
            "background_color": "#FFFFFF",
            "surface_color": "#F8FAFC",
            "muted_color": "#CBD5E1",
        },
        "markdown_preset": "enterprise",
        "advanced": {
            "typography": {
                "font_family": "Helvetica",
                "font_size_body": 11,
                "font_size_heading": 20,
                "line_spacing": 1.3,
            },
            "layout": {
                "page_size": "A4",
                "margin_top": 72.0,
                "margin_bottom": 72.0,
                "margin_left": 72.0,
                "margin_right": 72.0,
                "columns": 1,
            },
            "header": {
                "enabled": True,
                "text": "Confidential",
                "align": "left",
                "show_logo": False,
                "divider": True,
                "show_page_numbers": False,
            },
            "footer": {
                "enabled": True,
                "text": "Northwind Advisory",
                "align": "left",
                "show_logo": False,
                "divider": True,
                "show_page_numbers": True,
            },
        },
    },
    {
        "name": "Editorial Warm",
        "slug": "editorial-warm",
        "description": "Warm, spacious template with editorial rhythm",
        "is_default": False,
        "company_name": "Meridian Research",
        "palette": {
            "primary_color": "#B8531C",
            "secondary_color": "#3D3D3D",
            "accent_color": "#7C2D12",
            "background_color": "#FFFFFF",
            "surface_color": "#FFF7ED",
            "muted_color": "#FCD9C6",
        },
        "markdown_preset": "executive",
        "advanced": {
            "typography": {
                "font_family": "Helvetica",
                "font_size_body": 12,
                "font_size_heading": 24,
                "line_spacing": 1.5,
            },
            "layout": {
                "page_size": "LETTER",
                "margin_top": 96.0,
                "margin_bottom": 96.0,
                "margin_left": 108.0,
                "margin_right": 108.0,
                "columns": 1,
            },
            "header": {
                "enabled": False,
                "text": None,
                "align": "left",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": False,
            },
            "footer": {
                "enabled": True,
                "text": "Meridian Research",
                "align": "right",
                "show_logo": False,
                "divider": True,
                "show_page_numbers": True,
            },
        },
    },
    {
        "name": "Modern Smooth",
        "slug": "modern-smooth",
        "description": "Soft surfaces, polished spacing, and calmer component blocks",
        "is_default": False,
        "company_name": "Atlas IoT Studio",
        "palette": {
            "primary_color": "#154A78",
            "secondary_color": "#52606D",
            "accent_color": "#2A9D8F",
            "background_color": "#F4F7FB",
            "surface_color": "#EAF1F7",
            "muted_color": "#C7D5E3",
        },
        "markdown_preset": "smooth",
        "advanced": {
            "typography": {
                "font_family": "Helvetica",
                "font_size_body": 11,
                "font_size_heading": 22,
                "line_spacing": 1.45,
            },
            "layout": {
                "page_size": "A4",
                "margin_top": 84.0,
                "margin_bottom": 72.0,
                "margin_left": 72.0,
                "margin_right": 72.0,
                "columns": 1,
            },
            "header": {
                "enabled": True,
                "text": "Atlas IoT Studio",
                "align": "left",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": False,
            },
            "footer": {
                "enabled": True,
                "text": "Strategy Report",
                "align": "right",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": True,
            },
        },
    },
]


async def seed_themes() -> None:
    for data in DEFAULT_THEMES:
        existing = await Theme.find_one(Theme.slug == data["slug"])
        if existing is None:
            await Theme(**data).insert()
