from reportlab.platypus import Flowable, Paragraph, Preformatted, Spacer, HRFlowable, ListFlowable, ListItem
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
from app.models.theme import Theme


def build_styles(theme: Theme) -> dict[str, ParagraphStyle]:
    primary = colors.HexColor(theme.primary_color)
    secondary = colors.HexColor(theme.secondary_color)

    base = ParagraphStyle(
        "body",
        fontName=theme.font_family,
        fontSize=theme.font_size_body,
        leading=theme.font_size_body * theme.line_spacing * 1.2,
        textColor=secondary,
        spaceAfter=6,
    )

    def heading(level: int, size: int) -> ParagraphStyle:
        return ParagraphStyle(
            f"h{level}",
            parent=base,
            fontSize=size,
            fontName=f"{theme.font_family}-Bold",
            textColor=primary,
            spaceBefore=12,
            spaceAfter=6,
        )

    code = ParagraphStyle(
        "code",
        parent=base,
        fontName="Courier",
        fontSize=theme.font_size_body - 1,
        backColor=colors.HexColor("#F5F5F5"),
        spaceAfter=8,
    )

    blockquote = ParagraphStyle(
        "blockquote",
        parent=base,
        leftIndent=20,
        textColor=colors.HexColor("#888888"),
        borderPad=4,
    )

    return {
        "body": base,
        "h1": heading(1, theme.font_size_heading),
        "h2": heading(2, theme.font_size_heading - 2),
        "h3": heading(3, theme.font_size_heading - 4),
        "h4": heading(4, theme.font_size_heading - 6),
        "code": code,
        "blockquote": blockquote,
    }


def _inline_text(children: list[dict] | None) -> str:
    if not children:
        return ""
    parts = []
    for child in children:
        t = child.get("type", "")
        raw = child.get("raw", "")
        inner = _inline_text(child.get("children"))
        if t == "strong":
            parts.append(f"<b>{inner}</b>")
        elif t == "emphasis":
            parts.append(f"<i>{inner}</i>")
        elif t == "codespan":
            parts.append(f"<font name='Courier'>{raw}</font>")
        elif t in ("softline_break", "line_break"):
            parts.append("<br/>")
        else:
            parts.append(raw or inner)
    return "".join(parts)


def build_flowables(tokens: list[dict], theme: Theme) -> list[Flowable]:
    styles = build_styles(theme)
    flowables: list[Flowable] = []

    for token in tokens:
        t = token.get("type", "")
        children = token.get("children") or []

        if t in ("heading", "atx_heading"):
            level = token.get("attrs", {}).get("level", 1)
            level = max(1, min(4, level))
            text = _inline_text(children)
            flowables.append(Paragraph(text, styles[f"h{level}"]))

        elif t == "paragraph":
            text = _inline_text(children)
            flowables.append(Paragraph(text, styles["body"]))

        elif t in ("block_code", "fenced_code"):
            code_text = token.get("raw", "").rstrip()
            flowables.append(Preformatted(code_text, styles["code"]))

        elif t == "block_quote":
            for child in children:
                text = _inline_text(child.get("children") or [])
                flowables.append(Paragraph(text, styles["blockquote"]))

        elif t in ("list", "bullet_list", "ordered_list"):
            items = []
            for item in children:
                text = _inline_text(item.get("children") or [])
                items.append(ListItem(Paragraph(text, styles["body"]), bulletColor=colors.HexColor(theme.primary_color)))
            flowables.append(ListFlowable(items, bulletType="bullet"))

        elif t == "thematic_break":
            flowables.append(Spacer(1, 6))
            flowables.append(HRFlowable(width="100%", color=colors.HexColor(theme.secondary_color)))
            flowables.append(Spacer(1, 6))

        elif t == "blank_line":
            flowables.append(Spacer(1, 6))

    return flowables
