import { useRef } from 'react'

interface Props {
  onFileSelect: (file: File | null) => void
  selectedFile: File | null
}

export default function FileUpload({ onFileSelect, selectedFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.md')) onFileSelect(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    onFileSelect(e.target.files?.[0] ?? null)
  }

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-slate-700">Markdown File</h2>
      <div
        className="cursor-pointer rounded-[28px] border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500 transition-colors hover:border-sky-400 hover:bg-sky-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {selectedFile ? (
          <span className="font-medium text-sky-700">{selectedFile.name}</span>
        ) : (
          'Drag & drop a .md file or click to browse'
        )}
        <input
          ref={inputRef}
          type="file"
          accept=".md"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    </div>
  )
}
