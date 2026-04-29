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
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Markdown File</h2>
      <div
        className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-6 text-center text-sm text-gray-500 transition-colors hover:border-blue-400 hover:bg-blue-50"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {selectedFile ? (
          <span className="font-medium text-blue-600">{selectedFile.name}</span>
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
