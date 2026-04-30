import { useEffect, useState } from 'react'
import { listThemes } from '../api/client'
import type { Theme } from '../api/types'

interface Props {
  selectedTheme: Theme | null
  onSelect: (theme: Theme) => void
  onNewTemplate: () => void
}

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function ThemePicker({ selectedTheme, onSelect, onNewTemplate }: Props) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listThemes()
      .then(setThemes)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load themes'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="px-3 text-xs text-slate-400">Loading…</p>
  if (error) return <p className="px-3 text-xs text-red-500">{error}</p>

  return (
    <div className="flex flex-col gap-1">
      {themes.map((theme) => {
        const isSelected = selectedTheme?.slug === theme.slug
        return (
          <button
            key={theme.slug}
            onClick={() => onSelect(theme)}
            className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all duration-150 ${
              isSelected
                ? 'border-slate-950 bg-white shadow-[0_0_0_1px_#0f172a,0_2px_8px_rgba(15,23,42,0.06)]'
                : 'border-transparent hover:border-slate-200 hover:bg-white'
            }`}
          >
            {/* Three stacked color dots */}
            <div className="flex flex-shrink-0 flex-col gap-[3px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.palette.primary_color }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.palette.secondary_color }} />
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: theme.palette.accent_color }} />
            </div>
            <span className="flex-1 truncate text-sm font-medium text-slate-700">{theme.name}</span>
            {isSelected && (
              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-950">
                <CheckIcon />
              </span>
            )}
          </button>
        )
      })}

      {/* New template */}
      <button
        onClick={onNewTemplate}
        className="mt-1 flex items-center gap-2.5 rounded-xl border border-dashed border-slate-300 px-3 py-2.5 text-left transition-all hover:border-slate-400 hover:bg-white"
      >
        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-slate-300 text-slate-400">
          <PlusIcon />
        </div>
        <span className="text-sm font-medium text-slate-500">New Template</span>
      </button>
    </div>
  )
}
