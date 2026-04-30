export type Alignment = 'left' | 'center' | 'right'
export type MarkdownPreset = 'enterprise' | 'executive' | 'minimal'

export interface LogoAsset {
  file_name: string
  mime_type: string
  data: string
  width: number
}

export interface PaletteSettings {
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  surface_color: string
  muted_color: string
}

export interface HeaderFooterSettings {
  enabled: boolean
  text: string | null
  align: Alignment
  show_logo: boolean
  divider: boolean
  show_page_numbers: boolean
}

export interface TypographySettings {
  font_family: string
  font_size_body: number
  font_size_heading: number
  line_spacing: number
}

export interface LayoutSettings {
  page_size: string
  margin_top: number
  margin_bottom: number
  margin_left: number
  margin_right: number
  columns: number
}

export interface HeadingStyle {
  color: string | null
  font_size: number | null
  space_before: number | null
  space_after: number | null
}

export interface HeadingStyles {
  h1: HeadingStyle
  h2: HeadingStyle
  h3: HeadingStyle
  h4: HeadingStyle
}

export interface BodyStyle {
  color: string | null
  font_size: number | null
  space_after: number | null
}

export interface ListStyle {
  text_color: string | null
  bullet_color: string | null
  item_spacing: number | null
  left_indent: number | null
}

export interface BlockquoteStyle {
  text_color: string | null
  border_color: string | null
  background_color: string | null
  left_indent: number | null
  padding: number | null
}

export interface CodeStyle {
  text_color: string | null
  background_color: string | null
  border_color: string | null
  font_size: number | null
  padding: number | null
}

export interface HorizontalRuleStyle {
  color: string | null
  thickness: number | null
  spacing_before: number | null
  spacing_after: number | null
}

export interface TableStyleSettings {
  header_background_color: string | null
  header_text_color: string | null
  row_background_color: string | null
  alternate_row_background_color: string | null
  border_color: string | null
  cell_padding: number | null
}

export interface MarkdownStyles {
  headings: HeadingStyles
  body: BodyStyle
  lists: ListStyle
  blockquotes: BlockquoteStyle
  code: CodeStyle
  horizontal_rules: HorizontalRuleStyle
  tables: TableStyleSettings
}

export interface AdvancedTemplateSettings {
  typography: TypographySettings
  layout: LayoutSettings
  header: HeaderFooterSettings
  footer: HeaderFooterSettings
  markdown_styles: MarkdownStyles
}

export interface Theme {
  id: string
  name: string
  slug: string
  description: string
  is_default: boolean
  company_name: string
  logo: LogoAsset | null
  palette: PaletteSettings
  markdown_preset: MarkdownPreset
  advanced: AdvancedTemplateSettings
  created_at: string
  updated_at: string
}

export interface ThemeCreate {
  name: string
  slug: string
  description?: string
  is_default?: boolean
  company_name?: string
  logo?: LogoAsset | null
  palette?: PaletteSettings
  markdown_preset?: MarkdownPreset
  advanced?: AdvancedTemplateSettings
}

export interface ThemeUpdate {
  name?: string
  description?: string
  is_default?: boolean
  company_name?: string
  logo?: LogoAsset | null
  palette?: PaletteSettings
  markdown_preset?: MarkdownPreset
  advanced?: AdvancedTemplateSettings
}
