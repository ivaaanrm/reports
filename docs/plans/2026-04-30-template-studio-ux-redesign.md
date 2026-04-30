# Template Studio UX Redesign

**Date:** 2026-04-30  
**Scope:** Visual redesign of TemplateStudio.tsx — collapsible affordance, advanced options hierarchy, and full visual tone consistency. No structural/IA changes.  
**Approach:** B — Visual redesign (keep data architecture, rebuild visual layer)

---

## 1. Design System Tokens

A fixed token set applied uniformly across the entire component.

| Token | Value |
|---|---|
| Section radius | `rounded-2xl` (16px) |
| Sub-card radius | `rounded-xl` (12px) |
| Section padding | `p-6` |
| Section gap | `gap-4` |
| Field gap | `gap-4` |
| Label-to-input gap | `gap-1.5` |
| Section background | `bg-white` |
| Sub-card background | `bg-slate-50` |
| Border | `border border-slate-200` |
| Shadow | `shadow-sm ring-1 ring-slate-200` |
| Accent | `sky-500` |

**Typography scale — three levels only:**
- Section header: `text-sm font-semibold text-slate-800 tracking-wide uppercase`
- Subsection/card header: `text-sm font-medium text-slate-700`
- Field label: `text-xs font-medium text-slate-500`

No bespoke `box-shadow` strings, no `backdrop-blur`, no mixed radius values.

---

## 2. Collapsible Affordance

Replace native `<details>`/`<summary>` with a controlled React component using `useState`.

**Header row (full-width click target):**
- Left: 16px section icon + title in section header style
- Right: chevron rotates 90° on open (`transition-transform duration-200`)
- No "Toggle" button text anywhere

**Subtitle:** `text-xs text-slate-400` descriptor always visible below title (open or closed), e.g.:
- Brand → *"Name, slug, company identity"*
- Palette → *"Colors and visual theme"*
- Markdown Presets → *"Typography style across elements"*
- Advanced → *"Typography, layout, page chrome, markdown"*

**Animation:** CSS grid trick — `grid-rows-[0fr]` → `grid-rows-[1fr]` with `overflow-hidden` for smooth open/close without JS height measurement.

**Default state:** Brand open, all others closed.

---

## 3. Advanced Configurations Hierarchy

Three subsections (Typography/Layout, Page Chrome, Markdown Overrides) get clear visual depth via:

**Subsection dividers:** `border-t border-slate-100` + subsection name in subsection header style — creates chapter breaks without extra containers.

**Sub-cards:** `bg-slate-50 rounded-xl p-4` grouping related fields. Card breakdown:
- Typography: (1) font + sizes, (2) spacing + columns
- Page Chrome: (1) Header controls (5 fields), (2) Footer controls (6 fields)
- Markdown Overrides: one card per element group (H1–H4, Body & Lists, Blockquotes & Code, Rules, Tables)

**Grid discipline:**
- 2×2 grid for 4 margin fields
- 2-col for color pairs
- Heading controls: 2-col, color spanning full width

**Spacing:** `gap-6` between subsections, `gap-4` between cards, `gap-4` between fields within a card.

---

## 4. Visual Tone Consistency

**Inputs & Selects:**
```
bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm text-slate-800
focus:ring-2 focus:ring-sky-500 focus:border-transparent
```
Color pickers: swatch square + hex input side by side in one row.

**Toggles:** `w-9 h-5` pill, sky-500 on / slate-200 off, white thumb, `transition-colors duration-150`.

**PresetCards:**
- Selected: `ring-2 ring-sky-500 bg-sky-50`
- Unselected: `ring-1 ring-slate-200 bg-white hover:ring-slate-300`

**Buttons — two variants only:**
- Primary: `bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-5 py-2 text-sm font-medium`
- Secondary: `border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl px-5 py-2 text-sm font-medium`

**Field labels:** all `text-xs font-medium text-slate-500` — no mixing with `text-sm` labels.

**Remove:** all decorative `<hr>` and bespoke border lines outside the card/subsection system.
