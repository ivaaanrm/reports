import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface Props {
  pdfUrl: string | null
  loading: boolean
}

export default function PDFPreview({ pdfUrl, loading }: Props) {
  const [numPages, setNumPages] = useState<number | null>(null)
  const [page, setPage] = useState(1)

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Upload a .md file and select a theme to preview the PDF
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-40"
        >
          ‹ Prev
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {numPages ?? '…'}
        </span>
        <button
          disabled={numPages === null || page >= numPages}
          onClick={() => setPage((p) => p + 1)}
          className="rounded border px-3 py-1 text-sm disabled:opacity-40"
        >
          Next ›
        </button>
        <a
          href={pdfUrl}
          download="report.pdf"
          className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
        >
          Download
        </a>
      </div>
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages)
          setPage(1)
        }}
        className="shadow-lg"
      >
        <Page pageNumber={page} />
      </Document>
    </div>
  )
}
