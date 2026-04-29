from io import BytesIO
from reportlab.lib.pagesizes import A4, LETTER
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib import colors
from app.models.theme import Theme
from app.pdf.parser import parse
from app.pdf.elements import build_flowables, build_styles

PAGE_SIZES = {"A4": A4, "LETTER": LETTER}


class RenderError(Exception):
    pass


def _make_header_footer(theme: Theme, styles: dict):
    primary = colors.HexColor(theme.primary_color)
    secondary = colors.HexColor(theme.secondary_color)

    def on_page(canvas, doc):
        canvas.saveState()
        w, h = doc.pagesize

        if theme.show_header and theme.header_text:
            canvas.setFont(theme.font_family, 9)
            canvas.setFillColor(secondary)
            canvas.drawString(theme.margin_left, h - theme.margin_top + 16, theme.header_text)
            canvas.setStrokeColor(primary)
            canvas.setLineWidth(0.5)
            canvas.line(theme.margin_left, h - theme.margin_top + 10, w - theme.margin_right, h - theme.margin_top + 10)

        if theme.show_footer:
            canvas.setStrokeColor(primary)
            canvas.setLineWidth(0.5)
            canvas.line(theme.margin_left, theme.margin_bottom - 10, w - theme.margin_right, theme.margin_bottom - 10)
            if theme.show_page_numbers:
                canvas.setFont(theme.font_family, 9)
                canvas.setFillColor(secondary)
                canvas.drawRightString(w - theme.margin_right, theme.margin_bottom - 22, f"Page {doc.page}")

        canvas.restoreState()

    return on_page


def render(markdown_text: str, theme: Theme) -> BytesIO:
    try:
        buffer = BytesIO()
        page_size = PAGE_SIZES.get(theme.page_size.upper(), A4)
        styles = build_styles(theme)

        doc = SimpleDocTemplate(
            buffer,
            pagesize=page_size,
            topMargin=theme.margin_top,
            bottomMargin=theme.margin_bottom,
            leftMargin=theme.margin_left,
            rightMargin=theme.margin_right,
        )

        tokens = parse(markdown_text)
        flowables = build_flowables(tokens, theme)

        if not flowables:
            flowables = [Paragraph("(empty document)", styles["body"])]

        on_page = _make_header_footer(theme, styles)
        doc.build(flowables, onFirstPage=on_page, onLaterPages=on_page)

        buffer.seek(0)
        return buffer
    except Exception as exc:
        raise RenderError(f"Render failed: {exc}") from exc
