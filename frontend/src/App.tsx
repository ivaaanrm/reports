import { useEffect, useRef, useState } from 'react'
import Dock from './components/Dock'
import FileUpload from './components/FileUpload'
import PDFPreview from './components/PDFPreview'
import TemplateStudio from './components/TemplateStudio'
import ThemePicker from './components/ThemePicker'
import { generatePDF } from './api/client'
import type { Theme } from './api/types'

type View = 'generate' | 'studio'

function DownloadIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export default function App() {
  const [view, setView] = useState<View>('generate')
  const [markdownFile, setMarkdownFile] = useState<File | null>(null)
  const [selectedThemeSlug, setSelectedThemeSlug] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [numPages, setNumPages] = useState<number | null>(null)
  const pdfUrlRef = useRef<string | null>(null)

  useEffect(() => {
    return () => {
      if (pdfUrlRef.current) URL.revokeObjectURL(pdfUrlRef.current)
    }
  }, [])

  useEffect(() => {
    if (pdfUrlRef.current) {
      URL.revokeObjectURL(pdfUrlRef.current)
      pdfUrlRef.current = null
    }

    setPdfUrl(null)
    setError(null)
    setPage(1)
    setNumPages(null)

    if (!markdownFile || !selectedThemeSlug) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    void generatePDF(markdownFile, selectedThemeSlug, controller.signal)
      .then((url) => {
        pdfUrlRef.current = url
        setPdfUrl(url)
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === 'AbortError') return
        setError(e instanceof Error ? e.message : 'Generation failed')
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [markdownFile, selectedThemeSlug])

  function handleTemplateCreated(theme: Theme) {
    setSelectedThemeSlug(theme.slug)
    setView('generate')
  }

  return (
    <div className="flex h-screen flex-col bg-[radial-gradient(ellipse_at_top,_rgba(14,165,233,0.07),_transparent_50%),linear-gradient(180deg,_#f8fbff_0%,_#f0f4fa_100%)]">
      {/* Top navbar — consistent across views */}
      <header className="flex h-12 flex-shrink-0 items-center border-b border-slate-200/60 bg-white/90 px-6 backdrop-blur-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-600">Reports</p>
        <span className="mx-3 h-3.5 w-px bg-slate-200" />
        <h1 className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-sm text-slate-900">
          Enterprise PDF Builder
        </h1>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          {view === 'generate' ? 'Generate' : 'Template Studio'}
        </span>
      </header>

      {/* View content — full width, scrollable, clears the floating HUD */}
      <div className="flex-1 overflow-y-auto pb-24">
        {view === 'generate' ? (
          <div className="p-6 lg:p-8">
            {/* Template selection in wrapping rows */}
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">
              Template
            </p>
            <ThemePicker selectedSlug={selectedThemeSlug} onSelect={setSelectedThemeSlug} />

            {/* PDF area */}
            <div className="mt-10">
              {error && (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center gap-5 py-20">
                  <div className="relative h-11 w-11">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                    <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-sky-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">Rendering PDF</p>
                    <p className="mt-1 text-xs text-slate-400">Applying theme and building layout…</p>
                  </div>
                </div>
              )}

              {!loading && pdfUrl && (
                <PDFPreview pdfUrl={pdfUrl} page={page} onLoadSuccess={setNumPages} />
              )}

              {!loading && !pdfUrl && !error && (
                <div className="flex flex-col items-center gap-4 py-20 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-300 shadow-sm">
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">No preview yet</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Upload a .md file and select a template
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <TemplateStudio onCreated={handleTemplateCreated} />
        )}
      </div>

      {/* Floating bottom HUD — centered, three pills */}
      <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3">
        {/* Upload pill */}
        <div className="flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-2.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <FileUpload onFileSelect={setMarkdownFile} selectedFile={markdownFile} />
        </div>

        {/* View switcher */}
        <Dock view={view} onViewChange={setView} />

        {/* Pagination + download — only when PDF is loaded */}
        {pdfUrl && (
          <div className="flex items-center gap-1 rounded-full border border-white/60 bg-white/90 px-2 py-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ‹
            </button>
            <span className="min-w-[56px] text-center text-sm text-slate-600">
              {page} / {numPages ?? '…'}
            </span>
            <button
              disabled={numPages === null || page >= numPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ›
            </button>
            <div className="mx-1 h-4 w-px bg-slate-200" />
            <a
              href={pdfUrl}
              download="report.pdf"
              className="flex h-8 items-center gap-1.5 rounded-full bg-slate-950 px-3.5 text-xs font-medium text-white transition hover:bg-slate-800"
            >
              <DownloadIcon />
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
