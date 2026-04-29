import { useEffect, useState } from 'react'
import { listThemes } from '../api/client'
import type { Theme } from '../api/types'

interface Props {
  selectedSlug: string | null
  onSelect: (slug: string) => void
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

  if (loading) return <p className="text-sm text-slate-400">Loading templates…</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!themes.length)
    return <p className="text-sm text-slate-400">No templates yet. Create one in Template Studio.</p>

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-slate-700">Template</h2>
      <div className="flex flex-col gap-2">
        {themes.map((theme) => (
          <button
            key={theme.slug}
            onClick={() => onSelect(theme.slug)}
            className={`rounded-2xl border px-4 py-3 text-left text-sm transition-colors ${
              selectedSlug === theme.slug
                ? 'border-sky-500 bg-sky-50 text-sky-800'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 flex-shrink-0 rounded-sm border border-gray-200"
                style={{ backgroundColor: theme.primary_color }}
              />
              <span className="font-medium">{theme.name}</span>
              {theme.is_default && (
                <span className="ml-auto text-xs text-slate-400">default</span>
              )}
            </div>
            {theme.company_name && (
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {theme.company_name}
              </p>
            )}
            {theme.description && (
              <p className="mt-0.5 text-xs text-slate-500">{theme.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
