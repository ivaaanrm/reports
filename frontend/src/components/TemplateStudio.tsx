import type {
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useState } from 'react'
import { createTheme, updateTheme } from '../api/client'
import type {
  AdvancedTemplateSettings,
  Alignment,
  HeaderFooterSettings,
  MarkdownPreset,
  MarkdownStyles,
  PaletteSettings,
  Theme,
} from '../api/types'

type TemplateDraft = Omit<Theme, 'id' | 'created_at' | 'updated_at'>

type PalettePreset = {
  id: string
  name: string
  description: string
  palette: PaletteSettings
}

const fontOptions = ['Helvetica', 'Times-Roman', 'Courier']
const alignOptions: Alignment[] = ['left', 'center', 'right']
const palettePresets: PalettePreset[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Calm, credible, and boardroom-ready.',
    palette: {
      primary_color: '#12355B',
      secondary_color: '#475569',
      accent_color: '#0F766E',
      background_color: '#F5F7FB',
      surface_color: '#ECF2F8',
      muted_color: '#CBD5E1',
    },
  },
  {
    id: 'forest-ledger',
    name: 'Forest Ledger',
    description: 'Grounded green tones for operations and finance reports.',
    palette: {
      primary_color: '#1F4D3D',
      secondary_color: '#40534C',
      accent_color: '#C66A2B',
      background_color: '#F6F7F2',
      surface_color: '#E6EEE4',
      muted_color: '#C7D5CA',
    },
  },
  {
    id: 'warm-editorial',
    name: 'Warm Editorial',
    description: 'A softer executive palette with warmer highlights.',
    palette: {
      primary_color: '#8F3D1E',
      secondary_color: '#4B423D',
      accent_color: '#C07A3C',
      background_color: '#FFF9F5',
      surface_color: '#F7E8DB',
      muted_color: '#E7CBB2',
    },
  },
  {
    id: 'slate-minimal',
    name: 'Slate Minimal',
    description: 'Quiet monochrome palette for restrained documents.',
    palette: {
      primary_color: '#1E293B',
      secondary_color: '#475569',
      accent_color: '#0284C7',
      background_color: '#F8FAFC',
      surface_color: '#EAEFF5',
      muted_color: '#CBD5E1',
    },
  },
]

function createPresetStyles(
  preset: MarkdownPreset,
  palette: PaletteSettings,
  advanced: Pick<AdvancedTemplateSettings, 'typography'>,
): MarkdownStyles {
  const typography = advanced.typography

  const base: MarkdownStyles = {
    headings: {
      h1: {
        color: palette.primary_color,
        font_size: typography.font_size_heading,
        space_before: 12,
        space_after: 6,
      },
      h2: {
        color: palette.primary_color,
        font_size: Math.max(typography.font_size_heading - 2, typography.font_size_body + 4),
        space_before: 10,
        space_after: 5,
      },
      h3: {
        color: palette.primary_color,
        font_size: Math.max(typography.font_size_heading - 4, typography.font_size_body + 3),
        space_before: 8,
        space_after: 4,
      },
      h4: {
        color: palette.primary_color,
        font_size: Math.max(typography.font_size_heading - 6, typography.font_size_body + 2),
        space_before: 6,
        space_after: 4,
      },
    },
    body: {
      color: palette.secondary_color,
      font_size: typography.font_size_body,
      space_after: 6,
    },
    lists: {
      text_color: palette.secondary_color,
      bullet_color: palette.primary_color,
      item_spacing: 4,
      left_indent: 18,
    },
    blockquotes: {
      text_color: palette.secondary_color,
      border_color: palette.muted_color,
      background_color: palette.surface_color,
      left_indent: 18,
      padding: 8,
    },
    code: {
      text_color: '#0F172A',
      background_color: palette.surface_color,
      border_color: palette.muted_color,
      font_size: Math.max(typography.font_size_body - 1, 9),
      padding: 8,
    },
    horizontal_rules: {
      color: palette.muted_color,
      thickness: 0.75,
      spacing_before: 6,
      spacing_after: 6,
    },
    tables: {
      header_background_color: palette.primary_color,
      header_text_color: '#FFFFFF',
      row_background_color: '#FFFFFF',
      alternate_row_background_color: palette.surface_color,
      border_color: palette.muted_color,
      cell_padding: 6,
    },
  }

  if (preset === 'executive') {
    base.body.space_after = 8
    base.lists.item_spacing = 5
    base.blockquotes.padding = 10
    base.code.padding = 10
    base.tables.cell_padding = 8
    base.headings.h1.space_before = 14
    base.headings.h2.space_before = 12
  }

  if (preset === 'minimal') {
    base.blockquotes.background_color = '#FFFFFF'
    base.code.background_color = '#FFFFFF'
    base.tables.header_background_color = palette.surface_color
    base.tables.header_text_color = palette.primary_color
    base.tables.alternate_row_background_color = '#FFFFFF'
    base.horizontal_rules.thickness = 0.5
  }

  if (preset === 'smooth') {
    base.body.space_after = 10
    base.headings.h1.space_before = 0
    base.headings.h1.space_after = 12
    base.headings.h2.space_before = 16
    base.headings.h2.space_after = 8
    base.headings.h3.space_before = 12
    base.headings.h3.space_after = 6
    base.lists.item_spacing = 6
    base.lists.left_indent = 20
    base.blockquotes.border_color = palette.accent_color
    base.blockquotes.background_color = palette.surface_color
    base.blockquotes.left_indent = 0
    base.blockquotes.padding = 12
    base.code.background_color = '#FFFFFF'
    base.code.border_color = palette.muted_color
    base.code.padding = 12
    base.horizontal_rules.thickness = 0.5
    base.horizontal_rules.spacing_before = 10
    base.horizontal_rules.spacing_after = 10
    base.tables.header_background_color = palette.primary_color
    base.tables.header_text_color = '#FFFFFF'
    base.tables.row_background_color = '#FFFFFF'
    base.tables.alternate_row_background_color = palette.surface_color
    base.tables.border_color = palette.muted_color
    base.tables.cell_padding = 8
  }

  return base
}

function createInitialDraft(): TemplateDraft {
  const palette = palettePresets[0].palette
  const advanced: AdvancedTemplateSettings = {
    typography: {
      font_family: 'Helvetica',
      font_size_body: 11,
      font_size_heading: 22,
      line_spacing: 1.35,
    },
    layout: {
      page_size: 'A4',
      margin_top: 82,
      margin_bottom: 72,
      margin_left: 72,
      margin_right: 72,
      columns: 1,
    },
    header: {
      enabled: true,
      text: 'Confidential',
      align: 'left',
      show_logo: true,
      divider: true,
      show_page_numbers: false,
    },
    footer: {
      enabled: true,
      text: 'Internal Use Only',
      align: 'left',
      show_logo: false,
      divider: true,
      show_page_numbers: true,
    },
    markdown_styles: {} as MarkdownStyles,
  }

  const draft: TemplateDraft = {
    name: 'Enterprise Template',
    slug: 'enterprise-template',
    description: 'Shared company template with reusable branding and report formatting.',
    is_default: false,
    company_name: 'Acme Corporation',
    logo: null,
    palette,
    markdown_preset: 'enterprise',
    advanced,
  }

  draft.advanced.markdown_styles = createPresetStyles(
    draft.markdown_preset,
    draft.palette,
    draft.advanced,
  )
  return draft
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(new Error('Could not read the logo file'))
    reader.readAsDataURL(file)
  })
}

// ─── Design-system primitives ────────────────────────────────────────────────

function CollapsibleSection({
  title,
  subtitle,
  icon,
  defaultOpen = false,
  children,
}: {
  title: string
  subtitle: string
  icon: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-start gap-3 px-6 py-5 text-left"
      >
        <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-800">
            {title}
          </span>
          <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
        </div>
        <svg
          className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
      <div
        className={`grid transition-all duration-200 ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
      >
        <div className="overflow-hidden">
          <div className="border-t border-slate-100 px-6 py-6">{children}</div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

const inputBase =
  'h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-transparent focus:ring-2 focus:ring-sky-500'

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`${inputBase} ${props.className ?? ''}`}
    />
  )
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[88px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-transparent focus:ring-2 focus:ring-sky-500 ${props.className ?? ''}`}
    />
  )
}

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`${inputBase} ${props.className ?? ''}`}
    />
  )
}

function ColorInput({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 transition focus-within:border-transparent focus-within:ring-2 focus-within:ring-sky-500">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-20 bg-transparent text-sm text-slate-800 outline-none"
      />
    </div>
  )
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (next: boolean) => void
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 transition hover:bg-slate-50"
    >
      <span className="text-sm text-slate-600">{label}</span>
      <span
        className={`relative flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-150 ${
          checked ? 'bg-sky-500' : 'bg-slate-200'
        }`}
      >
        <span
          className={`absolute h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-150 ${
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  )
}

function PresetCard({
  selected,
  title,
  description,
  swatches,
  onClick,
}: {
  selected: boolean
  title: string
  description: string
  swatches: string[]
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-4 text-left transition ${
        selected
          ? 'border-sky-200 bg-sky-50 ring-2 ring-sky-500'
          : 'border-slate-200 bg-white ring-1 ring-slate-200 hover:ring-slate-300'
      }`}
    >
      <div className="flex gap-1.5">
        {swatches.map((swatch) => (
          <span
            key={swatch}
            className="h-6 w-6 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>
      <h3 className="mt-3 text-sm font-medium text-slate-700">{title}</h3>
      <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
    </button>
  )
}

// ─── Section icons ────────────────────────────────────────────────────────────

function IconBrand() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
    </svg>
  )
}

function IconPalette() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M2.25 4.125c0-1.036.84-1.875 1.875-1.875h5.25c1.036 0 1.875.84 1.875 1.875V17.25a4.5 4.5 0 1 1-9 0V4.125Zm4.5 14.25a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z" clipRule="evenodd" />
      <path d="M10.719 21.75h9.156c1.036 0 1.875-.84 1.875-1.875v-5.25c0-1.036-.84-1.875-1.875-1.875h-.14l-8.742 8.743c-.09.089-.18.173-.274.257ZM12.738 17.625l6.474-6.474a1.875 1.875 0 0 0 0-2.651L15.5 4.787a1.875 1.875 0 0 0-2.651 0l-.1.099V17.25c0 .126-.003.251-.01.375Z" />
    </svg>
  )
}

function IconText() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M2.625 6.75a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0A.75.75 0 0 1 8.25 6h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75ZM2.625 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0ZM7.5 12a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12A.75.75 0 0 1 7.5 12Zm-4.875 5.25a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875 0a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 0 1.5h-12a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  )
}

function IconSliders() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.75 12.75h1.5a.75.75 0 0 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM12 6a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 6ZM12 18a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 12 18ZM3.75 6.75h1.5a.75.75 0 1 0 0-1.5h-1.5a.75.75 0 0 0 0 1.5ZM5.25 18.75h-1.5a.75.75 0 0 1 0-1.5h1.5a.75.75 0 0 1 0 1.5ZM3 12a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 3 12ZM9 3.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM12.75 12a2.25 2.25 0 1 1 4.5 0 2.25 2.25 0 0 1-4.5 0ZM9 15.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findPalettePresetId(palette: PaletteSettings): string {
  const match = palettePresets.find(
    (p) =>
      p.palette.primary_color === palette.primary_color &&
      p.palette.secondary_color === palette.secondary_color &&
      p.palette.accent_color === palette.accent_color,
  )
  return match?.id ?? 'custom'
}

function createDraftFromTheme(theme: Theme): TemplateDraft {
  return {
    name: theme.name,
    slug: theme.slug,
    description: theme.description,
    is_default: theme.is_default,
    company_name: theme.company_name,
    logo: theme.logo,
    palette: theme.palette,
    markdown_preset: theme.markdown_preset,
    advanced: theme.advanced,
  }
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TemplateStudio({
  initialTheme,
  onSaved,
}: {
  initialTheme: Theme | null
  onSaved: (theme: Theme) => void
}) {
  const isEditMode = initialTheme !== null
  const [draft, setDraft] = useState<TemplateDraft>(() =>
    isEditMode ? createDraftFromTheme(initialTheme) : createInitialDraft(),
  )
  const [submitting, setSubmitting] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(() =>
    isEditMode ? findPalettePresetId(initialTheme.palette) : palettePresets[0].id,
  )
  const [showCustomPalette, setShowCustomPalette] = useState(
    () => isEditMode && findPalettePresetId(initialTheme.palette) === 'custom',
  )

  function updateField<K extends keyof TemplateDraft>(key: K, value: TemplateDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updatePalette<K extends keyof PaletteSettings>(key: K, value: PaletteSettings[K]) {
    setDraft((current) => ({
      ...current,
      palette: { ...current.palette, [key]: value },
    }))
    setSelectedPaletteId('custom')
    setShowCustomPalette(true)
  }

  function updateTypography<K extends keyof AdvancedTemplateSettings['typography']>(
    key: K,
    value: AdvancedTemplateSettings['typography'][K],
  ) {
    setDraft((current) => ({
      ...current,
      advanced: {
        ...current.advanced,
        typography: { ...current.advanced.typography, [key]: value },
      },
    }))
  }

  function updateLayout<K extends keyof AdvancedTemplateSettings['layout']>(
    key: K,
    value: AdvancedTemplateSettings['layout'][K],
  ) {
    setDraft((current) => ({
      ...current,
      advanced: {
        ...current.advanced,
        layout: { ...current.advanced.layout, [key]: value },
      },
    }))
  }

  function updateHeader(
    key: keyof HeaderFooterSettings,
    value: HeaderFooterSettings[keyof HeaderFooterSettings],
  ) {
    setDraft((current) => ({
      ...current,
      advanced: {
        ...current.advanced,
        header: { ...current.advanced.header, [key]: value },
      },
    }))
  }

  function updateFooter(
    key: keyof HeaderFooterSettings,
    value: HeaderFooterSettings[keyof HeaderFooterSettings],
  ) {
    setDraft((current) => ({
      ...current,
      advanced: {
        ...current.advanced,
        footer: { ...current.advanced.footer, [key]: value },
      },
    }))
  }

  function updateHeading(
    level: keyof MarkdownStyles['headings'],
    key: keyof MarkdownStyles['headings']['h1'],
    value: string | number,
  ) {
    setDraft((current) => ({
      ...current,
      advanced: {
        ...current.advanced,
        markdown_styles: {
          ...current.advanced.markdown_styles,
          headings: {
            ...current.advanced.markdown_styles.headings,
            [level]: {
              ...current.advanced.markdown_styles.headings[level],
              [key]: value,
            },
          },
        },
      },
    }))
  }

  function updateMarkdownSection<
    K extends keyof Omit<MarkdownStyles, 'headings'>,
    P extends keyof MarkdownStyles[K],
  >(section: K, key: P, value: MarkdownStyles[K][P]) {
    setDraft((current) => ({
      ...current,
      advanced: {
        ...current.advanced,
        markdown_styles: {
          ...current.advanced.markdown_styles,
          [section]: {
            ...current.advanced.markdown_styles[section],
            [key]: value,
          },
        },
      },
    }))
  }

  function applyPalettePreset(preset: PalettePreset) {
    setDraft((current) => ({
      ...current,
      palette: preset.palette,
      advanced: {
        ...current.advanced,
        markdown_styles: createPresetStyles(
          current.markdown_preset,
          preset.palette,
          current.advanced,
        ),
      },
    }))
    setSelectedPaletteId(preset.id)
    setShowCustomPalette(false)
  }

  function applyMarkdownPreset(preset: MarkdownPreset) {
    setDraft((current) => ({
      ...current,
      markdown_preset: preset,
      advanced: {
        ...current.advanced,
        markdown_styles: createPresetStyles(preset, current.palette, current.advanced),
      },
    }))
  }

  async function handleLogoChange(file: File | null) {
    if (!file) {
      setDraft((current) => ({ ...current, logo: null }))
      return
    }

    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      setError('Logos currently support PNG and JPEG files.')
      return
    }

    try {
      const data = await readFileAsDataUrl(file)
      setDraft((current) => ({
        ...current,
        logo: {
          file_name: file.name,
          mime_type: file.type,
          data,
          width: current.logo?.width ?? 96,
        },
      }))
      setError(null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load the logo')
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      let saved: Theme
      if (isEditMode) {
        const { slug: _slug, ...updateData } = draft
        saved = await updateTheme(initialTheme.slug, updateData)
        setSuccess(`"${saved.name}" updated.`)
      } else {
        saved = await createTheme(draft)
        setSuccess(`"${saved.name}" saved.`)
        setDraft(createInitialDraft())
        setSlugTouched(false)
        setSelectedPaletteId(palettePresets[0].id)
        setShowCustomPalette(false)
      }
      onSaved(saved)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not save the template')
    } finally {
      setSubmitting(false)
    }
  }

  const previewHeader = draft.advanced.header.text || draft.company_name || draft.name
  const previewFooter = draft.advanced.footer.text || draft.company_name || 'Footer text'

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
          Template Studio
        </p>
        <h1 className="mt-2 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-4xl text-slate-950">
          {isEditMode ? `Editing "${initialTheme.name}"` : 'New template'}
        </h1>
        {!isEditMode && (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            Keep the primary decisions simple, and tuck layout, typography, page chrome, and detailed overrides into compact advanced settings.
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <form className="grid gap-4" onSubmit={handleSubmit}>

          {/* ── Brand ──────────────────────────────────────────────── */}
          <CollapsibleSection
            title="Brand"
            subtitle="Name, slug, company identity and logo."
            icon={<IconBrand />}
            defaultOpen
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Template Name">
                <TextInput
                  value={draft.name}
                  onChange={(e) => {
                    const value = e.target.value
                    updateField('name', value)
                    if (!slugTouched) updateField('slug', slugify(value) || 'template')
                  }}
                />
              </Field>
              <Field
                label="Slug"
                hint={
                  isEditMode
                    ? 'Slug is immutable after creation.'
                    : 'Unique key used by the API and PDF generator.'
                }
              >
                <TextInput
                  value={draft.slug}
                  readOnly={isEditMode}
                  className={isEditMode ? 'cursor-default opacity-60' : ''}
                  onChange={(e) => {
                    if (isEditMode) return
                    setSlugTouched(true)
                    updateField('slug', slugify(e.target.value))
                  }}
                />
              </Field>
              <Field label="Company Name">
                <TextInput
                  value={draft.company_name}
                  onChange={(e) => updateField('company_name', e.target.value)}
                />
              </Field>
              <Field label="Description">
                <TextArea
                  value={draft.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </Field>
              <Field
                label="Company Logo"
                hint="PNG or JPEG, stored directly in Mongo as embedded data."
              >
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex h-9 cursor-pointer items-center justify-center rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                      Choose Logo
                      <input
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={(e) => {
                          void handleLogoChange(e.target.files?.[0] ?? null)
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        void handleLogoChange(null)
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                      Remove
                    </button>
                  </div>
                  {draft.logo ? (
                    <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3">
                      <img
                        src={draft.logo.data}
                        alt="Logo preview"
                        className="h-12 w-auto object-contain"
                      />
                      <p className="mt-2 text-xs text-slate-400">{draft.logo.file_name}</p>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-400">
                      Add a logo to reuse the same brand mark in headers and footers.
                    </p>
                  )}
                </div>
              </Field>
              <Field label="Logo Width (px)">
                <TextInput
                  type="number"
                  min={24}
                  max={180}
                  value={draft.logo?.width ?? 96}
                  onChange={(e) =>
                    setDraft((current) => ({
                      ...current,
                      logo: current.logo
                        ? { ...current.logo, width: Number(e.target.value) }
                        : current.logo,
                    }))
                  }
                />
              </Field>
            </div>
          </CollapsibleSection>

          {/* ── Palette ────────────────────────────────────────────── */}
          <CollapsibleSection
            title="Palette"
            subtitle="Colors and visual theme."
            icon={<IconPalette />}
          >
            <div className="grid gap-3 lg:grid-cols-2">
              {palettePresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  selected={selectedPaletteId === preset.id && !showCustomPalette}
                  title={preset.name}
                  description={preset.description}
                  swatches={[
                    preset.palette.primary_color,
                    preset.palette.secondary_color,
                    preset.palette.accent_color,
                    preset.palette.surface_color,
                  ]}
                  onClick={() => applyPalettePreset(preset)}
                />
              ))}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPaletteId('custom')
                  setShowCustomPalette((current) => !current)
                }}
                className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                {showCustomPalette ? 'Hide Custom Palette' : 'Create Custom Palette'}
              </button>
            </div>

            {showCustomPalette && (
              <div className="mt-4 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Primary">
                  <ColorInput
                    value={draft.palette.primary_color}
                    onChange={(v) => updatePalette('primary_color', v)}
                  />
                </Field>
                <Field label="Secondary">
                  <ColorInput
                    value={draft.palette.secondary_color}
                    onChange={(v) => updatePalette('secondary_color', v)}
                  />
                </Field>
                <Field label="Accent">
                  <ColorInput
                    value={draft.palette.accent_color}
                    onChange={(v) => updatePalette('accent_color', v)}
                  />
                </Field>
                <Field label="Background">
                  <ColorInput
                    value={draft.palette.background_color}
                    onChange={(v) => updatePalette('background_color', v)}
                  />
                </Field>
                <Field label="Surface">
                  <ColorInput
                    value={draft.palette.surface_color}
                    onChange={(v) => updatePalette('surface_color', v)}
                  />
                </Field>
                <Field label="Muted">
                  <ColorInput
                    value={draft.palette.muted_color}
                    onChange={(v) => updatePalette('muted_color', v)}
                  />
                </Field>
              </div>
            )}
          </CollapsibleSection>

          {/* ── Markdown Presets ───────────────────────────────────── */}
          <CollapsibleSection
            title="Markdown Presets"
            subtitle="Typography style across all markdown elements."
            icon={<IconText />}
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <PresetCard
                selected={draft.markdown_preset === 'enterprise'}
                title="Enterprise"
                description="Balanced spacing, clear hierarchy, and strong table headers."
                swatches={[
                  draft.palette.primary_color,
                  draft.palette.secondary_color,
                  draft.palette.surface_color,
                  draft.palette.muted_color,
                ]}
                onClick={() => applyMarkdownPreset('enterprise')}
              />
              <PresetCard
                selected={draft.markdown_preset === 'executive'}
                title="Executive"
                description="More generous spacing and stronger emphasis for polished summaries."
                swatches={[
                  draft.palette.primary_color,
                  draft.palette.accent_color,
                  draft.palette.surface_color,
                  '#FFFFFF',
                ]}
                onClick={() => applyMarkdownPreset('executive')}
              />
              <PresetCard
                selected={draft.markdown_preset === 'minimal'}
                title="Minimal"
                description="Quiet surfaces and lighter framing for restrained documents."
                swatches={[
                  draft.palette.primary_color,
                  draft.palette.secondary_color,
                  '#FFFFFF',
                  draft.palette.muted_color,
                ]}
                onClick={() => applyMarkdownPreset('minimal')}
              />
              <PresetCard
                selected={draft.markdown_preset === 'smooth'}
                title="Smooth"
                description="Soft panels and gentler spacing for more modern report blocks."
                swatches={[
                  draft.palette.primary_color,
                  draft.palette.accent_color,
                  draft.palette.surface_color,
                  '#FFFFFF',
                ]}
                onClick={() => applyMarkdownPreset('smooth')}
              />
            </div>
          </CollapsibleSection>

          {/* ── Advanced ───────────────────────────────────────────── */}
          <CollapsibleSection
            title="Advanced"
            subtitle="Typography, layout, page chrome, and markdown overrides."
            icon={<IconSliders />}
          >
            {/* Typography & Layout */}
            <p className="mb-4 text-sm font-medium text-slate-700">Typography &amp; Layout</p>
            <div className="grid gap-4">
              <div className="grid gap-4 rounded-xl bg-slate-50 p-4 sm:grid-cols-2">
                <Field label="Font Family">
                  <Select
                    value={draft.advanced.typography.font_family}
                    onChange={(e) => updateTypography('font_family', e.target.value)}
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font}>
                        {font}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Page Size">
                  <Select
                    value={draft.advanced.layout.page_size}
                    onChange={(e) => updateLayout('page_size', e.target.value)}
                  >
                    <option value="A4">A4</option>
                    <option value="LETTER">Letter</option>
                  </Select>
                </Field>
                <Field label="Body Font Size">
                  <TextInput
                    type="number"
                    min={9}
                    max={16}
                    value={draft.advanced.typography.font_size_body}
                    onChange={(e) =>
                      updateTypography('font_size_body', Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Heading Font Size">
                  <TextInput
                    type="number"
                    min={16}
                    max={32}
                    value={draft.advanced.typography.font_size_heading}
                    onChange={(e) =>
                      updateTypography('font_size_heading', Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Line Spacing">
                  <TextInput
                    type="number"
                    step="0.05"
                    min={1}
                    max={1.8}
                    value={draft.advanced.typography.line_spacing}
                    onChange={(e) =>
                      updateTypography('line_spacing', Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Columns">
                  <TextInput
                    type="number"
                    min={1}
                    max={2}
                    value={draft.advanced.layout.columns}
                    onChange={(e) => updateLayout('columns', Number(e.target.value))}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4">
                <Field label="Top Margin">
                  <TextInput
                    type="number"
                    min={36}
                    max={144}
                    value={draft.advanced.layout.margin_top}
                    onChange={(e) => updateLayout('margin_top', Number(e.target.value))}
                  />
                </Field>
                <Field label="Bottom Margin">
                  <TextInput
                    type="number"
                    min={36}
                    max={144}
                    value={draft.advanced.layout.margin_bottom}
                    onChange={(e) => updateLayout('margin_bottom', Number(e.target.value))}
                  />
                </Field>
                <Field label="Left Margin">
                  <TextInput
                    type="number"
                    min={36}
                    max={144}
                    value={draft.advanced.layout.margin_left}
                    onChange={(e) => updateLayout('margin_left', Number(e.target.value))}
                  />
                </Field>
                <Field label="Right Margin">
                  <TextInput
                    type="number"
                    min={36}
                    max={144}
                    value={draft.advanced.layout.margin_right}
                    onChange={(e) => updateLayout('margin_right', Number(e.target.value))}
                  />
                </Field>
              </div>
            </div>

            {/* Page Chrome */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="mb-4 text-sm font-medium text-slate-700">Page Chrome</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Header
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Enabled">
                      <Toggle
                        checked={draft.advanced.header.enabled}
                        onChange={(next) => updateHeader('enabled', next)}
                        label="Show header"
                      />
                    </Field>
                    <Field label="Alignment">
                      <Select
                        value={draft.advanced.header.align}
                        onChange={(e) => updateHeader('align', e.target.value as Alignment)}
                      >
                        {alignOptions.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Header Text">
                      <TextInput
                        value={draft.advanced.header.text ?? ''}
                        onChange={(e) => updateHeader('text', e.target.value || null)}
                      />
                    </Field>
                    <Field label="Logo in Header">
                      <Toggle
                        checked={draft.advanced.header.show_logo}
                        onChange={(next) => updateHeader('show_logo', next)}
                        label="Render logo"
                      />
                    </Field>
                    <Field label="Divider">
                      <Toggle
                        checked={draft.advanced.header.divider}
                        onChange={(next) => updateHeader('divider', next)}
                        label="Draw divider"
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Footer
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Enabled">
                      <Toggle
                        checked={draft.advanced.footer.enabled}
                        onChange={(next) => updateFooter('enabled', next)}
                        label="Show footer"
                      />
                    </Field>
                    <Field label="Alignment">
                      <Select
                        value={draft.advanced.footer.align}
                        onChange={(e) => updateFooter('align', e.target.value as Alignment)}
                      >
                        {alignOptions.map((value) => (
                          <option key={value} value={value}>
                            {value}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Footer Text">
                      <TextInput
                        value={draft.advanced.footer.text ?? ''}
                        onChange={(e) => updateFooter('text', e.target.value || null)}
                      />
                    </Field>
                    <Field label="Logo in Footer">
                      <Toggle
                        checked={draft.advanced.footer.show_logo}
                        onChange={(next) => updateFooter('show_logo', next)}
                        label="Render logo"
                      />
                    </Field>
                    <Field label="Divider">
                      <Toggle
                        checked={draft.advanced.footer.divider}
                        onChange={(next) => updateFooter('divider', next)}
                        label="Draw divider"
                      />
                    </Field>
                    <Field label="Page Numbers">
                      <Toggle
                        checked={draft.advanced.footer.show_page_numbers}
                        onChange={(next) => updateFooter('show_page_numbers', next)}
                        label="Show page numbers"
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            {/* Markdown Overrides */}
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="mb-4 text-sm font-medium text-slate-700">Markdown Overrides</p>

              <div className="grid gap-4 lg:grid-cols-2">
                {(['h1', 'h2', 'h3', 'h4'] as const).map((level) => (
                  <div key={level} className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {level.toUpperCase()}
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Color">
                        <ColorInput
                          value={
                            draft.advanced.markdown_styles.headings[level].color ?? '#000000'
                          }
                          onChange={(v) => updateHeading(level, 'color', v)}
                        />
                      </Field>
                      <Field label="Font Size">
                        <TextInput
                          type="number"
                          value={
                            draft.advanced.markdown_styles.headings[level].font_size ?? 0
                          }
                          onChange={(e) =>
                            updateHeading(level, 'font_size', Number(e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Space Before">
                        <TextInput
                          type="number"
                          value={
                            draft.advanced.markdown_styles.headings[level].space_before ?? 0
                          }
                          onChange={(e) =>
                            updateHeading(level, 'space_before', Number(e.target.value))
                          }
                        />
                      </Field>
                      <Field label="Space After">
                        <TextInput
                          type="number"
                          value={
                            draft.advanced.markdown_styles.headings[level].space_after ?? 0
                          }
                          onChange={(e) =>
                            updateHeading(level, 'space_after', Number(e.target.value))
                          }
                        />
                      </Field>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Body &amp; Lists
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Body Color">
                      <ColorInput
                        value={draft.advanced.markdown_styles.body.color ?? '#000000'}
                        onChange={(v) => updateMarkdownSection('body', 'color', v)}
                      />
                    </Field>
                    <Field label="Body Font Size">
                      <TextInput
                        type="number"
                        value={draft.advanced.markdown_styles.body.font_size ?? 0}
                        onChange={(e) =>
                          updateMarkdownSection('body', 'font_size', Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Paragraph Spacing">
                      <TextInput
                        type="number"
                        value={draft.advanced.markdown_styles.body.space_after ?? 0}
                        onChange={(e) =>
                          updateMarkdownSection('body', 'space_after', Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Bullet Color">
                      <ColorInput
                        value={draft.advanced.markdown_styles.lists.bullet_color ?? '#000000'}
                        onChange={(v) => updateMarkdownSection('lists', 'bullet_color', v)}
                      />
                    </Field>
                    <Field label="List Text Color">
                      <ColorInput
                        value={draft.advanced.markdown_styles.lists.text_color ?? '#000000'}
                        onChange={(v) => updateMarkdownSection('lists', 'text_color', v)}
                      />
                    </Field>
                    <Field label="Item Spacing">
                      <TextInput
                        type="number"
                        value={draft.advanced.markdown_styles.lists.item_spacing ?? 0}
                        onChange={(e) =>
                          updateMarkdownSection('lists', 'item_spacing', Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Blockquotes &amp; Code
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Quote Border">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.blockquotes.border_color ?? '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('blockquotes', 'border_color', v)
                        }
                      />
                    </Field>
                    <Field label="Quote Surface">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.blockquotes.background_color ?? '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('blockquotes', 'background_color', v)
                        }
                      />
                    </Field>
                    <Field label="Quote Padding">
                      <TextInput
                        type="number"
                        value={draft.advanced.markdown_styles.blockquotes.padding ?? 0}
                        onChange={(e) =>
                          updateMarkdownSection('blockquotes', 'padding', Number(e.target.value))
                        }
                      />
                    </Field>
                    <Field label="Code Surface">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.code.background_color ?? '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('code', 'background_color', v)
                        }
                      />
                    </Field>
                    <Field label="Code Border">
                      <ColorInput
                        value={draft.advanced.markdown_styles.code.border_color ?? '#000000'}
                        onChange={(v) => updateMarkdownSection('code', 'border_color', v)}
                      />
                    </Field>
                    <Field label="Code Padding">
                      <TextInput
                        type="number"
                        value={draft.advanced.markdown_styles.code.padding ?? 0}
                        onChange={(e) =>
                          updateMarkdownSection('code', 'padding', Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Rules
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Rule Color">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.horizontal_rules.color ?? '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('horizontal_rules', 'color', v)
                        }
                      />
                    </Field>
                    <Field label="Thickness">
                      <TextInput
                        type="number"
                        step="0.1"
                        value={draft.advanced.markdown_styles.horizontal_rules.thickness ?? 0}
                        onChange={(e) =>
                          updateMarkdownSection(
                            'horizontal_rules',
                            'thickness',
                            Number(e.target.value),
                          )
                        }
                      />
                    </Field>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Tables
                  </p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Header Background">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.tables.header_background_color ??
                          '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('tables', 'header_background_color', v)
                        }
                      />
                    </Field>
                    <Field label="Header Text">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.tables.header_text_color ?? '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('tables', 'header_text_color', v)
                        }
                      />
                    </Field>
                    <Field label="Row Background">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.tables.row_background_color ?? '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('tables', 'row_background_color', v)
                        }
                      />
                    </Field>
                    <Field label="Alternate Row">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.tables.alternate_row_background_color ??
                          '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('tables', 'alternate_row_background_color', v)
                        }
                      />
                    </Field>
                    <Field label="Border Color">
                      <ColorInput
                        value={
                          draft.advanced.markdown_styles.tables.border_color ?? '#000000'
                        }
                        onChange={(v) =>
                          updateMarkdownSection('tables', 'border_color', v)
                        }
                      />
                    </Field>
                    <Field label="Cell Padding">
                      <TextInput
                        type="number"
                        value={draft.advanced.markdown_styles.tables.cell_padding ?? 0}
                        onChange={(e) =>
                          updateMarkdownSection('tables', 'cell_padding', Number(e.target.value))
                        }
                      />
                    </Field>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* ── Actions ────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-9 items-center justify-center rounded-xl bg-sky-500 px-5 text-sm font-medium text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting
                ? isEditMode
                  ? 'Updating…'
                  : 'Saving…'
                : isEditMode
                  ? 'Update Template'
                  : 'Save Template'}
            </button>
            {!isEditMode && (
              <button
                type="button"
                onClick={() => {
                  setDraft(createInitialDraft())
                  setSlugTouched(false)
                  setSuccess(null)
                  setError(null)
                  setSelectedPaletteId(palettePresets[0].id)
                  setShowCustomPalette(false)
                }}
                className="inline-flex h-9 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                Reset
              </button>
            )}
          </div>
        </form>

        {/* ── Live Preview ───────────────────────────────────────── */}
        <aside className="grid gap-4">
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div
              className="overflow-hidden rounded-xl border border-slate-200"
              style={{
                backgroundColor: draft.palette.background_color,
                color: draft.palette.secondary_color,
              }}
            >
              <div
                className="border-b px-6 py-4"
                style={{ borderColor: draft.palette.muted_color }}
              >
                {draft.advanced.header.enabled && (
                  <div className="flex items-center gap-3">
                    {draft.advanced.header.show_logo && draft.logo && (
                      <img
                        src={draft.logo.data}
                        alt="Header logo"
                        className="h-10 w-auto object-contain"
                      />
                    )}
                    <div>
                      <p
                        className="text-xs uppercase tracking-[0.24em]"
                        style={{ color: draft.palette.accent_color }}
                      >
                        Live Preview
                      </p>
                      <p className="text-sm" style={{ color: draft.palette.secondary_color }}>
                        {previewHeader}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 px-6 py-6">
                <h1
                  style={{
                    color:
                      draft.advanced.markdown_styles.headings.h1.color ??
                      draft.palette.primary_color,
                    fontSize: `${
                      draft.advanced.markdown_styles.headings.h1.font_size ??
                      draft.advanced.typography.font_size_heading
                    }px`,
                    fontFamily: draft.advanced.typography.font_family,
                  }}
                >
                  Executive Summary
                </h1>
                <p
                  style={{
                    color:
                      draft.advanced.markdown_styles.body.color ?? draft.palette.secondary_color,
                    fontSize: `${
                      draft.advanced.markdown_styles.body.font_size ??
                      draft.advanced.typography.font_size_body
                    }px`,
                    lineHeight: draft.advanced.typography.line_spacing,
                    fontFamily: draft.advanced.typography.font_family,
                  }}
                >
                  This preview shows how your saved template will present headings, body copy,
                  tables, and branded page chrome inside generated PDFs.
                </p>
                <ul
                  className="space-y-2 pl-5"
                  style={{
                    color:
                      draft.advanced.markdown_styles.lists.text_color ??
                      draft.palette.secondary_color,
                    fontSize: `${
                      draft.advanced.markdown_styles.body.font_size ??
                      draft.advanced.typography.font_size_body
                    }px`,
                  }}
                >
                  <li>
                    <span
                      style={{
                        color:
                          draft.advanced.markdown_styles.lists.bullet_color ??
                          draft.palette.primary_color,
                      }}
                    >
                      •
                    </span>{' '}
                    Consistent report palette
                  </li>
                  <li>
                    <span
                      style={{
                        color:
                          draft.advanced.markdown_styles.lists.bullet_color ??
                          draft.palette.primary_color,
                      }}
                    >
                      •
                    </span>{' '}
                    Reusable headers, footers, and soft content blocks
                  </li>
                </ul>
                <blockquote
                  className="rounded-xl border-l-4 px-4 py-3"
                  style={{
                    borderColor:
                      draft.advanced.markdown_styles.blockquotes.border_color ??
                      draft.palette.muted_color,
                    backgroundColor:
                      draft.advanced.markdown_styles.blockquotes.background_color ??
                      draft.palette.surface_color,
                    color:
                      draft.advanced.markdown_styles.blockquotes.text_color ??
                      draft.palette.secondary_color,
                  }}
                >
                  Keep the visual language stable across every client-facing document.
                </blockquote>
                <pre
                  className="overflow-x-auto rounded-xl border px-4 py-3 text-sm"
                  style={{
                    borderColor:
                      draft.advanced.markdown_styles.code.border_color ??
                      draft.palette.muted_color,
                    backgroundColor:
                      draft.advanced.markdown_styles.code.background_color ??
                      draft.palette.surface_color,
                    color: draft.advanced.markdown_styles.code.text_color ?? '#0F172A',
                  }}
                >
                  <code>{`## Sample metric\nrevenue_growth = 14.2`}</code>
                </pre>
                <hr
                  style={{
                    borderColor:
                      draft.advanced.markdown_styles.horizontal_rules.color ??
                      draft.palette.muted_color,
                    borderTopWidth: `${
                      draft.advanced.markdown_styles.horizontal_rules.thickness ?? 1
                    }px`,
                  }}
                />
                <div
                  className="overflow-hidden rounded-xl border"
                  style={{
                    borderColor:
                      draft.advanced.markdown_styles.tables.border_color ??
                      draft.palette.muted_color,
                  }}
                >
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr
                        style={{
                          backgroundColor:
                            draft.advanced.markdown_styles.tables.header_background_color ??
                            draft.palette.primary_color,
                          color:
                            draft.advanced.markdown_styles.tables.header_text_color ?? '#FFFFFF',
                        }}
                      >
                        <th className="px-3 py-2 text-left font-semibold">Metric</th>
                        <th className="px-3 py-2 text-left font-semibold">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        style={{
                          backgroundColor:
                            draft.advanced.markdown_styles.tables.row_background_color ??
                            '#FFFFFF',
                        }}
                      >
                        <td className="px-3 py-2">NPS</td>
                        <td className="px-3 py-2">62</td>
                      </tr>
                      <tr
                        style={{
                          backgroundColor:
                            draft.advanced.markdown_styles.tables.alternate_row_background_color ??
                            draft.palette.surface_color,
                        }}
                      >
                        <td className="px-3 py-2">Renewal rate</td>
                        <td className="px-3 py-2">91%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div
                className="border-t px-6 py-4 text-sm"
                style={{ borderColor: draft.palette.muted_color }}
              >
                {draft.advanced.footer.enabled && (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {draft.advanced.footer.show_logo && draft.logo && (
                        <img
                          src={draft.logo.data}
                          alt="Footer logo"
                          className="h-8 w-auto object-contain"
                        />
                      )}
                      <span>{previewFooter}</span>
                    </div>
                    {draft.advanced.footer.show_page_numbers && <span>Page 1</span>}
                  </div>
                )}
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
