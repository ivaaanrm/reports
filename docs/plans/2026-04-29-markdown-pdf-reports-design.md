# Markdown PDF Reports — Design Document

**Date:** 2026-04-29
**Status:** Approved

## Overview

A monorepo web application that converts Markdown files into beautifully styled PDFs using ReportLab. Users upload a `.md` file via a React/TypeScript frontend, select from a shared library of pre-configured themes, and see a live in-browser PDF preview. The backend stores only theme/style metadata — generated PDFs are never persisted.

---

## Architecture

### Approach

FastAPI monolith — single backend service handling both theme CRUD and PDF generation. PDF is rendered in-memory and streamed back as `application/pdf`. Chosen over microservice or async job queue approaches for simplicity and appropriate fit for current scale.

### Repository Structure

```
monorepo/
├── backend/
│   ├── app/
│   │   ├── api/          # Route handlers (themes, generate)
│   │   ├── models/       # Beanie document models
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   ├── pdf/          # ReportLab rendering module
│   │   └── main.py
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/   # ThemePicker, FileUpload, PDFPreview
│   │   └── api/          # Typed fetch wrappers
│   └── package.json
└── docker-compose.yml    # mongo + backend + frontend
```

### Runtime Flow

1. User uploads `.md` + selects a theme in the frontend
2. Frontend POSTs `multipart/form-data` (`file`, `theme_id`) to `POST /generate`
3. FastAPI parses markdown, fetches theme config from MongoDB, passes both to the ReportLab engine
4. Engine returns a PDF as an in-memory `BytesIO` — FastAPI streams it back as `application/pdf`
5. Frontend receives the blob and renders it inline with PDF.js

---

## Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI |
| Database | MongoDB (via Docker Compose) |
| ODM | Beanie (async, built on Motor) |
| PDF engine | ReportLab |
| Markdown parser | mistune or markdown-it-py |
| Frontend | React + TypeScript + Vite |
| Styling | TailwindCSS |
| PDF preview | react-pdf (PDF.js wrapper) |

---

## Data Model

### `themes` collection

```python
class Theme(Document):
    name: str                    # "Corporate Blue"
    slug: str                    # "corporate-blue" (unique)
    description: str
    is_default: bool = False

    # Visual
    font_family: str             # "Helvetica"
    font_size_body: int          # 11
    font_size_heading: int       # 18
    primary_color: str           # "#003366"
    secondary_color: str         # "#666666"
    background_color: str        # "#FFFFFF"

    # Layout
    page_size: str               # "A4" | "LETTER"
    margin_top: float
    margin_bottom: float
    margin_left: float
    margin_right: float
    line_spacing: float          # 1.2
    columns: int = 1

    # Header / Footer
    show_header: bool = True
    header_text: str | None
    show_footer: bool = True
    show_page_numbers: bool = True

    created_at: datetime
    updated_at: datetime

    class Settings:
        name = "themes"
```

No other collections. Generated PDFs are not stored.

---

## API Surface

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/themes` | List all themes |
| `POST` | `/themes` | Create a theme |
| `GET` | `/themes/{slug}` | Get one theme |
| `PUT` | `/themes/{slug}` | Update a theme |
| `DELETE` | `/themes/{slug}` | Delete a theme |
| `POST` | `/generate` | Upload `.md` + `theme_id` → returns PDF binary |

---

## PDF Engine

Located at `backend/app/pdf/`. Pure Python, no FastAPI dependency.

```
pdf/
├── engine.py     # render(markdown: str, theme: Theme) -> BytesIO
├── parser.py     # markdown → AST
└── elements.py   # AST node → ReportLab Flowable
```

### Rendering Pipeline

```
.md string
  → parser.py      # AST: headings, paragraphs, code blocks, lists, tables, images
  → elements.py    # maps each node to ReportLab Flowables
  → engine.py      # builds SimpleDocTemplate with theme config, assembles PDF
  → BytesIO
```

**Supported Markdown elements:** H1–H4 headings, paragraphs, bold/italic, unordered/ordered lists, code blocks, blockquotes, horizontal rules, tables, inline images.

---

## Frontend

**Stack:** React + TypeScript + Vite + TailwindCSS + react-pdf

```
src/
├── components/
│   ├── FileUpload.tsx    # drag-and-drop .md upload
│   ├── ThemePicker.tsx   # grid of theme cards
│   └── PDFPreview.tsx    # renders PDF blob via react-pdf
├── api/
│   └── client.ts         # typed fetch wrappers
└── App.tsx               # sidebar (upload + themes) + main (PDF preview)
```

### UX Flow

1. User drags `.md` file onto `FileUpload`
2. `ThemePicker` shows themes from `GET /themes`
3. Selecting a theme triggers `POST /generate` → PDF blob
4. `PDFPreview` renders inline with pagination controls
5. Download button available once PDF is generated

---

## Error Handling

- `POST /generate`: `400` for invalid markdown, `404` for unknown theme slug, `422` for malformed form data, `500` for ReportLab failures
- PDF engine raises typed exceptions (`MarkdownParseError`, `RenderError`) — caught at route layer, never leak stack traces
- Frontend: inline error banners for failures, skeleton loader during generation

---

## Testing

| Layer | Approach |
|---|---|
| PDF engine | Unit tests: fixed markdown + theme fixtures → assert valid non-empty `BytesIO` |
| API routes | pytest + httpx AsyncClient against a real test MongoDB instance |
| Theme CRUD | Integration tests: create/read/update/delete + slug uniqueness |
| Frontend | Vitest + React Testing Library for component logic |
