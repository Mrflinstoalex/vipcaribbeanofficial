# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Astro app (root)
pnpm dev          # Dev server at localhost:4321
pnpm build        # Production build to ./dist/
pnpm preview      # Preview production build
pnpm astro check  # TypeScript validation
pnpm test         # Playwright e2e tests (auto-starts dev server)
pnpm test:ui      # Playwright tests with interactive UI
pnpm test:report  # Open last HTML test report

# Run a single spec file
pnpm test e2e/reservar-cita.spec.ts

# Sanity Studio (studio/)
npm run dev       # Studio at localhost:3333
npm run deploy    # Publish Studio to sanity.studio
```

No lint scripts configured. E2e tests live in `e2e/` and use Playwright; `playwright.config.ts` starts the dev server automatically. Spec files: `reservar-cita.spec.ts`, `aplicar.spec.ts`, `empleos.spec.ts`, `resultados.spec.ts`.

## Architecture

**Stack:** Astro 5 + React 19 islands + TypeScript + Tailwind CSS + shadcn/ui + @tailwindcss/typography. Deployed on Vercel. Content from Sanity CMS. Astro View Transitions (`ClientRouter`) enabled globally in `src/layouts/Layout.astro`.

`astro.config.mjs` uses `output: "static"` — Astro 5 removed the `"hybrid"` output option. Pages default to static; individual routes opt into SSR by exporting `export const prerender = false` (all API routes and most page routes do this).

**Path alias:** `@/*` → `./src/*`

**Two separate projects in this repo:**
- Root — Astro web app (`src/`, `.env`, `vercel.json`)
- `studio/` — Sanity Studio with its own `package.json`, `.env`, and deploy

### Data layer — `src/lib/cms.ts`

All Sanity queries live here. `src/lib/wp.ts` is the old WordPress client — unused, ignore it. `src/lib/parsers/quienesSomos.ts` is a legacy WordPress HTML parser (Cheerio-based) that is no longer called — `getQuienesSomosData()` now fetches structured data directly from Sanity. `src/lib/eventoUtils.ts` is a thin passthrough that just re-exports `getEventoBySlug`; prefer calling `cms.ts` directly.

Two exported clients:
- `client` — read-only, CDN-enabled
- `writeClient` — requires `SANITY_API_TOKEN`, used only in API routes for mutations

Portable Text arrays are converted to HTML strings via the internal `blocksToHtml()` helper (uses `@portabletext/to-html`). All page components expect HTML strings, not Portable Text blocks.

Sanity document types: `empleo`, `empleoCategoria`, `evento`, `articulo`, `articuloCategoria`, `faq`, `faqCategoria`, `candidato`, `estadoCandidato`, `lineaCrucero`, `cita`, `fechaBloqueada`, `emailTemplate`, `listaCorreos`, `paginaLanding`, `paginaContacto`, `paginaQuienesSomos`, `footer`, `seoGlobal`.

**Categories pattern** — `empleo` and `articulo` reference their category via a `categoria` field; use `categoria->nombre` and `categoria->slug.current` in GROQ. `faq` uses a `seccion` field instead — use `seccion->nombre` and `seccion->slug.current`. In Sanity Studio previews use dot notation (`"categoria.nombre"` / `"seccion.nombre"`), not arrow.

`MAX_BOOKINGS_PER_SLOT = 2` constant in `cms.ts` controls how many people can book the same time slot. `getLockedTimesForDate()` returns slots that have reached this limit.

### API routes — `src/pages/api/`

All files require `export const prerender = false`.

- `email/aplicar.ts` — job application form, CV attachment, emails to admin + applicant
- `email/cita.ts` — validates slot availability, creates `cita` in Sanity, sends confirmation
- `email/cancelar-cita.ts` — updates `cita.estado` to `"cancelada"`, sends cancellation email. Protected by `x-cancel-secret` header. CORS allows only `https://vipcaribbean.sanity.studio` and `http://localhost:3333`
- `email/candidatos-bulk.ts` — bulk email sender called by `EnviarEmailsTool` in the Studio. Protected by `x-cancel-secret` header (same `CANCEL_SECRET` value). Accepts `{ recipients, asunto, cuerpo }` and interpolates `{{nombre}}`, `{{posicion}}`, `{{estado}}` per recipient. Same CORS allowlist as `cancelar-cita.ts`
- `email/_mailer.ts` — Nodemailer transporter, Gmail or Yahoo via `EMAIL_PROVIDER` env var
- `blocked-dates.ts` — returns `fechaBloqueada` documents
- `locked-times.ts` — returns taken slots for a date (`?date=YYYY-MM-DD`)
- `cron/cleanup-citas.ts` — deletes all citas from the previous Wednesday. Called by Vercel Cron every Thursday at 4:00 AM UTC (= 12:00 AM UTC-4 / Dominican Republic). Authenticated via `Authorization: Bearer {CRON_SECRET}` header

`emailTemplate` documents support `{{variable}}` mustache-style placeholders in `asunto` and `cuerpoHtml` fields. Available variables per type: `aplicacion` — `nombre`, `email`, `posicion`; `cita` — `nombre`, `email`, `telefono`, `fecha`; `cancelacion` — `nombre`, `fecha`. API routes fall back to hardcoded HTML if the template document is missing.

### Appointment system (`/reservar-cita`)

- Only **the next Wednesday** is ever available in the calendar (computed client-side)
- Time slots: 9:00 AM – 12:00 PM every 5 minutes (hardcoded in `ReservarCita.tsx`)
- `vercel.json` configures the Thursday cleanup cron: `"schedule": "0 4 * * 4"`

### Sanity Studio (`studio/`)

- Custom tool `studio/plugins/gestionCitas/CitasTool.tsx` — appointment manager with active/cancelled/all filter. Uses `SANITY_STUDIO_SITE_URL` (injected at build time) to call the Astro API for cancellation emails
- Custom tool `studio/plugins/importCandidatos/ImportTool.tsx` — CSV/Excel importer for candidates (drag & drop, preview with validation, progress bar persisted via Zustand)
- Custom tool `studio/plugins/importEmpleos/ImportEmpleosTool.tsx` — CSV/Excel importer for jobs. Only `titulo` is required; `categoria` and `cruiseLine` are resolved by name and auto-created with slug if missing. `descripcion` is stored as a single Portable Text paragraph. Same Zustand + progress-bar pattern as the candidates importer
- Custom tool `studio/plugins/enviarEmails/EnviarEmailsTool.tsx` — bulk email composer with three recipient modes: **Listas de correo** (select a `listaCorreos` document), **Candidatos** (filter by estado/posición, checkbox select), **Lista manual** (type emails with autocomplete from candidates). Calls `candidatos-bulk.ts`; supports `{{nombre}}`, `{{posicion}}`, `{{estado}}` variables in free-form subject + body. Dark-mode aware via `useColorScheme()`
- `studio/structure.ts` — sidebar organization. Empleos, Blog, and FAQs each have a subfolder containing their documents and their category documents. Empleos subfolder also contains the jobs importer

**`listaCorreos`** — named mailing lists stored in Sanity. Each has a `destinatarios` array of `{ email, nombre? }` objects. Managed via the Studio sidebar under Candidatos.

**`estadoCandidato`** — free-form status labels (e.g. "Pendiente", "Aprobado") referenced by `candidato` documents. Auto-created by the candidates importer if a new name is encountered.

**`seoGlobal`** — singleton document (`documentId: "seoGlobal"`) for site-wide SEO defaults: `defaultTitle`, `defaultDescription`, `defaultOgImage`, `siteName`, `keywords`.

### Rendering HTML content

When rendering Portable Text HTML in components:
- `BlogDetalle.tsx` uses `prose prose-lg` classes from `@tailwindcss/typography` with overrides: `prose-headings:text-foreground prose-a:text-inherit prose-a:no-underline`
- `QuienesSomos.tsx` historia section uses manual Tailwind arbitrary variants: `[&_h2]:text-foreground [&_h3]:text-foreground [&_a]:text-inherit [&_a]:no-underline` — headings inside `dangerouslySetInnerHTML` inherit `text-muted-foreground` from the container without these overrides

### Styling

Tailwind custom tokens in `tailwind.config.ts`: `coral`, `navy`, `ocean`, `warm-white`, `soft-gray`. CSS variables and global base styles in `src/styles/global.css`. `@tailwindcss/typography` and `tailwindcss-animate` are both registered in the plugins array.

### Environment variables

**Root `.env`:** `SITE_URL`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_PROVIDER`, `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `CANCEL_SECRET`, `CRON_SECRET`

**`studio/.env`:** `SANITY_STUDIO_CANCEL_SECRET` (must match `CANCEL_SECRET`), `SANITY_STUDIO_SITE_URL` (`http://localhost:4321` dev / `https://www.vipcaribbeanoffice.com` prod). Change to prod URL before running `npm run deploy`.
