from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from app.core.cache import build_cache_target, get_cached_pdf_path, store_cached_pdf
from app.models.theme import Theme
from app.pdf.engine import RenderError, render

router = APIRouter(tags=["Generate"])


def _pdf_response(path: str) -> FileResponse:
    return FileResponse(
        path,
        media_type="application/pdf",
        headers={"Content-Disposition": 'inline; filename="report.pdf"'},
    )


@router.post("/generate")
async def generate_pdf(
    file: UploadFile = File(...),
    theme_id: str = Form(...),
):
    if not (file.filename or "").endswith(".md"):
        raise HTTPException(status_code=400, detail="Only .md files are accepted")

    theme = await Theme.find_one(Theme.slug == theme_id)
    if not theme:
        raise HTTPException(status_code=404, detail="Theme not found")

    content = await file.read()
    try:
        markdown_text = content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be valid UTF-8")

    if not markdown_text.strip():
        raise HTTPException(status_code=400, detail="File is empty")

    cache_target = build_cache_target(markdown_text, theme)
    cached_path = await get_cached_pdf_path(cache_target)
    if cached_path is not None:
        return _pdf_response(str(cached_path))

    try:
        pdf_buffer = render(markdown_text, theme)
    except RenderError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    pdf_path = await store_cached_pdf(cache_target, pdf_buffer.getvalue())
    return _pdf_response(str(pdf_path))
