import { useEffect, useRef, useState } from 'react'
import FileUpload from './components/FileUpload'
import ThemePicker from './components/ThemePicker'
import PDFPreview from './components/PDFPreview'
import { generatePDF } from './api/client'

export default function App() {
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

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex w-80 flex-col gap-6 overflow-y-auto border-r bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <FileUpload onFileSelect={handleFileSelect} selectedFile={markdownFile} />
        <ThemePicker selectedSlug={selectedThemeSlug} onSelect={setSelectedThemeSlug} />
      </aside>
      <main className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="mb-4 rounded border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <PDFPreview pdfUrl={pdfUrl} loading={loading} />
      </main>
    </div>
  )
}
