# Enterprise Template Studio — Design Document

**Date:** 2026-04-29
**Status:** Approved

## Overview

The current reports app stores simple PDF themes in MongoDB and applies them during Markdown-to-PDF generation. We will evolve that object into an enterprise-ready template with shared branding controls, reusable page chrome, and richer Markdown component formatting. A new frontend view, Template Studio, will let users create and save these templates directly in the app.

## Goals

- Create Mongo-backed templates with brand palette, company metadata, and embedded logo data
- Support consistent header and footer rendering on every PDF page
- Let users choose a formatting preset and optionally override Markdown component styles
- Add a dedicated frontend view for authoring templates without leaving the app
- Preserve the existing report-generation flow by reusing the saved template list

## Non-Goals

- Separate asset storage outside MongoDB
- Multi-tenant permissioning or user ownership
- Rich WYSIWYG editing of Markdown content itself
- Full template editing/version history in the first release

## Data Model

The existing `Theme` document remains the backend object, but it grows into a richer template model.

### New top-level fields

- `company_name`
- `accent_color`
- `surface_color`
- `muted_color`
- `logo`
- `header`
- `footer`
- `markdown_preset`
- `markdown_styles`

### Nested structures

- `logo`: embedded file payload with filename, MIME type, data URL, and preferred display width
- `header` / `footer`: enabled state, text, alignment, divider toggle, and whether to render the shared logo
- `markdown_styles`: component-specific overrides for headings, body, lists, blockquotes, code blocks, horizontal rules, and tables

## Backend Changes

### API

Keep the existing `/api/themes` endpoints so the current generation flow stays stable. The frontend will present them as templates, but the backend route surface does not need to change yet.

### Rendering

- Update page rendering to paint background color on each page
- Render shared header/footer branding on every page
- Decode embedded logo data and draw it via ReportLab
- Add table parsing with Mistune’s table plugin
- Map table tokens into ReportLab `Table` flowables with template-driven styles

### Style Resolution

Introduce a small preset system in the PDF layer:

- `enterprise`
- `executive`
- `minimal`

Each preset defines baseline styles for supported Markdown components. Saved `markdown_styles` overrides are merged over the selected preset before flowables are built.

## Frontend Changes

### App Structure

Add a lightweight two-view shell:

- `Generate Reports`
- `Template Studio`

The report-generation view keeps the current upload, template selection, and preview workflow. The new studio view hosts the creation form.

### Template Studio

The form is split into:

- Brand
- Palette
- Page Setup
- Header
- Footer
- Typography
- Markdown Components

It includes:

- logo upload converted to a data URL in the browser
- preset selection
- advanced per-component formatting inputs
- save action that POSTs to the existing backend endpoint
- lightweight on-page preview of how the template feels

## Error Handling

- Reject duplicate slugs with the existing `409`
- Keep logo upload client-side until save; invalid file reads show inline errors
- Default nested rendering config server-side so older theme documents continue to work

## Verification

- Frontend build via Vite/TypeScript
- Backend import/compile sanity check
- Manual smoke path: create template, switch to generator, select saved template, render PDF with header/footer and tables
