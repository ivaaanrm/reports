type View = 'generate' | 'studio'

interface Props {
  view: View
  onViewChange: (view: View) => void
}

function GenerateIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  )
}

function StudioIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  )
}

export default function Dock({ view, onViewChange }: Props) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-white/60 bg-white/90 p-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
      <button
        onClick={() => onViewChange('generate')}
        title="Generate Reports"
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
          view === 'generate'
            ? 'bg-slate-950 text-white shadow-sm'
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
        }`}
      >
        <GenerateIcon />
      </button>
      <button
        onClick={() => onViewChange('studio')}
        title="Template Studio"
        className={`flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200 ${
          view === 'studio'
            ? 'bg-slate-950 text-white shadow-sm'
            : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
        }`}
      >
        <StudioIcon />
      </button>
    </div>
  )
}
