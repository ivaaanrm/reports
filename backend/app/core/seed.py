from app.models.theme import Theme

DEFAULT_THEMES: list[dict] = [
    {
        "name": "Default Light",
        "slug": "default-light",
        "description": "The standard light report style with soft surfaces and calm rhythm",
        "is_default": True,
        "company_name": "Northwind Advisory",
        "palette": {
            "primary_color": "#173B63",
            "secondary_color": "#4B5B6A",
            "accent_color": "#1E847F",
            "background_color": "#F6F8FC",
            "surface_color": "#EAF0F6",
            "muted_color": "#C9D5E3",
        },
        "markdown_preset": "default-light",
        "advanced": {
            "typography": {
                "font_family": "Helvetica",
                "font_size_body": 11,
                "font_size_heading": 22,
                "line_spacing": 1.42,
            },
            "layout": {
                "page_size": "A4",
                "margin_top": 82.0,
                "margin_bottom": 72.0,
                "margin_left": 72.0,
                "margin_right": 72.0,
                "columns": 1,
            },
            "header": {
                "enabled": True,
                "text": "Default Light",
                "align": "left",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": False,
            },
            "footer": {
                "enabled": True,
                "text": "Northwind Advisory",
                "align": "right",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": True,
            },
        },
    },
    {
        "name": "Default Dark",
        "slug": "default-dark",
        "description": "The standard dark report style with high contrast and smooth panels",
        "is_default": False,
        "company_name": "Northwind Advisory",
        "palette": {
            "primary_color": "#E6EEF8",
            "secondary_color": "#B8C7D9",
            "accent_color": "#4FD1C5",
            "background_color": "#0F1724",
            "surface_color": "#162131",
            "muted_color": "#2E415A",
        },
        "markdown_preset": "default-dark",
        "advanced": {
            "typography": {
                "font_family": "Helvetica",
                "font_size_body": 11,
                "font_size_heading": 22,
                "line_spacing": 1.42,
            },
            "layout": {
                "page_size": "A4",
                "margin_top": 82.0,
                "margin_bottom": 72.0,
                "margin_left": 72.0,
                "margin_right": 72.0,
                "columns": 1,
            },
            "header": {
                "enabled": True,
                "text": "Default Dark",
                "align": "left",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": False,
            },
            "footer": {
                "enabled": True,
                "text": "Northwind Advisory",
                "align": "right",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": True,
            },
        },
    },
    {
        "name": "Modern Corporate",
        "slug": "modern-corporate",
        "description": "A sharper corporate style with crisp hierarchy and restrained surfaces",
        "is_default": False,
        "company_name": "Atlas Strategy Group",
        "palette": {
            "primary_color": "#0F2942",
            "secondary_color": "#4A5A67",
            "accent_color": "#2E6A8E",
            "background_color": "#F3F6F9",
            "surface_color": "#FFFFFF",
            "muted_color": "#D6E0E8",
        },
        "markdown_preset": "modern-corporate",
        "advanced": {
            "typography": {
                "font_family": "Helvetica",
                "font_size_body": 11,
                "font_size_heading": 22,
                "line_spacing": 1.34,
            },
            "layout": {
                "page_size": "A4",
                "margin_top": 78.0,
                "margin_bottom": 68.0,
                "margin_left": 72.0,
                "margin_right": 72.0,
                "columns": 1,
            },
            "header": {
                "enabled": True,
                "text": "Modern Corporate",
                "align": "left",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": False,
            },
            "footer": {
                "enabled": True,
                "text": "Atlas Strategy Group",
                "align": "right",
                "show_logo": False,
                "divider": True,
                "show_page_numbers": True,
            },
        },
    },
    {
        "name": "Creative Studio",
        "slug": "creative-studio",
        "description": "A more expressive preset with warmer contrast and bolder feature blocks",
        "is_default": False,
        "company_name": "Lumen Creative Lab",
        "palette": {
            "primary_color": "#6B2C91",
            "secondary_color": "#4F435B",
            "accent_color": "#F97360",
            "background_color": "#FFF8F4",
            "surface_color": "#F8E7DE",
            "muted_color": "#E8C9BC",
        },
        "markdown_preset": "creative-studio",
        "advanced": {
            "typography": {
                "font_family": "Helvetica",
                "font_size_body": 11,
                "font_size_heading": 24,
                "line_spacing": 1.48,
            },
            "layout": {
                "page_size": "A4",
                "margin_top": 86.0,
                "margin_bottom": 72.0,
                "margin_left": 72.0,
                "margin_right": 72.0,
                "columns": 1,
            },
            "header": {
                "enabled": True,
                "text": "Creative Studio",
                "align": "left",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": False,
            },
            "footer": {
                "enabled": True,
                "text": "Lumen Creative Lab",
                "align": "right",
                "show_logo": False,
                "divider": False,
                "show_page_numbers": True,
            },
        },
    },
]


async def seed_themes() -> None:
    # Reset the theme catalog on startup so the app always boots into the
    # standard preset set with a clean database state.
    await Theme.get_pymongo_collection().delete_many({})
    for data in DEFAULT_THEMES:
        await Theme(**data).insert()
