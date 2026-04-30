import { useEffect, useState } from 'react'
import { listThemes } from '../api/client'
import type { Theme } from '../api/types'

interface Props {
  selectedSlug: string | null
  onSelect: (slug: string) => void
}

function CheckIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function ThemePicker({ selectedSlug, onSelect }: Props) {
  const [themes, setThemes] = useState<Theme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listThemes()
      .then(setThemes)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load themes'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-xs text-slate-400">Loading…</p>
  if (error) return <p className="text-xs text-red-500">{error}</p>
  if (!themes.length)
    return <p className="text-xs text-slate-400">No templates — create one in Studio.</p>

  return (
    <div className="flex flex-wrap gap-2">
      {themes.map((theme) => {
        const isSelected = selectedSlug === theme.slug
        return (
          <button
            key={theme.slug}
            onClick={() => onSelect(theme.slug)}
            className={`w-36 overflow-hidden rounded-xl border text-left transition-all duration-150 ${
              isSelected
                ? 'border-slate-950 shadow-[0_0_0_1px_#0f172a]'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            {/* Three-color palette strip */}
            <div className="flex h-1.5 w-full">
              <div className="flex-1" style={{ backgroundColor: theme.palette.primary_color }} />
              <div className="flex-1" style={{ backgroundColor: theme.palette.secondary_color }} />
              <div className="flex-1" style={{ backgroundColor: theme.palette.accent_color }} />
            </div>
            {/* Name row */}
            <div className="flex items-center justify-between gap-1 bg-white px-3 py-2">
              <span className="truncate text-xs font-semibold text-slate-700">{theme.name}</span>
              {isSelected && (
                <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-slate-950">
                  <CheckIcon />
                </span>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
