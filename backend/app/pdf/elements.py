from copy import deepcopy

from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    Flowable,
    HRFlowable,
    ListFlowable,
    ListItem,
    Paragraph,
    Preformatted,
    Spacer,
    Table,
    TableStyle,
)

from app.models.theme import Theme

FONT_VARIANTS = {
    "Helvetica": {"regular": "Helvetica", "bold": "Helvetica-Bold"},
    "Times-Roman": {"regular": "Times-Roman", "bold": "Times-Bold"},
    "Courier": {"regular": "Courier", "bold": "Courier-Bold"},
}


def _font_name(font_family: str, *, bold: bool = False, monospace: bool = False) -> str:
    if monospace:
        return "Courier"

    variants = FONT_VARIANTS.get(font_family)
    if variants:
        return variants["bold" if bold else "regular"]

    if bold and not font_family.endswith("-Bold"):
        return f"{font_family}-Bold"
    return font_family


def _base_preset(theme: Theme) -> dict:
    return {
        "headings": {
            "h1": {
                "color": theme.primary_color,
                "font_size": theme.font_size_heading,
                "space_before": 12.0,
                "space_after": 6.0,
            },
            "h2": {
                "color": theme.primary_color,
                "font_size": max(theme.font_size_heading - 2, theme.font_size_body + 4),
                "space_before": 10.0,
                "space_after": 5.0,
            },
            "h3": {
                "color": theme.primary_color,
                "font_size": max(theme.font_size_heading - 4, theme.font_size_body + 3),
                "space_before": 8.0,
                "space_after": 4.0,
            },
            "h4": {
                "color": theme.primary_color,
                "font_size": max(theme.font_size_heading - 6, theme.font_size_body + 2),
                "space_before": 6.0,
                "space_after": 4.0,
            },
        },
        "body": {
            "color": theme.secondary_color,
            "font_size": theme.font_size_body,
            "space_after": 6.0,
        },
        "lists": {
            "text_color": theme.secondary_color,
            "bullet_color": theme.primary_color,
            "item_spacing": 4.0,
            "left_indent": 18.0,
        },
        "blockquotes": {
            "text_color": theme.secondary_color,
            "border_color": theme.muted_color,
            "background_color": theme.surface_color,
            "left_indent": 18.0,
            "padding": 8.0,
        },
        "code": {
            "text_color": "#0F172A",
            "background_color": theme.surface_color,
            "border_color": theme.muted_color,
            "font_size": max(theme.font_size_body - 1, 9),
            "padding": 8.0,
        },
        "horizontal_rules": {
            "color": theme.muted_color,
            "thickness": 0.75,
            "spacing_before": 6.0,
            "spacing_after": 6.0,
        },
        "tables": {
            "header_background_color": theme.primary_color,
            "header_text_color": "#FFFFFF",
            "row_background_color": "#FFFFFF",
            "alternate_row_background_color": theme.surface_color,
            "border_color": theme.muted_color,
            "cell_padding": 6.0,
        },
    }


def _preset_defaults(theme: Theme) -> dict:
    preset = _base_preset(theme)

    if theme.markdown_preset == "executive":
        preset["body"]["space_after"] = 8.0
        preset["lists"]["item_spacing"] = 5.0
        preset["blockquotes"]["padding"] = 10.0
        preset["code"]["padding"] = 10.0
        preset["tables"]["cell_padding"] = 8.0
        preset["headings"]["h1"]["space_before"] = 14.0
        preset["headings"]["h2"]["space_before"] = 12.0
    elif theme.markdown_preset == "minimal":
        preset["blockquotes"]["background_color"] = "#FFFFFF"
        preset["code"]["background_color"] = "#FFFFFF"
        preset["tables"]["header_background_color"] = theme.surface_color
        preset["tables"]["header_text_color"] = theme.primary_color
        preset["tables"]["alternate_row_background_color"] = "#FFFFFF"
        preset["horizontal_rules"]["thickness"] = 0.5

    return preset


def _merge_nested(target: dict, source: dict) -> None:
    for key, value in source.items():
        if isinstance(value, dict):
            nested = target.setdefault(key, {})
            if isinstance(nested, dict):
                _merge_nested(nested, value)
        elif value is not None:
            target[key] = value


def resolve_markdown_styles(theme: Theme) -> dict:
    resolved = deepcopy(_preset_defaults(theme))
    overrides = theme.markdown_styles.model_dump(mode="python")
    _merge_nested(resolved, overrides)
    return resolved


def build_styles(theme: Theme) -> dict:
    resolved = resolve_markdown_styles(theme)
    body = resolved["body"]
    blockquotes = resolved["blockquotes"]
    code = resolved["code"]

    base = ParagraphStyle(
        "body",
        fontName=_font_name(theme.font_family),
        fontSize=body["font_size"],
        leading=body["font_size"] * theme.line_spacing * 1.2,
        textColor=colors.HexColor(body["color"]),
        spaceAfter=body["space_after"],
    )

    def heading(level: int) -> ParagraphStyle:
        data = resolved["headings"][f"h{level}"]
        return ParagraphStyle(
            f"h{level}",
            parent=base,
            fontName=_font_name(theme.font_family, bold=True),
            fontSize=data["font_size"],
            textColor=colors.HexColor(data["color"]),
            spaceBefore=data["space_before"],
            spaceAfter=data["space_after"],
        )

    list_style = ParagraphStyle(
        "list",
        parent=base,
        textColor=colors.HexColor(resolved["lists"]["text_color"]),
        leftIndent=resolved["lists"]["left_indent"],
        spaceAfter=resolved["lists"]["item_spacing"],
    )

    blockquote_style = ParagraphStyle(
        "blockquote",
        parent=base,
        textColor=colors.HexColor(blockquotes["text_color"]),
        leftIndent=blockquotes["left_indent"],
        borderColor=colors.HexColor(blockquotes["border_color"]),
        borderWidth=0.75,
        borderPadding=blockquotes["padding"],
        backColor=colors.HexColor(blockquotes["background_color"]),
        spaceAfter=body["space_after"],
    )

    code_style = ParagraphStyle(
        "code",
        parent=base,
        fontName=_font_name(theme.font_family, monospace=True),
        fontSize=code["font_size"],
        textColor=colors.HexColor(code["text_color"]),
        backColor=colors.HexColor(code["background_color"]),
        borderColor=colors.HexColor(code["border_color"]),
        borderWidth=0.75,
        borderPadding=code["padding"],
        spaceAfter=body["space_after"] + 2,
    )

    table_header = ParagraphStyle(
        "table_header",
        parent=base,
        fontName=_font_name(theme.font_family, bold=True),
        textColor=colors.HexColor(resolved["tables"]["header_text_color"]),
        spaceAfter=0,
    )

    table_body = ParagraphStyle(
        "table_body",
        parent=base,
        spaceAfter=0,
    )

    return {
        "body": base,
        "list": list_style,
        "blockquote": blockquote_style,
        "code": code_style,
        "table_header": table_header,
        "table_body": table_body,
        "meta": resolved,
        "h1": heading(1),
        "h2": heading(2),
        "h3": heading(3),
        "h4": heading(4),
    }


def _inline_text(children: list[dict] | None) -> str:
    if not children:
        return ""

    parts: list[str] = []
    for child in children:
        token_type = child.get("type", "")
        raw = child.get("raw", "")
        inner = _inline_text(child.get("children"))

        if token_type == "strong":
            parts.append(f"<b>{inner}</b>")
        elif token_type == "emphasis":
            parts.append(f"<i>{inner}</i>")
        elif token_type == "codespan":
            parts.append(f"<font name='Courier'>{raw}</font>")
        elif token_type in {"softbreak", "softline_break", "line_break"}:
            parts.append("<br/>")
        else:
            parts.append(raw or inner)

    return "".join(parts)


def _list_item_text(item: dict) -> str:
    parts: list[str] = []
    for child in item.get("children") or []:
        if child.get("type") in {"paragraph", "block_text"}:
            parts.append(_inline_text(child.get("children") or []))
    return "<br/>".join(part for part in parts if part)


def _table_rows(table_token: dict, styles: dict) -> list[list[Paragraph]]:
    rows: list[list[Paragraph]] = []

    for child in table_token.get("children") or []:
        if child.get("type") == "table_head":
            rows.append(
                [
                    Paragraph(_inline_text(cell.get("children") or []), styles["table_header"])
                    for cell in child.get("children") or []
                ]
            )
        elif child.get("type") == "table_body":
            for row in child.get("children") or []:
                rows.append(
                    [
                        Paragraph(_inline_text(cell.get("children") or []), styles["table_body"])
                        for cell in row.get("children") or []
                    ]
                )

    return rows


def build_flowables(tokens: list[dict], theme: Theme) -> list[Flowable]:
    styles = build_styles(theme)
    meta = styles["meta"]
    flowables: list[Flowable] = []

    for token in tokens:
        token_type = token.get("type", "")
        children = token.get("children") or []

        if token_type in {"heading", "atx_heading"}:
            level = token.get("attrs", {}).get("level", 1)
            level = max(1, min(4, level))
            flowables.append(Paragraph(_inline_text(children), styles[f"h{level}"]))

        elif token_type == "paragraph":
            flowables.append(Paragraph(_inline_text(children), styles["body"]))

        elif token_type in {"block_code", "fenced_code"}:
            flowables.append(Preformatted(token.get("raw", "").rstrip(), styles["code"]))

        elif token_type == "block_quote":
            for child in children:
                text = _inline_text(child.get("children") or [])
                if text:
                    flowables.append(Paragraph(text, styles["blockquote"]))

        elif token_type in {"list", "bullet_list", "ordered_list"}:
            items = []
            for item in children:
                text = _list_item_text(item)
                if text:
                    items.append(
                        ListItem(
                            Paragraph(text, styles["list"]),
                            bulletColor=colors.HexColor(meta["lists"]["bullet_color"]),
                        )
                    )
            if items:
                bullet_type = "1" if token.get("attrs", {}).get("ordered") else "bullet"
                flowables.append(ListFlowable(items, bulletType=bullet_type))

        elif token_type == "table":
            rows = _table_rows(token, styles)
            if rows:
                cell_padding = meta["tables"]["cell_padding"]
                table = Table(rows, hAlign="LEFT", repeatRows=1)
                table_style_commands = [
                    ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(meta["tables"]["header_background_color"])),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor(meta["tables"]["header_text_color"])),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor(meta["tables"]["border_color"])),
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (-1, -1), cell_padding),
                    ("RIGHTPADDING", (0, 0), (-1, -1), cell_padding),
                    ("TOPPADDING", (0, 0), (-1, -1), cell_padding * 0.7),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), cell_padding * 0.7),
                ]

                row_background = colors.HexColor(meta["tables"]["row_background_color"])
                alt_background = colors.HexColor(meta["tables"]["alternate_row_background_color"])

                for row_index in range(1, len(rows)):
                    background = row_background if row_index % 2 else alt_background
                    table_style_commands.append(
                        ("BACKGROUND", (0, row_index), (-1, row_index), background)
                    )

                table.setStyle(TableStyle(table_style_commands))
                flowables.append(Spacer(1, 4))
                flowables.append(table)
                flowables.append(Spacer(1, 8))

        elif token_type == "thematic_break":
            hr = meta["horizontal_rules"]
            flowables.append(Spacer(1, hr["spacing_before"]))
            flowables.append(
                HRFlowable(
                    width="100%",
                    color=colors.HexColor(hr["color"]),
                    thickness=hr["thickness"],
                )
            )
            flowables.append(Spacer(1, hr["spacing_after"]))

        elif token_type == "blank_line":
            flowables.append(Spacer(1, 6))

    return flowables
