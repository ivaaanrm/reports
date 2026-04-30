import type {
  FormEvent,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react'
import { useEffect, useState } from 'react'
import { createTheme, listThemes } from '../api/client'
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

function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string
  subtitle: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-[28px] border border-slate-200/80 bg-white/90 shadow-[0_18px_60px_rgba(15,23,42,0.08)] backdrop-blur"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
        <div>
          <h2 className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-xl text-slate-900">
            {title}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 transition group-open:rotate-0">
          Toggle
        </span>
      </summary>
      <div className="border-t border-slate-100 px-6 py-6">{children}</div>
    </details>
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
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="text-xs text-slate-400">{hint}</span>}
    </label>
  )
}

function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-sky-100 ${
        props.className ?? ''
      }`}
    />
  )
}

function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`min-h-[110px] rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-sky-100 ${
        props.className ?? ''
      }`}
    />
  )
}

function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-11 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-4 focus:ring-sky-100 ${
        props.className ?? ''
      }`}
    />
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
      onClick={() => onChange(!checked)}
      className={`flex h-11 items-center justify-between rounded-2xl border px-4 text-sm transition ${
        checked
          ? 'border-sky-200 bg-sky-50 text-sky-800'
          : 'border-slate-200 bg-slate-50 text-slate-500'
      }`}
    >
      <span>{label}</span>
      <span className={`h-6 w-11 rounded-full p-1 ${checked ? 'bg-sky-500' : 'bg-slate-300'}`}>
        <span
          className={`block h-4 w-4 rounded-full bg-white transition ${
            checked ? 'translate-x-5' : 'translate-x-0'
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
      className={`rounded-[24px] border p-4 text-left transition ${
        selected
          ? 'border-sky-400 bg-sky-50 shadow-[0_12px_28px_rgba(14,165,233,0.12)]'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
      }`}
    >
      <div className="flex gap-2">
        {swatches.map((swatch) => (
          <span
            key={swatch}
            className="h-8 w-8 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-800">{title}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </button>
  )
}

export default function TemplateStudio({ onCreated }: { onCreated: (theme: Theme) => void }) {
  const [draft, setDraft] = useState<TemplateDraft>(() => createInitialDraft())
  const [templates, setTemplates] = useState<Theme[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [slugTouched, setSlugTouched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(palettePresets[0].id)
  const [showCustomPalette, setShowCustomPalette] = useState(false)

  useEffect(() => {
    void refreshTemplates()
  }, [])

  async function refreshTemplates() {
    setLoadingTemplates(true)
    try {
      setTemplates(await listThemes())
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not load templates')
    } finally {
      setLoadingTemplates(false)
    }
  }

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
      const created = await createTheme(draft)
      onCreated(created)
      setSuccess(`Template "${created.name}" is saved and ready to use in Generate Reports.`)
      setDraft(createInitialDraft())
      setSlugTouched(false)
      setSelectedPaletteId(palettePresets[0].id)
      setShowCustomPalette(false)
      await refreshTemplates()
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
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-700">
            Template Studio
          </p>
          <h1 className="mt-2 font-['Iowan_Old_Style','Palatino_Linotype',serif] text-4xl text-slate-950">
            Build a reusable enterprise report template
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-500">
            Keep the primary decisions simple, and tuck layout, typography, page chrome, and detailed overrides into compact advanced settings.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">
        <form className="grid gap-6" onSubmit={handleSubmit}>
          <CollapsibleSection
            title="Brand"
            subtitle="Core identity for the template. This section starts open."
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
              <Field label="Slug" hint="Unique key used by the API and PDF generator.">
                <TextInput
                  value={draft.slug}
                  onChange={(e) => {
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
                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <label className="inline-flex h-11 cursor-pointer items-center justify-center rounded-2xl bg-slate-900 px-5 text-sm font-medium text-white transition hover:bg-slate-800">
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
                      className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 px-5 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-white"
                    >
                      Remove Logo
                    </button>
                  </div>
                  {draft.logo ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                      <img
                        src={draft.logo.data}
                        alt="Logo preview"
                        className="h-16 w-auto object-contain"
                      />
                      <p className="mt-3 text-xs text-slate-400">{draft.logo.file_name}</p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-400">
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

          <CollapsibleSection
            title="Palette"
            subtitle="Choose from ready-made palettes or open custom editing for a personalized one."
          >
            <div className="grid gap-4 lg:grid-cols-2">
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

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedPaletteId('custom')
                  setShowCustomPalette((current) => !current)
                }}
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
              >
                {showCustomPalette ? 'Hide Personalized Palette' : 'Create Personalized Palette'}
              </button>
            </div>

            {showCustomPalette && (
              <div className="mt-5 grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-3">
                <Field label="Primary Color">
                  <TextInput
                    type="color"
                    value={draft.palette.primary_color}
                    onChange={(e) => updatePalette('primary_color', e.target.value)}
                  />
                </Field>
                <Field label="Secondary Color">
                  <TextInput
                    type="color"
                    value={draft.palette.secondary_color}
                    onChange={(e) => updatePalette('secondary_color', e.target.value)}
                  />
                </Field>
                <Field label="Accent Color">
                  <TextInput
                    type="color"
                    value={draft.palette.accent_color}
                    onChange={(e) => updatePalette('accent_color', e.target.value)}
                  />
                </Field>
                <Field label="Background Color">
                  <TextInput
                    type="color"
                    value={draft.palette.background_color}
                    onChange={(e) => updatePalette('background_color', e.target.value)}
                  />
                </Field>
                <Field label="Surface Color">
                  <TextInput
                    type="color"
                    value={draft.palette.surface_color}
                    onChange={(e) => updatePalette('surface_color', e.target.value)}
                  />
                </Field>
                <Field label="Muted Color">
                  <TextInput
                    type="color"
                    value={draft.palette.muted_color}
                    onChange={(e) => updatePalette('muted_color', e.target.value)}
                  />
                </Field>
              </div>
            )}
          </CollapsibleSection>

          <CollapsibleSection
            title="Markdown Components Presets"
            subtitle="Choose the overall markdown styling direction. Fine-tuning lives in Advanced Configurations."
          >
            <div className="grid gap-4 md:grid-cols-3">
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
            </div>
          </CollapsibleSection>

          <CollapsibleSection
            title="Advanced Configurations"
            subtitle="Typography, layout, page chrome, and detailed markdown overrides are grouped here."
          >
            <div className="grid gap-6">
              <div className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-2">
                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Typography & Layout
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2">
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
                        onChange={(e) =>
                          updateLayout('margin_bottom', Number(e.target.value))
                        }
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

                <div>
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                    Page Chrome
                  </h3>
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h4 className="mb-3 text-sm font-semibold text-slate-700">Header</h4>
                      <div className="grid gap-3 md:grid-cols-2">
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

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h4 className="mb-3 text-sm font-semibold text-slate-700">Footer</h4>
                      <div className="grid gap-3 md:grid-cols-2">
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
              </div>

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Detailed Markdown Overrides
                </h3>
                <div className="grid gap-4 lg:grid-cols-2">
                  {(['h1', 'h2', 'h3', 'h4'] as const).map((level) => (
                    <div key={level} className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h4 className="mb-3 text-sm font-semibold text-slate-700">
                        {level.toUpperCase()}
                      </h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Color">
                          <TextInput
                            type="color"
                            value={
                              draft.advanced.markdown_styles.headings[level].color ?? '#000000'
                            }
                            onChange={(e) => updateHeading(level, 'color', e.target.value)}
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
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">Body & Lists</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Body Color">
                        <TextInput
                          type="color"
                          value={draft.advanced.markdown_styles.body.color ?? '#000000'}
                          onChange={(e) =>
                            updateMarkdownSection('body', 'color', e.target.value)
                          }
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
                      <Field label="List Bullet Color">
                        <TextInput
                          type="color"
                          value={draft.advanced.markdown_styles.lists.bullet_color ?? '#000000'}
                          onChange={(e) =>
                            updateMarkdownSection('lists', 'bullet_color', e.target.value)
                          }
                        />
                      </Field>
                      <Field label="List Text Color">
                        <TextInput
                          type="color"
                          value={draft.advanced.markdown_styles.lists.text_color ?? '#000000'}
                          onChange={(e) =>
                            updateMarkdownSection('lists', 'text_color', e.target.value)
                          }
                        />
                      </Field>
                      <Field label="List Item Spacing">
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

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">
                      Blockquotes & Code
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Quote Border">
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.blockquotes.border_color ?? '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection('blockquotes', 'border_color', e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Quote Surface">
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.blockquotes.background_color ??
                            '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection(
                              'blockquotes',
                              'background_color',
                              e.target.value,
                            )
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
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.code.background_color ?? '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection('code', 'background_color', e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Code Border">
                        <TextInput
                          type="color"
                          value={draft.advanced.markdown_styles.code.border_color ?? '#000000'}
                          onChange={(e) =>
                            updateMarkdownSection('code', 'border_color', e.target.value)
                          }
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

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">Rules</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Rule Color">
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.horizontal_rules.color ?? '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection(
                              'horizontal_rules',
                              'color',
                              e.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Rule Thickness">
                        <TextInput
                          type="number"
                          step="0.1"
                          value={
                            draft.advanced.markdown_styles.horizontal_rules.thickness ?? 0
                          }
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

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <h4 className="mb-3 text-sm font-semibold text-slate-700">Tables</h4>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <Field label="Header Background">
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.tables.header_background_color ??
                            '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection(
                              'tables',
                              'header_background_color',
                              e.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Header Text">
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.tables.header_text_color ?? '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection(
                              'tables',
                              'header_text_color',
                              e.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Row Background">
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.tables.row_background_color ??
                            '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection(
                              'tables',
                              'row_background_color',
                              e.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Alternate Row Background">
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.tables
                              .alternate_row_background_color ?? '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection(
                              'tables',
                              'alternate_row_background_color',
                              e.target.value,
                            )
                          }
                        />
                      </Field>
                      <Field label="Border Color">
                        <TextInput
                          type="color"
                          value={
                            draft.advanced.markdown_styles.tables.border_color ?? '#000000'
                          }
                          onChange={(e) =>
                            updateMarkdownSection('tables', 'border_color', e.target.value)
                          }
                        />
                      </Field>
                      <Field label="Cell Padding">
                        <TextInput
                          type="number"
                          value={draft.advanced.markdown_styles.tables.cell_padding ?? 0}
                          onChange={(e) =>
                            updateMarkdownSection(
                              'tables',
                              'cell_padding',
                              Number(e.target.value),
                            )
                          }
                        />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Saving template…' : 'Save Template'}
            </button>
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
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-300 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Reset
            </button>
          </div>
        </form>

        <aside className="grid gap-6">
          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div
              className="overflow-hidden rounded-[28px] border border-slate-200 shadow-inner"
              style={{
                backgroundColor: draft.palette.background_color,
                color: draft.palette.secondary_color,
              }}
            >
              <div className="border-b px-6 py-4" style={{ borderColor: draft.palette.muted_color }}>
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
                      draft.advanced.markdown_styles.body.color ??
                      draft.palette.secondary_color,
                    fontSize: `${
                      draft.advanced.markdown_styles.body.font_size ??
                      draft.advanced.typography.font_size_body
                    }px`,
                    lineHeight: draft.advanced.typography.line_spacing,
                    fontFamily: draft.advanced.typography.font_family,
                  }}
                >
                  This preview shows how your saved template will present headings, body copy, tables, and branded page chrome inside generated PDFs.
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
                    Consistent enterprise palette
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
                    Reusable headers and footers
                  </li>
                </ul>
                <blockquote
                  className="rounded-2xl border-l-4 px-4 py-3"
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
                  className="overflow-x-auto rounded-2xl border px-4 py-3 text-sm"
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
                  className="overflow-hidden rounded-2xl border"
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
                            draft.advanced.markdown_styles.tables
                              .alternate_row_background_color ??
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

              <div className="border-t px-6 py-4 text-sm" style={{ borderColor: draft.palette.muted_color }}>
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

          <section className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-['Iowan_Old_Style','Palatino_Linotype',serif] text-2xl text-slate-900">
                  Saved Templates
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Your template library updates as soon as you save.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {templates.length}
              </span>
            </div>

            <div className="mt-4 grid gap-3">
              {loadingTemplates ? (
                <p className="text-sm text-slate-400">Loading templates…</p>
              ) : templates.length ? (
                templates.map((template) => (
                  <div
                    key={template.slug}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-4 w-4 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: template.palette.primary_color }}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {template.name}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {template.company_name || template.slug}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400">No templates saved yet.</p>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
