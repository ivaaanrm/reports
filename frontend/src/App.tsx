import { useState } from 'react'
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

  async function handleGenerate() {
    if (!markdownFile || !selectedThemeSlug) return
    setLoading(true)
    setError(null)
    try {
      if (pdfUrl) URL.revokeObjectURL(pdfUrl)
      const url = await generatePDF(markdownFile, selectedThemeSlug)
      setPdfUrl(url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="flex w-80 flex-col gap-6 overflow-y-auto border-r bg-white p-6">
        <h1 className="text-xl font-bold text-gray-900">Reports</h1>
        <FileUpload onFileSelect={setMarkdownFile} selectedFile={markdownFile} />
        <ThemePicker selectedSlug={selectedThemeSlug} onSelect={setSelectedThemeSlug} />
        <button
          disabled={!markdownFile || !selectedThemeSlug || loading}
          onClick={handleGenerate}
          className="mt-auto rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? 'Generating…' : 'Generate PDF'}
        </button>
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
