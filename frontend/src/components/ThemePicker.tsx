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

  if (loading) return <p className="text-sm text-gray-400">Loading themes…</p>
  if (error) return <p className="text-sm text-red-500">{error}</p>
  if (!themes.length)
    return <p className="text-sm text-gray-400">No themes yet. Create one via the API.</p>

  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold text-gray-700">Theme</h2>
      <div className="flex flex-col gap-2">
        {themes.map((theme) => (
          <button
            key={theme.slug}
            onClick={() => onSelect(theme.slug)}
            className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              selectedSlug === theme.slug
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 flex-shrink-0 rounded-sm border border-gray-200"
                style={{ backgroundColor: theme.primary_color }}
              />
              <span className="font-medium">{theme.name}</span>
              {theme.is_default && (
                <span className="ml-auto text-xs text-gray-400">default</span>
              )}
            </div>
            {theme.description && (
              <p className="mt-0.5 text-xs text-gray-500">{theme.description}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
