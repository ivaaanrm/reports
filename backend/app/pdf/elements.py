import re
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


def _hex_luminance(hex_color: str) -> float:
    h = hex_color.lstrip("#")
    r, g, b = int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255


def _token_color(token_type, dark: bool) -> str:
    from pygments.token import Comment, Keyword, Name, Number, Operator, Punctuation, String

    rules_light = [
        (Comment, "#6B7280"),
        (Keyword.Type, "#0E7490"),
        (Keyword, "#7C3AED"),
        (String, "#16A34A"),
        (Number, "#B45309"),
        (Name.Decorator, "#D97706"),
        (Name.Exception, "#DC2626"),
        (Name.Function, "#1D4ED8"),
        (Name.Builtin, "#0E7490"),
        (Name.Class, "#0E7490"),
        (Operator, "#374151"),
        (Punctuation, "#374151"),
    ]
    rules_dark = [
        (Comment, "#94A3B8"),
        (Keyword.Type, "#67E8F9"),
        (Keyword, "#C084FC"),
        (String, "#86EFAC"),
        (Number, "#FCA5A5"),
        (Name.Decorator, "#FDE68A"),
        (Name.Exception, "#FCA5A5"),
        (Name.Function, "#93C5FD"),
        (Name.Builtin, "#67E8F9"),
        (Name.Class, "#67E8F9"),
        (Operator, "#CBD5E1"),
        (Punctuation, "#CBD5E1"),
    ]
    default = "#E2E8F0" if dark else "#0F172A"
    for base, color in (rules_dark if dark else rules_light):
        if token_type is base or token_type in base:
            return color
    return default


class TaskBullet(Flowable):
    """Draws a circle checkbox icon: filled+tick when checked, outline when not."""

    def __init__(self, checked: bool, size: float, primary_color: str):
        super().__init__()
        self.checked = checked
        self._size = size
        self._primary = primary_color
        self.width = size
        self.height = size

    def draw(self):
        c = self.canv
        r = self._size / 2
        cx, cy = r, r
        if self.checked:
            c.setFillColor(colors.HexColor(self._primary))
            c.setStrokeColor(colors.HexColor(self._primary))
            c.circle(cx, cy, r, fill=1, stroke=0)
            c.setStrokeColor(colors.white)
            c.setLineWidth(max(r * 0.2, 0.7))
            c.setLineCap(1)
            # checkmark: short leg then long leg
            c.line(cx - r * 0.38, cy - r * 0.05, cx - r * 0.05, cy - r * 0.38)
            c.line(cx - r * 0.05, cy - r * 0.38, cx + r * 0.42, cy + r * 0.32)
        else:
            c.setFillColor(colors.white)
            c.setStrokeColor(colors.HexColor(self._primary))
            c.setLineWidth(max(r * 0.18, 0.6))
            c.circle(cx, cy, r, fill=1, stroke=1)


class HighlightedCode(Flowable):
    """Renders a syntax-highlighted code block using pygments token colors."""

    def __init__(
        self,
        code: str,
        language: str | None,
        font_name: str,
        font_size: float,
        text_color: str,
        bg_color: str,
        border_color: str,
        border_width: float,
        padding: float,
    ):
        super().__init__()
        self._code = code.expandtabs(4)
        self._language = language
        self._font_name = font_name
        self._font_size = font_size
        self._text_color = text_color
        self._bg_color = bg_color
        self._border_color = border_color
        self._border_width = border_width
        self._padding = padding
        self._dark = _hex_luminance(bg_color) < 0.5
        self._line_height = font_size * 1.35
        self._segments = self._build_segments()

    def _build_segments(self) -> list[list[tuple[str, str]]]:
        """Return a list of lines; each line is a list of (color, text) pairs."""
        try:
            from pygments import lex
            from pygments.lexers import TextLexer, get_lexer_by_name
            from pygments.util import ClassNotFound

            try:
                lexer = get_lexer_by_name(
                    self._language or "text", stripnl=False, ensurenl=True
                )
            except ClassNotFound:
                lexer = TextLexer()

            lines: list[list[tuple[str, str]]] = []
            current: list[tuple[str, str]] = []
            for ttype, value in lex(self._code, lexer):
                color = _token_color(ttype, self._dark)
                parts = value.split("\n")
                for i, part in enumerate(parts):
                    if part:
                        current.append((color, part))
                    if i < len(parts) - 1:
                        lines.append(current)
                        current = []
            if current:
                lines.append(current)
            return lines
        except Exception:
            raw_lines = self._code.rstrip("\n").split("\n")
            return [[(self._text_color, line)] for line in raw_lines]

    def wrap(self, availWidth, availHeight):
        self.width = max(availWidth, 1)
        self.height = len(self._segments) * self._line_height + 2 * self._padding
        return self.width, self.height

    def draw(self):
        c = self.canv
        c.setFillColor(colors.HexColor(self._bg_color))
        c.rect(0, 0, self.width, self.height, fill=1, stroke=0)
        if self._border_width > 0:
            c.setStrokeColor(colors.HexColor(self._border_color))
            c.setLineWidth(self._border_width)
            c.rect(0, 0, self.width, self.height, fill=0, stroke=1)

        x = self._padding
        y = self.height - self._padding - self._font_size
        c.setFont(self._font_name, self._font_size)
        for line_segs in self._segments:
            curr_x = x
            for color, text in line_segs:
                if text:
                    c.setFillColor(colors.HexColor(color))
                    c.drawString(curr_x, y, text)
                    curr_x += c.stringWidth(text, self._font_name, self._font_size)
            y -= self._line_height

from app.models.theme import Theme

FONT_VARIANTS = {
    "Helvetica": {"regular": "Helvetica", "bold": "Helvetica-Bold"},
    "Times-Roman": {"regular": "Times-Roman", "bold": "Times-Bold"},
    "Courier": {"regular": "Courier", "bold": "Courier-Bold"},
}

_ALERT_CONFIG: dict[str, dict[str, str]] = {
    "NOTE":      {"label": "Note",      "color": "#0284C7", "bg": "#EFF6FF"},
    "TIP":       {"label": "Tip",       "color": "#16A34A", "bg": "#F0FDF4"},
    "IMPORTANT": {"label": "Important", "color": "#7C3AED", "bg": "#F5F3FF"},
    "WARNING":   {"label": "Warning",   "color": "#CA8A04", "bg": "#FEFCE8"},
    "CAUTION":   {"label": "Caution",   "color": "#DC2626", "bg": "#FEF2F2"},
}
_ALERT_RE = re.compile(r"^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]$")


def _detect_alert(token: dict) -> tuple[str | None, list[dict]]:
    """Returns (alert_type, remaining_children) when a blockquote starts with [!TYPE]."""
    children = token.get("children") or []
    if not children:
        return None, children

    first = children[0]
    if first.get("type") not in {"paragraph", "block_text"}:
        return None, children

    first_children = first.get("children") or []
    raw_parts: list[str] = []
    split_at = len(first_children)
    for i, c in enumerate(first_children):
        if c.get("type") in {"softbreak", "softline_break", "line_break"}:
            split_at = i
            break
        raw_parts.append(c.get("raw", ""))

    m = _ALERT_RE.match("".join(raw_parts).strip())
    if not m:
        return None, children

    alert_type = m.group(1)
    after_marker = first_children[split_at + 1:]
    if after_marker:
        new_first = {**first, "children": after_marker}
        new_children: list[dict] = [new_first] + list(children[1:])
    else:
        new_children = list(children[1:])

    return alert_type, new_children


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

    if theme.markdown_preset == "default-light":
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
    elif theme.markdown_preset == "default-dark":
        preset["body"]["space_after"] = 10.0
        preset["lists"]["item_spacing"] = 6.0
        preset["lists"]["left_indent"] = 20.0
        preset["blockquotes"]["padding"] = 12.0
        preset["blockquotes"]["left_indent"] = 0.0
        preset["blockquotes"]["border_color"] = theme.palette.muted_color
        preset["blockquotes"]["accent_color"] = theme.palette.accent_color
        preset["blockquotes"]["panel"] = True
        preset["code"]["text_color"] = "#E2E8F0"
        preset["code"]["background_color"] = theme.palette.surface_color
        preset["code"]["border_color"] = theme.palette.muted_color
        preset["code"]["padding"] = 12.0
        preset["code"]["panel"] = True
        preset["horizontal_rules"]["color"] = theme.palette.muted_color
        preset["horizontal_rules"]["thickness"] = 0.5
        preset["horizontal_rules"]["spacing_before"] = 10.0
        preset["horizontal_rules"]["spacing_after"] = 10.0
        preset["tables"]["header_background_color"] = "#13263C"
        preset["tables"]["header_text_color"] = "#F8FAFC"
        preset["tables"]["row_background_color"] = "#13263C"
        preset["tables"]["alternate_row_background_color"] = theme.palette.surface_color
        preset["tables"]["border_color"] = theme.palette.muted_color
        preset["tables"]["cell_padding"] = 8.0
        preset["tables"]["panel"] = True
        preset["tables"]["panel_background_color"] = theme.palette.surface_color
        preset["headings"]["h1"]["space_before"] = 0.0
        preset["headings"]["h1"]["space_after"] = 12.0
        preset["headings"]["h2"]["space_before"] = 16.0
        preset["headings"]["h2"]["space_after"] = 8.0
        preset["headings"]["h3"]["space_before"] = 12.0
        preset["headings"]["h3"]["space_after"] = 6.0
    elif theme.markdown_preset == "modern-corporate":
        preset["body"]["space_after"] = 8.0
        preset["lists"]["item_spacing"] = 5.0
        preset["lists"]["left_indent"] = 18.0
        preset["blockquotes"]["background_color"] = theme.palette.surface_color
        preset["blockquotes"]["border_color"] = theme.palette.primary_color
        preset["blockquotes"]["accent_color"] = theme.palette.primary_color
        preset["blockquotes"]["padding"] = 10.0
        preset["blockquotes"]["left_indent"] = 0.0
        preset["blockquotes"]["panel"] = True
        preset["code"]["background_color"] = theme.palette.surface_color
        preset["code"]["border_color"] = theme.palette.muted_color
        preset["code"]["padding"] = 10.0
        preset["tables"]["cell_padding"] = 8.0
        preset["tables"]["header_background_color"] = theme.palette.primary_color
        preset["tables"]["header_text_color"] = "#FFFFFF"
        preset["tables"]["row_background_color"] = theme.palette.surface_color
        preset["tables"]["alternate_row_background_color"] = theme.palette.background_color
        preset["tables"]["border_color"] = theme.palette.muted_color
        preset["headings"]["h1"]["space_before"] = 14.0
        preset["headings"]["h2"]["space_before"] = 12.0
    elif theme.markdown_preset == "creative-studio":
        preset["body"]["space_after"] = 10.0
        preset["lists"]["item_spacing"] = 6.0
        preset["lists"]["left_indent"] = 20.0
        preset["blockquotes"]["background_color"] = theme.palette.surface_color
        preset["blockquotes"]["border_color"] = theme.palette.accent_color
        preset["blockquotes"]["accent_color"] = theme.palette.accent_color
        preset["blockquotes"]["padding"] = 12.0
        preset["blockquotes"]["left_indent"] = 0.0
        preset["blockquotes"]["panel"] = True
        preset["code"]["background_color"] = theme.palette.surface_color
        preset["code"]["border_color"] = theme.palette.muted_color
        preset["code"]["padding"] = 12.0
        preset["code"]["panel"] = True
        preset["tables"]["header_background_color"] = theme.palette.primary_color
        preset["tables"]["header_text_color"] = "#FFFFFF"
        preset["tables"]["row_background_color"] = theme.palette.surface_color
        preset["tables"]["alternate_row_background_color"] = theme.palette.surface_color
        preset["tables"]["border_color"] = theme.palette.muted_color
        preset["tables"]["cell_padding"] = 8.0
        preset["tables"]["panel"] = True
        preset["horizontal_rules"]["thickness"] = 0.5
        preset["horizontal_rules"]["spacing_before"] = 10.0
        preset["horizontal_rules"]["spacing_after"] = 10.0
        preset["headings"]["h1"]["space_before"] = 0.0
        preset["headings"]["h1"]["space_after"] = 12.0
        preset["headings"]["h2"]["space_before"] = 16.0
        preset["headings"]["h2"]["space_after"] = 8.0
        preset["headings"]["h3"]["space_before"] = 12.0
        preset["headings"]["h3"]["space_after"] = 6.0

    if theme.markdown_preset != "default-dark":
        if _hex_luminance(theme.palette.background_color) < 0.5:
            preset["code"]["text_color"] = "#E2E8F0"

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
        elif token_type == "footnote_ref":
            idx = child.get("attrs", {}).get("index", "?")
            parts.append(f"<super>[{idx}]</super>")
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


def _build_list_flowable(token: dict, styles: dict, meta: dict) -> Flowable | None:
    children = token.get("children") or []
    ordered = bool(token.get("attrs", {}).get("ordered"))
    is_task_list = any(c.get("type") == "task_list_item" for c in children)

    if is_task_list:
        rows: list[list] = []
        bullet_size = styles["list"].fontSize * 0.82
        for item in children:
            content = _list_item_flowables(item, styles, meta)
            if not content:
                continue
            checked = (item.get("attrs") or {}).get("checked", False)
            bullet = TaskBullet(
                checked=checked,
                size=bullet_size,
                primary_color=meta["lists"]["bullet_color"],
            )
            rows.append([bullet, content[0] if len(content) == 1 else content])

        if not rows:
            return None

        left_indent = meta["lists"]["left_indent"]
        left_pad = max((left_indent - bullet_size) / 2, 2.0)
        task_table = Table(rows, colWidths=[left_indent, None], hAlign="LEFT")
        task_table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("LEFTPADDING", (0, 0), (0, -1), left_pad),
                    ("RIGHTPADDING", (0, 0), (0, -1), 0),
                    ("LEFTPADDING", (1, 0), (1, -1), 4),
                    ("RIGHTPADDING", (1, 0), (1, -1), 0),
                    ("TOPPADDING", (0, 0), (-1, -1), 3),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
                ]
            )
        )
        return task_table

    items: list[ListItem] = []
    for index, item in enumerate(children, start=1):
        content = _list_item_flowables(item, styles, meta)
        if not content:
            continue

        item_content: Flowable | list[Flowable] = content[0] if len(content) == 1 else content
        kwargs: dict = {"bulletColor": colors.HexColor(meta["lists"]["bullet_color"])}
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
    code_meta = meta["code"]
    code_style = styles["code"]
    language = (token.get("attrs") or {}).get("info") or None
    raw = token.get("raw", "").rstrip("\n")

    code_block = HighlightedCode(
        code=raw,
        language=language,
        font_name=code_style.fontName,
        font_size=code_style.fontSize,
        text_color=code_meta["text_color"],
        bg_color=code_meta["background_color"],
        border_color=code_meta["border_color"],
        border_width=0 if code_meta.get("panel") else 0.75,
        padding=code_meta["padding"],
    )
    if code_meta.get("panel"):
        return [
            _panel(
                code_block,
                background_color=code_meta["background_color"],
                border_color=code_meta["border_color"],
                padding=code_meta["padding"],
            ),
            Spacer(1, styles["body"].spaceAfter),
        ]
    return [code_block, Spacer(1, styles["body"].spaceAfter)]


def _build_alert_flowables(alert_type: str, children: list[dict], styles: dict, meta: dict) -> list[Flowable]:
    cfg = _ALERT_CONFIG[alert_type]
    color = cfg["color"]
    bg = cfg["bg"]
    padding = meta["blockquotes"]["padding"]

    label_style = ParagraphStyle(
        f"alert_{alert_type.lower()}",
        parent=styles["body"],
        fontName=_font_name(styles["body"].fontName, bold=True),
        fontSize=styles["body"].fontSize,
        textColor=colors.HexColor(color),
        spaceAfter=4,
        spaceBefore=0,
    )

    content: list[Flowable] = [Paragraph(cfg["label"], label_style)]

    for child in children:
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
            nested = _build_list_flowable(child, styles, meta)
            if nested is not None:
                content.append(nested)
        elif child_type in {"block_code", "fenced_code"}:
            content.extend(_build_code_flowables(child, styles, meta))
        elif child_type == "block_quote":
            content.extend(_build_blockquote_flowables(child, styles, meta))
        elif child_type == "blank_line":
            content.append(Spacer(1, 4))

    while content and isinstance(content[-1], Spacer):
        content.pop()

    if len(content) == 1:
        return []

    panel = Table([[Spacer(1, 1), content]], colWidths=[4, None], hAlign="LEFT")
    panel.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor(color)),
        ("BACKGROUND", (1, 0), (1, -1), colors.HexColor(bg)),
        ("BOX", (0, 0), (-1, -1), 0.75, colors.HexColor(color)),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (0, -1), 0),
        ("RIGHTPADDING", (0, 0), (0, -1), 0),
        ("TOPPADDING", (0, 0), (0, -1), 0),
        ("BOTTOMPADDING", (0, 0), (0, -1), 0),
        ("LEFTPADDING", (1, 0), (1, -1), padding),
        ("RIGHTPADDING", (1, 0), (1, -1), padding),
        ("TOPPADDING", (1, 0), (1, -1), padding),
        ("BOTTOMPADDING", (1, 0), (1, -1), padding),
    ]))

    return [panel, Spacer(1, styles["body"].spaceAfter)]


def _build_footnotes_flowables(token: dict, styles: dict, meta: dict) -> list[Flowable]:
    hr = meta["horizontal_rules"]
    body = styles["body"]

    footnote_style = ParagraphStyle(
        "footnote_item",
        parent=body,
        fontSize=max(body.fontSize - 2, 8),
        spaceAfter=3,
        spaceBefore=0,
    )

    flowables: list[Flowable] = [
        Spacer(1, hr["spacing_before"]),
        HRFlowable(width="100%", color=colors.HexColor(hr["color"]), thickness=hr["thickness"]),
        Spacer(1, 6),
    ]

    for item in token.get("children") or []:
        if item.get("type") != "footnote_item":
            continue
        idx = item.get("attrs", {}).get("index", "?")
        text_parts: list[str] = []
        for child in item.get("children") or []:
            if child.get("type") in {"paragraph", "block_text"}:
                text_parts.append(_inline_text(child.get("children") or []))
        text = " ".join(t for t in text_parts if t)
        if text:
            flowables.append(Paragraph(f"[{idx}] {text}", footnote_style))

    return flowables


def _build_blockquote_flowables(token: dict, styles: dict, meta: dict) -> list[Flowable]:
    alert_type, alert_children = _detect_alert(token)
    if alert_type is not None:
        return _build_alert_flowables(alert_type, alert_children, styles, meta)

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

        elif token_type == "footnotes":
            flowables.extend(_build_footnotes_flowables(token, styles, meta))

        elif token_type == "blank_line":
            flowables.append(Spacer(1, 6))

    return flowables


def build_flowables(tokens: list[dict], theme: Theme) -> list[Flowable]:
    styles = build_styles(theme)
    return _build_token_flowables(tokens, styles)
