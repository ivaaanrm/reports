export interface Theme {
  id: string
  name: string
  slug: string
  description: string
  is_default: boolean
  font_family: string
  font_size_body: number
  font_size_heading: number
  primary_color: string
  secondary_color: string
  background_color: string
  page_size: string
  margin_top: number
  margin_bottom: number
  margin_left: number
  margin_right: number
  line_spacing: number
  columns: number
  show_header: boolean
  header_text: string | null
  show_footer: boolean
  show_page_numbers: boolean
  created_at: string
  updated_at: string
}

export interface ThemeCreate {
  name: string
  slug: string
  description?: string
  is_default?: boolean
  font_family?: string
  font_size_body?: number
  font_size_heading?: number
  primary_color?: string
  secondary_color?: string
  background_color?: string
  page_size?: string
  margin_top?: number
  margin_bottom?: number
  margin_left?: number
  margin_right?: number
  line_spacing?: number
  columns?: number
  show_header?: boolean
  header_text?: string | null
  show_footer?: boolean
  show_page_numbers?: boolean
}
