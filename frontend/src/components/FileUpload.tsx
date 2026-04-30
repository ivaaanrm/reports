import { useRef } from 'react'

interface Props {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
}

function UploadIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16" />
      <line x1="12" y1="12" x2="12" y2="21" />
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export default function FileUpload({ onFileSelect, selectedFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFileSelect(e.target.files?.[0] ?? null)
  }

  if (selectedFile) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-slate-400"><UploadIcon /></span>
        <span className="max-w-[144px] truncate text-xs font-medium text-slate-700">
          {selectedFile.name}
        </span>
        <button
          type="button"
          onClick={() => onFileSelect(null)}
          aria-label="Remove file"
          className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
        >
          <XIcon />
        </button>
      </div>
    )
  }

  return (
    <label className="flex cursor-pointer items-center gap-1.5 transition">
      <span className="text-slate-400"><UploadIcon /></span>
      <span className="text-xs font-medium text-slate-600 hover:text-slate-900">Upload .md</span>
      <input ref={inputRef} type="file" accept=".md" className="hidden" onChange={handleChange} />
    </label>
  )
}
