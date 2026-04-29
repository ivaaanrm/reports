import { useEffect, useRef, useState } from 'react'
import FileUpload from './components/FileUpload'
import ThemePicker from './components/ThemePicker'
import PDFPreview from './components/PDFPreview'
import TemplateStudio from './components/TemplateStudio'
import { generatePDF } from './api/client'
import type { Theme } from './api/types'

type View = 'generate' | 'studio'

export default function App() {
  const [view, setView] = useState<View>('generate')
  const [markdownFile, setMarkdownFile] = useState<File | null>(null)
  const [selectedThemeSlug, setSelectedThemeSlug] = useState<string | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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

    return () => {
      controller.abort()
    }
  }, [markdownFile, selectedThemeSlug])

  function handleFileSelect(file: File | null) {
    setMarkdownFile(file)
  }

  function handleTemplateCreated(theme: Theme) {
    setSelectedThemeSlug(theme.slug)
  }

  return (
    <div className="flex h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.15),_transparent_32%),linear-gradient(180deg,_#f8fbff_0%,_#eef3f9_100%)] text-slate-900">
      <aside className="flex w-80 flex-col gap-6 overflow-y-auto border-r border-white/70 bg-white/75 p-6 shadow-[24px_0_60px_rgba(15,23,42,0.06)] backdrop-blur">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-700">
            Reports
          </p>
          <h1 className="mt-3 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-3xl text-slate-950">
            Enterprise PDF Builder
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create brand-safe report templates, then render Markdown into polished PDFs.
          </p>
        </div>

        <div className="grid gap-2 rounded-[24px] border border-slate-200 bg-slate-50 p-2">
          <button
            onClick={() => setView('generate')}
            className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              view === 'generate'
                ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/10'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            Generate Reports
          </button>
          <button
            onClick={() => setView('studio')}
            className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              view === 'studio'
                ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/10'
                : 'text-slate-600 hover:bg-white hover:text-slate-900'
            }`}
          >
            Template Studio
          </button>
        </div>

        {view === 'generate' ? (
          <>
            <FileUpload onFileSelect={handleFileSelect} selectedFile={markdownFile} />
            <ThemePicker selectedSlug={selectedThemeSlug} onSelect={setSelectedThemeSlug} />
          </>
        ) : (
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
            <p className="text-sm font-semibold text-slate-700">Studio Focus</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Build a reusable template with company palette, embedded logo, shared header/footer rules, and markdown component formatting.
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.24em] text-slate-400">
              Saved templates appear automatically in Generate Reports.
            </p>
          </div>
        )}
      </aside>
      <main className="flex-1 overflow-y-auto">
        {view === 'generate' ? (
          <div className="p-6 lg:p-8">
            {error && (
              <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <PDFPreview pdfUrl={pdfUrl} loading={loading} />
          </div>
        ) : (
          <TemplateStudio onCreated={handleTemplateCreated} />
        )}
      </main>
    </div>
  )
}
