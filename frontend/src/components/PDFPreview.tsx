import { useEffect, useState } from 'react'
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

  useEffect(() => {
    setNumPages(null)
    setPage(1)
  }, [pdfUrl])

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 rounded-[28px] border border-slate-200 bg-white px-10 py-12 shadow-sm">
          <div className="relative h-14 w-14">
            <div className="absolute inset-0 rounded-full border border-slate-200" />
            <div className="absolute inset-0 rounded-full border-4 border-sky-100" />
            <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-r-blue-400 border-t-sky-500" />
            <div className="absolute inset-3 rounded-full bg-gradient-to-br from-sky-50 to-white shadow-inner" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">Building preview</p>
            <p className="text-xs text-slate-400">
              Rendering your PDF with the selected theme...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!pdfUrl) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Upload a .md file and choose a theme to preview the PDF automatically
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
