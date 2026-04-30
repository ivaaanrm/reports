import base64
import binascii
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, LETTER
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph, SimpleDocTemplate

from app.models.theme import HeaderFooterSettings, Theme
from app.pdf.elements import build_flowables, build_styles
from app.pdf.parser import parse

PAGE_SIZES = {"A4": A4, "LETTER": LETTER}


class RenderError(Exception):
    pass


def _load_logo(theme: Theme) -> tuple[ImageReader, float, float] | None:
    if theme.logo is None or not theme.logo.data.startswith("data:"):
        return None

    try:
        header, encoded = theme.logo.data.split(",", 1)
        if ";base64" not in header:
            return None

        image_bytes = base64.b64decode(encoded)
        reader = ImageReader(BytesIO(image_bytes))
        width, height = reader.getSize()
        target_width = max(24.0, min(theme.logo.width, 180.0))
        target_height = target_width * (height / width)
        return reader, target_width, target_height
    except (ValueError, binascii.Error):
        return None


def _region_text(region: HeaderFooterSettings, theme: Theme) -> str | None:
    text = region.text or theme.company_name
    return text.strip() if text else None


def _draw_region(
    canvas,
    doc,
    *,
    theme: Theme,
    region: HeaderFooterSettings,
    position: str,
    primary: colors.Color,
    secondary: colors.Color,
    logo: tuple[ImageReader, float, float] | None,
) -> None:
    if not region.enabled:
        return

    layout = theme.advanced.layout
    typography = theme.advanced.typography

    left = layout.margin_left
    right = doc.pagesize[0] - layout.margin_right
    font_name = typography.font_family
    font_size = 9
    text = _region_text(region, theme)
    logo_payload = logo if region.show_logo else None

    if position == "header":
        center_y = doc.pagesize[1] - layout.margin_top / 2
        line_y = doc.pagesize[1] - layout.margin_top + 10
    else:
        center_y = max(layout.margin_bottom / 2 - 4, 18)
        line_y = layout.margin_bottom - 10

    if region.divider:
        canvas.setStrokeColor(primary)
        canvas.setLineWidth(0.5)
        canvas.line(left, line_y, right, line_y)

    if not text and not logo_payload:
        return

    canvas.setFont(font_name, font_size)
    canvas.setFillColor(secondary)

    text_width = canvas.stringWidth(text or "", font_name, font_size)
    logo_width = logo_payload[1] if logo_payload else 0.0
    logo_height = logo_payload[2] if logo_payload else 0.0
    gap = 8.0 if logo_payload and text else 0.0

    page_label = ""
    reserved_right = right
    if position == "footer" and region.show_page_numbers:
        page_label = f"Page {doc.page}"
        page_width = canvas.stringWidth(page_label, font_name, font_size)
        reserved_right = right - page_width - 20

    group_width = logo_width + gap + text_width

    if region.align == "center":
        start_x = left + max((reserved_right - left - group_width) / 2, 0)
    elif region.align == "right":
        start_x = reserved_right - group_width
    else:
        start_x = left

    if logo_payload:
        reader, _, _ = logo_payload
        canvas.drawImage(
            reader,
            start_x,
            center_y - logo_height / 2,
            width=logo_width,
            height=logo_height,
            preserveAspectRatio=True,
            mask="auto",
        )

    if text:
        text_x = start_x + logo_width + gap
        canvas.drawString(text_x, center_y - 3, text)

    if page_label:
        canvas.drawRightString(right, center_y - 3, page_label)


def _make_header_footer(theme: Theme):
    primary = colors.HexColor(theme.palette.primary_color)
    secondary = colors.HexColor(theme.palette.secondary_color)
    background = colors.HexColor(theme.palette.background_color)
    logo = _load_logo(theme)

    def on_page(canvas, doc):
        canvas.saveState()
        width, height = doc.pagesize

        canvas.setFillColor(background)
        canvas.rect(0, 0, width, height, stroke=0, fill=1)

        _draw_region(
            canvas,
            doc,
            theme=theme,
            region=theme.advanced.header,
            position="header",
            primary=primary,
            secondary=secondary,
            logo=logo,
        )
        _draw_region(
            canvas,
            doc,
            theme=theme,
            region=theme.advanced.footer,
            position="footer",
            primary=primary,
            secondary=secondary,
            logo=logo,
        )
        canvas.restoreState()

    return on_page


def render(markdown_text: str, theme: Theme) -> BytesIO:
    try:
        buffer = BytesIO()
        layout = theme.advanced.layout
        page_size = PAGE_SIZES.get(layout.page_size.upper(), A4)
        styles = build_styles(theme)

        doc = SimpleDocTemplate(
            buffer,
            pagesize=page_size,
            topMargin=layout.margin_top,
            bottomMargin=layout.margin_bottom,
            leftMargin=layout.margin_left,
            rightMargin=layout.margin_right,
        )

        tokens = parse(markdown_text)
        flowables = build_flowables(tokens, theme)

        if not flowables:
            flowables = [Paragraph("(empty document)", styles["body"])]

        on_page = _make_header_footer(theme)
        doc.build(flowables, onFirstPage=on_page, onLaterPages=on_page)

        buffer.seek(0)
        return buffer
    except Exception as exc:
        raise RenderError(f"Render failed: {exc}") from exc
