import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface Props {
  pdfUrl: string
  page: number
  onLoadSuccess: (numPages: number) => void
}

export default function PDFPreview({ pdfUrl, page, onLoadSuccess }: Props) {
  return (
    <div className="flex justify-center">
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => onLoadSuccess(numPages)}
        className="rounded-lg shadow-[0_24px_64px_rgba(15,23,42,0.14)]"
      >
        <Page pageNumber={page} />
      </Document>
    </div>
  )
}
