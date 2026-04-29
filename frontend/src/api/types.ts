export type Alignment = 'left' | 'center' | 'right'
export type MarkdownPreset = 'enterprise' | 'executive' | 'minimal'

export interface LogoAsset {
  file_name: string
  mime_type: string
  data: string
  width: number
}

export interface HeaderFooterSettings {
  enabled: boolean
  text: string | null
  align: Alignment
  show_logo: boolean
  divider: boolean
  show_page_numbers: boolean
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

export interface Theme {
  id: string
  name: string
  slug: string
  description: string
  is_default: boolean
  company_name: string
  font_family: string
  font_size_body: number
  font_size_heading: number
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  surface_color: string
  muted_color: string
  page_size: string
  margin_top: number
  margin_bottom: number
  margin_left: number
  margin_right: number
  line_spacing: number
  columns: number
  logo: LogoAsset | null
  header: HeaderFooterSettings
  footer: HeaderFooterSettings
  markdown_preset: MarkdownPreset
  markdown_styles: MarkdownStyles
  created_at: string
  updated_at: string
}

export interface ThemeCreate {
  name: string
  slug: string
  description?: string
  is_default?: boolean
  company_name?: string
  font_family?: string
  font_size_body?: number
  font_size_heading?: number
  primary_color?: string
  secondary_color?: string
  accent_color?: string
  background_color?: string
  surface_color?: string
  muted_color?: string
  page_size?: string
  margin_top?: number
  margin_bottom?: number
  margin_left?: number
  margin_right?: number
  line_spacing?: number
  columns?: number
  logo?: LogoAsset | null
  header?: HeaderFooterSettings
  footer?: HeaderFooterSettings
  markdown_preset?: MarkdownPreset
  markdown_styles?: MarkdownStyles
}
