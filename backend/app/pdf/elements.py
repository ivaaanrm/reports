from copy import deepcopy
from html import escape

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
    palette = theme.palette
    typography = theme.advanced.typography
    return {
        "headings": {
            "h1": {
                "color": palette.primary_color,
                "font_size": typography.font_size_heading,
                "space_before": 12.0,
                "space_after": 6.0,
            },
            "h2": {
                "color": palette.primary_color,
                "font_size": max(
                    typography.font_size_heading - 2, typography.font_size_body + 4
                ),
                "space_before": 10.0,
                "space_after": 5.0,
            },
            "h3": {
                "color": palette.primary_color,
                "font_size": max(
                    typography.font_size_heading - 4, typography.font_size_body + 3
                ),
                "space_before": 8.0,
                "space_after": 4.0,
            },
            "h4": {
                "color": palette.primary_color,
                "font_size": max(
                    typography.font_size_heading - 6, typography.font_size_body + 2
                ),
                "space_before": 6.0,
                "space_after": 4.0,
            },
        },
        "body": {
            "color": palette.secondary_color,
            "font_size": typography.font_size_body,
            "space_after": 6.0,
        },
        "lists": {
            "text_color": palette.secondary_color,
            "bullet_color": palette.primary_color,
            "item_spacing": 4.0,
            "left_indent": 18.0,
        },
        "blockquotes": {
            "text_color": palette.secondary_color,
            "border_color": palette.muted_color,
            "background_color": palette.surface_color,
            "left_indent": 18.0,
            "padding": 8.0,
            "accent_color": palette.primary_color,
            "panel": False,
        },
        "code": {
            "text_color": "#0F172A",
            "background_color": palette.surface_color,
            "border_color": palette.muted_color,
            "font_size": max(typography.font_size_body - 1, 9),
            "padding": 8.0,
            "panel": False,
        },
        "horizontal_rules": {
            "color": palette.muted_color,
            "thickness": 0.75,
            "spacing_before": 6.0,
            "spacing_after": 6.0,
        },
        "tables": {
            "header_background_color": palette.primary_color,
            "header_text_color": "#FFFFFF",
            "row_background_color": "#FFFFFF",
            "alternate_row_background_color": palette.surface_color,
            "border_color": palette.muted_color,
            "cell_padding": 6.0,
            "panel": False,
            "panel_background_color": "#FFFFFF",
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
        preset["tables"]["header_background_color"] = theme.palette.surface_color
        preset["tables"]["header_text_color"] = theme.palette.primary_color
        preset["tables"]["alternate_row_background_color"] = "#FFFFFF"
        preset["horizontal_rules"]["thickness"] = 0.5
    elif theme.markdown_preset == "smooth":
        preset["body"]["space_after"] = 10.0
        preset["lists"]["item_spacing"] = 6.0
        preset["lists"]["left_indent"] = 20.0
        preset["blockquotes"]["padding"] = 12.0
        preset["blockquotes"]["left_indent"] = 0.0
        preset["blockquotes"]["border_color"] = theme.palette.accent_color
        preset["blockquotes"]["accent_color"] = theme.palette.accent_color
        preset["blockquotes"]["panel"] = True
        preset["code"]["background_color"] = "#FFFFFF"
        preset["code"]["padding"] = 12.0
        preset["code"]["panel"] = True
        preset["horizontal_rules"]["thickness"] = 0.5
        preset["horizontal_rules"]["spacing_before"] = 10.0
        preset["horizontal_rules"]["spacing_after"] = 10.0
        preset["tables"]["cell_padding"] = 8.0
        preset["tables"]["panel"] = True
        preset["headings"]["h1"]["space_before"] = 0.0
        preset["headings"]["h1"]["space_after"] = 12.0
        preset["headings"]["h2"]["space_before"] = 16.0
        preset["headings"]["h2"]["space_after"] = 8.0
        preset["headings"]["h3"]["space_before"] = 12.0
        preset["headings"]["h3"]["space_after"] = 6.0

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
    overrides = theme.advanced.markdown_styles.model_dump(mode="python")
    _merge_nested(resolved, overrides)
    return resolved


def build_styles(theme: Theme) -> dict:
    resolved = resolve_markdown_styles(theme)
    typography = theme.advanced.typography
    body = resolved["body"]
    blockquotes = resolved["blockquotes"]
    code = resolved["code"]

    base = ParagraphStyle(
        "body",
        fontName=_font_name(typography.font_family),
        fontSize=body["font_size"],
        leading=body["font_size"] * typography.line_spacing * 1.2,
        textColor=colors.HexColor(body["color"]),
        spaceAfter=body["space_after"],
    )

    def heading(level: int) -> ParagraphStyle:
        data = resolved["headings"][f"h{level}"]
        return ParagraphStyle(
            f"h{level}",
            parent=base,
            fontName=_font_name(typography.font_family, bold=True),
            fontSize=data["font_size"],
            textColor=colors.HexColor(data["color"]),
            spaceBefore=data["space_before"],
            spaceAfter=data["space_after"],
        )

    list_style = ParagraphStyle(
        "list",
        parent=base,
        textColor=colors.HexColor(resolved["lists"]["text_color"]),
        leftIndent=0,
        spaceAfter=resolved["lists"]["item_spacing"],
    )

    blockquote_style = ParagraphStyle(
        "blockquote",
        parent=base,
        textColor=colors.HexColor(blockquotes["text_color"]),
        leftIndent=0,
        spaceBefore=0,
        spaceAfter=max(body["space_after"] - 2, 4),
    )

    blockquote_heading = ParagraphStyle(
        "blockquote_heading",
        parent=base,
        fontName=_font_name(typography.font_family, bold=True),
        fontSize=max(body["font_size"] + 1, 11),
        textColor=colors.HexColor(theme.palette.primary_color),
        spaceBefore=0,
        spaceAfter=4,
    )

    code_style = ParagraphStyle(
        "code",
        parent=base,
        fontName=_font_name(typography.font_family, monospace=True),
        fontSize=code["font_size"],
        textColor=colors.HexColor(code["text_color"]),
        backColor=colors.HexColor(code["background_color"]),
        borderColor=colors.HexColor(code["border_color"]),
        borderWidth=0 if code.get("panel") else 0.75,
        borderPadding=code["padding"],
        spaceAfter=0 if code.get("panel") else body["space_after"] + 2,
    )

    table_header = ParagraphStyle(
        "table_header",
        parent=base,
        fontName=_font_name(typography.font_family, bold=True),
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
        "blockquote_heading": blockquote_heading,
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
        raw = escape(child.get("raw", ""))
        inner = _inline_text(child.get("children"))

        if token_type == "strong":
            parts.append(f"<b>{inner}</b>")
        elif token_type == "emphasis":
            parts.append(f"<i>{inner}</i>")
        elif token_type == "codespan":
            parts.append(f"<font name='Courier'>{raw or inner}</font>")
        elif token_type == "link":
            parts.append(inner or raw)
        elif token_type in {"softbreak", "softline_break", "line_break"}:
            parts.append("<br/>")
        else:
            parts.append(raw or inner)

    return "".join(parts)


def _panel(
    content: Flowable | list[Flowable],
    *,
    background_color: str,
    border_color: str,
    padding: float,
    border_width: float = 0.75,
) -> Table:
    panel = Table([[content]], hAlign="LEFT")
    panel.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor(background_color)),
                ("BOX", (0, 0), (-1, -1), border_width, colors.HexColor(border_color)),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), padding),
                ("RIGHTPADDING", (0, 0), (-1, -1), padding),
                ("TOPPADDING", (0, 0), (-1, -1), padding),
                ("BOTTOMPADDING", (0, 0), (-1, -1), padding),
            ]
        )
    )
    return panel


def _quote_panel(content: list[Flowable], meta: dict) -> Table:
    quote = meta["blockquotes"]
    padding = quote["padding"]
    panel = Table([[Spacer(1, 1), content]], colWidths=[4, None], hAlign="LEFT")
    panel.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), colors.HexColor(quote["accent_color"])),
                ("BACKGROUND", (1, 0), (1, -1), colors.HexColor(quote["background_color"])),
                ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor(quote["border_color"])),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (0, -1), 0),
                ("RIGHTPADDING", (0, 0), (0, -1), 0),
                ("TOPPADDING", (0, 0), (0, -1), 0),
                ("BOTTOMPADDING", (0, 0), (0, -1), 0),
                ("LEFTPADDING", (1, 0), (1, -1), padding),
                ("RIGHTPADDING", (1, 0), (1, -1), padding),
                ("TOPPADDING", (1, 0), (1, -1), padding),
                ("BOTTOMPADDING", (1, 0), (1, -1), padding),
            ]
        )
    )
    return panel


def _list_item_flowables(item: dict, styles: dict, meta: dict) -> list[Flowable]:
    flowables: list[Flowable] = []

    for child in item.get("children") or []:
        child_type = child.get("type", "")

        if child_type in {"paragraph", "block_text"}:
            text = _inline_text(child.get("children") or [])
            if text:
                flowables.append(Paragraph(text, styles["list"]))
        elif child_type in {"list", "bullet_list", "ordered_list"}:
            nested = _build_list_flowable(child, styles, meta)
            if nested is not None:
                flowables.append(nested)
        elif child_type == "block_quote":
            flowables.extend(_build_blockquote_flowables(child, styles, meta))
        elif child_type in {"block_code", "fenced_code"}:
            flowables.extend(_build_code_flowables(child, styles, meta))
        elif child_type == "blank_line":
            flowables.append(Spacer(1, 4))

    while flowables and isinstance(flowables[-1], Spacer):
        flowables.pop()

    return flowables


def _build_list_flowable(token: dict, styles: dict, meta: dict) -> ListFlowable | None:
    items: list[ListItem] = []
    ordered = bool(token.get("attrs", {}).get("ordered"))

    for index, item in enumerate(token.get("children") or [], start=1):
        content = _list_item_flowables(item, styles, meta)
        if not content:
            continue

        item_content: Flowable | list[Flowable] = content[0] if len(content) == 1 else content
        kwargs = {"bulletColor": colors.HexColor(meta["lists"]["bullet_color"])}
        if ordered:
            kwargs["value"] = index
        items.append(ListItem(item_content, **kwargs))

    if not items:
        return None

    return ListFlowable(
        items,
        bulletType="1" if ordered else "bullet",
        leftIndent=meta["lists"]["left_indent"],
    )


def _table_rows(
    table_token: dict, styles: dict
) -> tuple[list[list[Paragraph]], list[tuple[int, int, str]]]:
    rows: list[list[Paragraph]] = []
    alignments: list[tuple[int, int, str]] = []

    for child in table_token.get("children") or []:
        if child.get("type") == "table_head":
            row_index = len(rows)
            header_cells = []
            for col_index, cell in enumerate(child.get("children") or []):
                header_cells.append(
                    Paragraph(_inline_text(cell.get("children") or []), styles["table_header"])
                )
                align = (cell.get("attrs") or {}).get("align")
                if align:
                    alignments.append((col_index, row_index, align.upper()))
            rows.append(header_cells)
        elif child.get("type") == "table_body":
            for row in child.get("children") or []:
                row_index = len(rows)
                body_cells = []
                for col_index, cell in enumerate(row.get("children") or []):
                    body_cells.append(
                        Paragraph(_inline_text(cell.get("children") or []), styles["table_body"])
                    )
                    align = (cell.get("attrs") or {}).get("align")
                    if align:
                        alignments.append((col_index, row_index, align.upper()))
                rows.append(body_cells)

    return rows, alignments


def _build_code_flowables(token: dict, styles: dict, meta: dict) -> list[Flowable]:
    code_block = Preformatted(token.get("raw", "").rstrip(), styles["code"])
    if meta["code"].get("panel"):
        return [
            _panel(
                code_block,
                background_color=meta["code"]["background_color"],
                border_color=meta["code"]["border_color"],
                padding=meta["code"]["padding"],
            ),
            Spacer(1, styles["body"].spaceAfter),
        ]
    return [code_block]


def _build_blockquote_flowables(token: dict, styles: dict, meta: dict) -> list[Flowable]:
    content: list[Flowable] = []

    for child in token.get("children") or []:
        child_type = child.get("type", "")

        if child_type in {"paragraph", "block_text"}:
            text = _inline_text(child.get("children") or [])
            if text:
                content.append(Paragraph(text, styles["blockquote"]))
        elif child_type in {"heading", "atx_heading"}:
            text = _inline_text(child.get("children") or [])
            if text:
                content.append(Paragraph(text, styles["blockquote_heading"]))
        elif child_type in {"list", "bullet_list", "ordered_list"}:
            nested_list = _build_list_flowable(child, styles, meta)
            if nested_list is not None:
                content.append(nested_list)
        elif child_type in {"block_code", "fenced_code"}:
            content.extend(_build_code_flowables(child, styles, meta))
        elif child_type == "block_quote":
            content.extend(_build_blockquote_flowables(child, styles, meta))
        elif child_type == "blank_line":
            content.append(Spacer(1, 4))

    while content and isinstance(content[-1], Spacer):
        content.pop()

    if not content:
        return []

    if meta["blockquotes"].get("panel"):
        return [_quote_panel(content, meta), Spacer(1, styles["body"].spaceAfter)]

    return content


def _build_table_flowables(token: dict, styles: dict, meta: dict) -> list[Flowable]:
    rows, alignments = _table_rows(token, styles)
    if not rows:
        return []

    cell_padding = meta["tables"]["cell_padding"]
    table = Table(rows, hAlign="LEFT", repeatRows=1)
    table_style_commands = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(meta["tables"]["header_background_color"])),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor(meta["tables"]["header_text_color"])),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor(meta["tables"]["border_color"])),
        ("INNERGRID", (0, 0), (-1, -1), 0.35, colors.HexColor(meta["tables"]["border_color"])),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), cell_padding),
        ("RIGHTPADDING", (0, 0), (-1, -1), cell_padding),
        ("TOPPADDING", (0, 0), (-1, -1), cell_padding * 0.75),
        ("BOTTOMPADDING", (0, 0), (-1, -1), cell_padding * 0.75),
        (
            "ROWBACKGROUNDS",
            (0, 1),
            (-1, -1),
            [
                colors.HexColor(meta["tables"]["row_background_color"]),
                colors.HexColor(meta["tables"]["alternate_row_background_color"]),
            ],
        ),
    ]

    for col_index, row_index, align in alignments:
        table_style_commands.append(("ALIGN", (col_index, row_index), (col_index, row_index), align))

    table.setStyle(TableStyle(table_style_commands))

    table_flowable: Flowable = table
    if meta["tables"].get("panel"):
        table_flowable = _panel(
            table,
            background_color=meta["tables"]["panel_background_color"],
            border_color=meta["tables"]["border_color"],
            padding=max(cell_padding * 0.6, 6.0),
        )

    return [Spacer(1, 4), table_flowable, Spacer(1, 8)]


def _build_token_flowables(tokens: list[dict], styles: dict) -> list[Flowable]:
    meta = styles["meta"]
    flowables: list[Flowable] = []

    for token in tokens:
        token_type = token.get("type", "")
        children = token.get("children") or []

        if token_type in {"heading", "atx_heading"}:
            level = token.get("attrs", {}).get("level", 1)
            level = max(1, min(4, level))
            flowables.append(Paragraph(_inline_text(children), styles[f"h{level}"]))

        elif token_type in {"paragraph", "block_text"}:
            text = _inline_text(children)
            if text:
                flowables.append(Paragraph(text, styles["body"]))

        elif token_type in {"block_code", "fenced_code"}:
            flowables.extend(_build_code_flowables(token, styles, meta))

        elif token_type == "block_quote":
            flowables.extend(_build_blockquote_flowables(token, styles, meta))

        elif token_type in {"list", "bullet_list", "ordered_list"}:
            list_flowable = _build_list_flowable(token, styles, meta)
            if list_flowable is not None:
                flowables.append(list_flowable)

        elif token_type == "table":
            flowables.extend(_build_table_flowables(token, styles, meta))

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


def build_flowables(tokens: list[dict], theme: Theme) -> list[Flowable]:
    styles = build_styles(theme)
    return _build_token_flowables(tokens, styles)
