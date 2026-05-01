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

type StylePreset = {
  id: MarkdownPreset
  name: string
  description: string
  palette: PaletteSettings
  company_name: string
  template_name: string
  template_slug: string
  template_description: string
  is_default: boolean
  typography: AdvancedTemplateSettings['typography']
  layout: AdvancedTemplateSettings['layout']
  header: HeaderFooterSettings
  footer: HeaderFooterSettings
}

type ColorPalette = {
  id: 'ocean' | 'midnight' | 'steel' | 'ember'
  name: string
  description: string
  palette: PaletteSettings
}

type VisualStyle = {
  id: 'modern' | 'professional' | 'expressive'
  name: string
  description: string
  font_family: string
  markdown_preset: MarkdownPreset
  line_spacing: number
  font_size_heading: number
}

const fontOptions = ['Helvetica', 'Times-Roman', 'Courier']
const alignOptions: Alignment[] = ['left', 'center', 'right']

const stylePresets: StylePreset[] = [
  {
    id: 'default-light',
    name: 'Default Light',
    description: 'The standard light report style with soft panels and calm spacing.',
    palette: {
      primary_color: '#173B63',
      secondary_color: '#4B5B6A',
      accent_color: '#1E847F',
      background_color: '#F6F8FC',
      surface_color: '#EAF0F6',
      muted_color: '#C9D5E3',
    },
    company_name: 'Northwind Advisory',
    template_name: 'Default Light',
    template_slug: 'default-light',
    template_description: 'The standard light report style with soft surfaces and calm rhythm.',
    is_default: true,
    typography: {
      font_family: 'Helvetica',
      font_size_body: 11,
      font_size_heading: 22,
      line_spacing: 1.42,
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
      text: 'Default Light',
      align: 'left',
      show_logo: false,
      divider: false,
      show_page_numbers: false,
    },
    footer: {
      enabled: true,
      text: 'Northwind Advisory',
      align: 'right',
      show_logo: false,
      divider: false,
      show_page_numbers: true,
    },
  },
  {
    id: 'default-dark',
    name: 'Default Dark',
    description: 'The standard dark report style with high contrast and smooth blocks.',
    palette: {
      primary_color: '#E6EEF8',
      secondary_color: '#B8C7D9',
      accent_color: '#4FD1C5',
      background_color: '#0F1724',
      surface_color: '#162131',
      muted_color: '#2E415A',
    },
    company_name: 'Northwind Advisory',
    template_name: 'Default Dark',
    template_slug: 'default-dark',
    template_description: 'The standard dark report style with high contrast and smooth panels.',
    is_default: false,
    typography: {
      font_family: 'Helvetica',
      font_size_body: 11,
      font_size_heading: 22,
      line_spacing: 1.42,
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
      text: 'Default Dark',
      align: 'left',
      show_logo: false,
      divider: false,
      show_page_numbers: false,
    },
    footer: {
      enabled: true,
      text: 'Northwind Advisory',
      align: 'right',
      show_logo: false,
      divider: false,
      show_page_numbers: true,
    },
  },
  {
    id: 'modern-corporate',
    name: 'Modern Corporate',
    description: 'Sharper hierarchy, restrained surfaces, and a polished business tone.',
    palette: {
      primary_color: '#0F2942',
      secondary_color: '#4A5A67',
      accent_color: '#2E6A8E',
      background_color: '#F3F6F9',
      surface_color: '#FFFFFF',
      muted_color: '#D6E0E8',
    },
    company_name: 'Atlas Strategy Group',
    template_name: 'Modern Corporate',
    template_slug: 'modern-corporate',
    template_description: 'A sharper corporate style with crisp hierarchy and restrained surfaces.',
    is_default: false,
    typography: {
      font_family: 'Helvetica',
      font_size_body: 11,
      font_size_heading: 22,
      line_spacing: 1.34,
    },
    layout: {
      page_size: 'A4',
      margin_top: 78,
      margin_bottom: 68,
      margin_left: 72,
      margin_right: 72,
      columns: 1,
    },
    header: {
      enabled: true,
      text: 'Modern Corporate',
      align: 'left',
      show_logo: false,
      divider: false,
      show_page_numbers: false,
    },
    footer: {
      enabled: true,
      text: 'Atlas Strategy Group',
      align: 'right',
      show_logo: false,
      divider: true,
      show_page_numbers: true,
    },
  },
  {
    id: 'creative-studio',
    name: 'Creative Studio',
    description: 'Warmer contrast, bolder callouts, and a more expressive layout feel.',
    palette: {
      primary_color: '#6B2C91',
      secondary_color: '#4F435B',
      accent_color: '#F97360',
      background_color: '#FFF8F4',
      surface_color: '#F8E7DE',
      muted_color: '#E8C9BC',
    },
    company_name: 'Lumen Creative Lab',
    template_name: 'Creative Studio',
    template_slug: 'creative-studio',
    template_description: 'A more expressive preset with warmer contrast and bolder feature blocks.',
    is_default: false,
    typography: {
      font_family: 'Helvetica',
      font_size_body: 11,
      font_size_heading: 24,
      line_spacing: 1.48,
    },
    layout: {
      page_size: 'A4',
      margin_top: 86,
      margin_bottom: 72,
      margin_left: 72,
      margin_right: 72,
      columns: 1,
    },
    header: {
      enabled: true,
      text: 'Creative Studio',
      align: 'left',
      show_logo: false,
      divider: false,
      show_page_numbers: false,
    },
    footer: {
      enabled: true,
      text: 'Lumen Creative Lab',
      align: 'right',
      show_logo: false,
      divider: false,
      show_page_numbers: true,
    },
  },
]

const colorPalettes: ColorPalette[] = [
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Blues and teal on a light background — calm and professional.',
    palette: {
      primary_color: '#173B63',
      secondary_color: '#4B5B6A',
      accent_color: '#1E847F',
      background_color: '#F6F8FC',
      surface_color: '#EAF0F6',
      muted_color: '#C9D5E3',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Dark navy background with cool teal highlights — bold contrast.',
    palette: {
      primary_color: '#E6EEF8',
      secondary_color: '#B8C7D9',
      accent_color: '#4FD1C5',
      background_color: '#0F1724',
      surface_color: '#162131',
      muted_color: '#2E415A',
    },
  },
  {
    id: 'steel',
    name: 'Steel',
    description: 'Deep navy with an off-white background — sharp and authoritative.',
    palette: {
      primary_color: '#0F2942',
      secondary_color: '#4A5A67',
      accent_color: '#2E6A8E',
      background_color: '#F3F6F9',
      surface_color: '#FFFFFF',
      muted_color: '#D6E0E8',
    },
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Purple and warm orange on a cream background — vivid and creative.',
    palette: {
      primary_color: '#6B2C91',
      secondary_color: '#4F435B',
      accent_color: '#F97360',
      background_color: '#FFF8F4',
      surface_color: '#F8E7DE',
      muted_color: '#E8C9BC',
    },
  },
]

const visualStyles: VisualStyle[] = [
  {
    id: 'modern',
    name: 'Modern',
    description: 'Generous spacing, soft panels, and calm rhythm.',
    font_family: 'Helvetica',
    markdown_preset: 'default-light',
    line_spacing: 1.42,
    font_size_heading: 22,
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Compact and formal with crisp hierarchy and sharp lines.',
    font_family: 'Times-Roman',
    markdown_preset: 'modern-corporate',
    line_spacing: 1.34,
    font_size_heading: 22,
  },
  {
    id: 'expressive',
    name: 'Expressive',
    description: 'Bold callouts, dynamic spacing, and a creative edge.',
    font_family: 'Helvetica',
    markdown_preset: 'creative-studio',
    line_spacing: 1.48,
    font_size_heading: 24,
  },
]

// Maps preset id → palette id / style id for selected-state derivation
const presetToPaletteId: Record<MarkdownPreset, ColorPalette['id']> = {
  'default-light': 'ocean',
  'default-dark': 'midnight',
  'modern-corporate': 'steel',
  'creative-studio': 'ember',
}
const presetToStyleId: Record<MarkdownPreset, VisualStyle['id']> = {
  'default-light': 'modern',
  'default-dark': 'modern',
  'modern-corporate': 'professional',
  'creative-studio': 'expressive',
}

const fontCssMap: Record<string, string> = {
  'Helvetica': 'system-ui, -apple-system, sans-serif',
  'Times-Roman': 'Georgia, "Times New Roman", serif',
  'Courier': '"Courier New", Courier, monospace',
}

// ─── Pure helpers ─────────────────────────────────────────────────────────────

function resolveMarkdownPreset(
  styleId: VisualStyle['id'] | null,
  isDark: boolean,
): MarkdownPreset {
  if (isDark) return 'default-dark'
  switch (styleId) {
    case 'modern':       return 'default-light'
    case 'professional': return 'modern-corporate'
    case 'expressive':   return 'creative-studio'
    default:             return 'default-light'
  }
}

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

  if (preset === 'default-light') {
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
    base.code.background_color = palette.surface_color
    base.code.border_color = palette.muted_color
    base.code.padding = 12
    base.horizontal_rules.thickness = 0.5
    base.horizontal_rules.spacing_before = 10
    base.horizontal_rules.spacing_after = 10
    base.tables.header_background_color = palette.primary_color
    base.tables.header_text_color = '#FFFFFF'
    base.tables.row_background_color = palette.surface_color
    base.tables.alternate_row_background_color = palette.background_color
    base.tables.border_color = palette.muted_color
    base.tables.cell_padding = 8
  }

  if (preset === 'default-dark') {
    base.body.space_after = 10
    base.headings.h1.space_before = 0
    base.headings.h1.space_after = 12
    base.headings.h2.space_before = 16
    base.headings.h2.space_after = 8
    base.headings.h3.space_before = 12
    base.headings.h3.space_after = 6
    base.lists.item_spacing = 6
    base.lists.left_indent = 20
    base.blockquotes.border_color = palette.muted_color
    base.blockquotes.background_color = palette.surface_color
    base.blockquotes.left_indent = 0
    base.blockquotes.padding = 12
    base.code.text_color = '#E2E8F0'
    base.code.background_color = palette.surface_color
    base.code.border_color = palette.muted_color
    base.code.padding = 12
    base.horizontal_rules.color = palette.muted_color
    base.horizontal_rules.thickness = 0.5
    base.horizontal_rules.spacing_before = 10
    base.horizontal_rules.spacing_after = 10
    base.tables.header_background_color = '#13263C'
    base.tables.header_text_color = '#F8FAFC'
    base.tables.row_background_color = '#13263C'
    base.tables.alternate_row_background_color = palette.surface_color
    base.tables.border_color = palette.muted_color
    base.tables.cell_padding = 8
  }

  if (preset === 'modern-corporate') {
    base.body.space_after = 8
    base.lists.item_spacing = 5
    base.blockquotes.border_color = palette.primary_color
    base.blockquotes.background_color = palette.surface_color
    base.blockquotes.left_indent = 0
    base.blockquotes.padding = 10
    base.code.background_color = palette.surface_color
    base.code.border_color = palette.muted_color
    base.code.padding = 10
    base.horizontal_rules.thickness = 0.5
    base.tables.header_background_color = palette.primary_color
    base.tables.header_text_color = '#FFFFFF'
    base.tables.row_background_color = palette.surface_color
    base.tables.alternate_row_background_color = palette.background_color
    base.tables.border_color = palette.muted_color
    base.tables.cell_padding = 8
    base.headings.h1.space_before = 14
    base.headings.h2.space_before = 12
  }

  if (preset === 'creative-studio') {
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
    base.code.background_color = palette.surface_color
    base.code.border_color = palette.muted_color
    base.code.padding = 12
    base.horizontal_rules.thickness = 0.5
    base.horizontal_rules.spacing_before = 10
    base.horizontal_rules.spacing_after = 10
    base.tables.header_background_color = palette.primary_color
    base.tables.header_text_color = '#FFFFFF'
    base.tables.row_background_color = palette.surface_color
    base.tables.alternate_row_background_color = palette.background_color
    base.tables.border_color = palette.muted_color
    base.tables.cell_padding = 8
  }

  return base
}

function createDraftFromPreset(preset: StylePreset): TemplateDraft {
  const advanced: AdvancedTemplateSettings = {
    typography: preset.typography,
    layout: preset.layout,
    header: preset.header,
    footer: preset.footer,
    markdown_styles: {} as MarkdownStyles,
  }

  const draft: TemplateDraft = {
    name: preset.template_name,
    slug: preset.template_slug,
    description: preset.template_description,
    is_default: preset.is_default,
    company_name: preset.company_name,
    logo: null,
    palette: preset.palette,
    markdown_preset: preset.id,
    advanced,
  }

  draft.advanced.markdown_styles = createPresetStyles(
    draft.markdown_preset,
    draft.palette,
    draft.advanced,
  )
  return draft
}

function createInitialDraft(): TemplateDraft {
  return createDraftFromPreset(stylePresets[0])
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

function PaletteCard({
  selected,
  palette,
  onClick,
}: {
  selected: boolean
  palette: ColorPalette
  onClick: () => void
}) {
  const swatchKeys: (keyof PaletteSettings)[] = [
    'primary_color',
    'secondary_color',
    'accent_color',
    'background_color',
    'surface_color',
    'muted_color',
  ]
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
        {swatchKeys.map((key) => (
          <span
            key={key}
            className="h-5 w-5 rounded-full border border-white shadow-sm"
            style={{ backgroundColor: palette.palette[key] }}
          />
        ))}
      </div>
      <h3 className="mt-3 text-sm font-medium text-slate-700">{palette.name}</h3>
      <p className="mt-0.5 text-xs leading-5 text-slate-500">{palette.description}</p>
    </button>
  )
}

function StyleCard({
  selected,
  style,
  onClick,
}: {
  selected: boolean
  style: VisualStyle
  onClick: () => void
}) {
  const cssFontFamily = fontCssMap[style.font_family] ?? style.font_family
  const tagline =
    style.markdown_preset === 'default-light'
      ? 'Generous spacing · soft panels'
      : style.markdown_preset === 'modern-corporate'
        ? 'Compact · sharp lines'
        : 'Bold callouts · dynamic spacing'

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
      <p
        className="text-base font-semibold text-slate-800 leading-tight"
        style={{ fontFamily: cssFontFamily }}
      >
        {style.font_family}
      </p>
      <p className="mt-1 text-xs text-slate-400 tracking-wide">{tagline}</p>
      <h3 className="mt-3 text-sm font-medium text-slate-700">{style.name}</h3>
      <p className="mt-0.5 text-xs leading-5 text-slate-500">{style.description}</p>
    </button>
  )
}

// ─── Section icons ────────────────────────────────────────────────────────────

function IconId() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M4.5 3.75a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h15a3 3 0 0 0 3-3V6.75a3 3 0 0 0-3-3h-15Zm4.125 3a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Zm-3.873 8.703a4.126 4.126 0 0 1 7.746 0 .75.75 0 0 1-.351.92 7.47 7.47 0 0 1-3.522.877 7.47 7.47 0 0 1-3.522-.877.75.75 0 0 1-.351-.92ZM15 8.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15ZM14.25 12a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H15a.75.75 0 0 1-.75-.75Zm.75 2.25a.75.75 0 0 0 0 1.5h3.75a.75.75 0 0 0 0-1.5H15Z" clipRule="evenodd" />
    </svg>
  )
}

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

function IconBrush() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path fillRule="evenodd" d="M20.599 1.5c-.376 0-.743.111-1.055.32l-5.08 3.385a18.747 18.747 0 0 0-3.471 2.987 10.04 10.04 0 0 1 4.815 4.815 18.748 18.748 0 0 0 2.987-3.472l3.386-5.079A1.902 1.902 0 0 0 20.599 1.5Zm-8.3 14.025a18.76 18.76 0 0 0 1.896-1.207 8.026 8.026 0 0 0-4.513-4.513A18.75 18.75 0 0 0 8.475 11.7l-.278.5a5.26 5.26 0 0 1 3.601 3.602l.502-.278ZM6.75 13.5A3.75 3.75 0 0 0 3 17.25a1.5 1.5 0 0 1-1.601 1.497.75.75 0 0 0-.7 1.143 5.25 5.25 0 0 0 9.8-2.64A3.75 3.75 0 0 0 6.75 13.5Z" clipRule="evenodd" />
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

  const [selectedPaletteId, setSelectedPaletteId] = useState<ColorPalette['id'] | null>(() => {
    const initial = isEditMode ? createDraftFromTheme(initialTheme) : createInitialDraft()
    return colorPalettes.find((p) => p.palette.primary_color === initial.palette.primary_color)?.id ?? null
  })

  const [selectedStyleId, setSelectedStyleId] = useState<VisualStyle['id'] | null>(() => {
    const initial = isEditMode ? createDraftFromTheme(initialTheme) : createInitialDraft()
    return presetToStyleId[initial.markdown_preset] ?? null
  })

  function updateField<K extends keyof TemplateDraft>(key: K, value: TemplateDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function updatePalette<K extends keyof PaletteSettings>(key: K, value: PaletteSettings[K]) {
    setDraft((current) => ({
      ...current,
      palette: { ...current.palette, [key]: value },
    }))
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

  function applyQuickPreset(preset: StylePreset) {
    setSelectedPaletteId(presetToPaletteId[preset.id])
    setSelectedStyleId(presetToStyleId[preset.id])
    setDraft((current) => ({
      ...current,
      palette: preset.palette,
      company_name: current.company_name || preset.company_name,
      is_default: preset.is_default,
      markdown_preset: preset.id,
      advanced: {
        ...current.advanced,
        typography: preset.typography,
        layout: preset.layout,
        header: preset.header,
        footer: preset.footer,
        markdown_styles: createPresetStyles(preset.id, preset.palette, {
          typography: preset.typography,
        }),
      },
    }))
  }

  function applyColorPalette(cp: ColorPalette) {
    setSelectedPaletteId(cp.id)
    const isDark = cp.id === 'midnight'
    const resolvedPreset = resolveMarkdownPreset(selectedStyleId, isDark)
    setDraft((current) => ({
      ...current,
      palette: cp.palette,
      markdown_preset: resolvedPreset,
      advanced: {
        ...current.advanced,
        markdown_styles: createPresetStyles(resolvedPreset, cp.palette, current.advanced),
      },
    }))
  }

  function applyVisualStyle(vs: VisualStyle) {
    setSelectedStyleId(vs.id)
    const isDark = selectedPaletteId === 'midnight'
    const resolvedPreset = resolveMarkdownPreset(vs.id, isDark)
    setDraft((current) => {
      const newTypography = {
        ...current.advanced.typography,
        font_family: vs.font_family,
        line_spacing: vs.line_spacing,
        font_size_heading: vs.font_size_heading,
      }
      return {
        ...current,
        markdown_preset: resolvedPreset,
        advanced: {
          ...current.advanced,
          typography: newTypography,
          markdown_styles: createPresetStyles(resolvedPreset, current.palette, {
            typography: newTypography,
          }),
        },
      }
    })
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
            Pick a palette and style to personalise your report. Combine them freely, then save.
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

          {/* ── 1. Template Name ──────────────────────────────────── */}
          <CollapsibleSection
            title="Template Name"
            subtitle="Name and unique slug for this template."
            icon={<IconId />}
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
            </div>
          </CollapsibleSection>

          {/* ── 2. Presets ─────────────────────────────────────────── */}
          <CollapsibleSection
            title="Presets"
            subtitle="Quick-start: picks a palette, style, and typography all at once."
            icon={<IconText />}
            defaultOpen
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {stylePresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  selected={
                    selectedPaletteId === presetToPaletteId[preset.id] &&
                    selectedStyleId === presetToStyleId[preset.id]
                  }
                  title={preset.name}
                  description={preset.description}
                  swatches={[
                    preset.palette.primary_color,
                    preset.palette.secondary_color,
                    preset.palette.accent_color,
                    preset.palette.surface_color,
                  ]}
                  onClick={() => applyQuickPreset(preset)}
                />
              ))}
            </div>
          </CollapsibleSection>

          {/* ── 3. Color Palettes ─────────────────────────────────── */}
          <CollapsibleSection
            title="Color Palettes"
            subtitle="Choose a named color set — swaps all 6 colors at once."
            icon={<IconPalette />}
            defaultOpen
          >
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {colorPalettes.map((cp) => (
                <PaletteCard
                  key={cp.id}
                  selected={selectedPaletteId === cp.id}
                  palette={cp}
                  onClick={() => applyColorPalette(cp)}
                />
              ))}
            </div>
            <details className="mt-4">
              <summary className="cursor-pointer select-none text-xs text-slate-400 hover:text-slate-600">
                Fine-tune individual colors
              </summary>
              <div className="mt-3 grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-3">
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
            </details>
          </CollapsibleSection>

          {/* ── 4. Style ───────────────────────────────────────────── */}
          <CollapsibleSection
            title="Style"
            subtitle="Sets typography and rendering — combine freely with any palette."
            icon={<IconBrush />}
            defaultOpen
          >
            <div className="grid gap-3 md:grid-cols-3">
              {visualStyles.map((vs) => (
                <StyleCard
                  key={vs.id}
                  selected={selectedStyleId === vs.id}
                  style={vs}
                  onClick={() => applyVisualStyle(vs)}
                />
              ))}
            </div>
            {selectedPaletteId === 'midnight' && (
              <p className="mt-3 text-xs text-slate-400">
                Midnight palette detected — code blocks will use dark-mode rendering automatically.
              </p>
            )}
          </CollapsibleSection>

          {/* ── 5. Brand ───────────────────────────────────────────── */}
          <CollapsibleSection
            title="Brand"
            subtitle="Company name, description, and logo."
            icon={<IconBrand />}
          >
            <div className="grid gap-4 md:grid-cols-2">
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

          {/* ── 6. Advanced ────────────────────────────────────────── */}
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
                  setSelectedPaletteId('ocean')
                  setSelectedStyleId('modern')
                  setSlugTouched(false)
                  setSuccess(null)
                  setError(null)
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
                    fontFamily: fontCssMap[draft.advanced.typography.font_family] ?? draft.advanced.typography.font_family,
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
                    fontFamily: fontCssMap[draft.advanced.typography.font_family] ?? draft.advanced.typography.font_family,
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
