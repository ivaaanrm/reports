import type { Theme, ThemeCreate } from './types'

const BASE = '/api'

async function handleError(res: Response): Promise<never> {
  const body = await res.json().catch(() => ({ detail: res.statusText }))
  throw new Error(body.detail ?? 'Request failed')
}

export async function listThemes(): Promise<Theme[]> {
  const res = await fetch(`${BASE}/themes/`)
  if (!res.ok) await handleError(res)
  return res.json()
}

export async function createTheme(data: ThemeCreate): Promise<Theme> {
  const res = await fetch(`${BASE}/themes/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) await handleError(res)
  return res.json()
}

export async function deleteTheme(slug: string): Promise<void> {
  const res = await fetch(`${BASE}/themes/${slug}`, { method: 'DELETE' })
  if (!res.ok) await handleError(res)
}

export async function generatePDF(file: File, themeSlug: string): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  form.append('theme_id', themeSlug)

  const res = await fetch(`${BASE}/generate`, { method: 'POST', body: form })
  if (!res.ok) await handleError(res)

  const blob = await res.blob()
  return URL.createObjectURL(blob)
}
