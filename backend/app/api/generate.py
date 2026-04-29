from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from app.models.theme import Theme
from app.pdf.engine import RenderError, render

router = APIRouter(tags=["Generate"])


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

    try:
        pdf_buffer = render(markdown_text, theme)
    except RenderError as exc:
        raise HTTPException(status_code=500, detail=str(exc))
    except Exception:
        raise HTTPException(status_code=500, detail="PDF generation failed")

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "inline; filename=report.pdf"},
    )
