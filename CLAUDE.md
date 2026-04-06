# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Astro app (root)
pnpm dev          # Dev server at localhost:4321
pnpm build        # Production build to ./dist/
pnpm preview      # Preview production build
pnpm astro check  # TypeScript validation
pnpm test         # Playwright e2e tests
pnpm test:ui      # Playwright tests with interactive UI

# Sanity Studio (studio/)
npm run dev       # Studio at localhost:3333
npm run deploy    # Publish Studio to sanity.studio
```

No lint scripts configured.

## Architecture

**Stack:** Astro 5 (hybrid — static + SSR) + React 19 islands + TypeScript + Tailwind CSS + shadcn/ui + @tailwindcss/typography. Deployed on Vercel. Content from Sanity CMS. Astro View Transitions (`ClientRouter`) enabled globally in `src/layouts/Layout.astro`.

**Path alias:** `@/*` → `./src/*`

**Two separate projects in this repo:**
- Root — Astro web app (`src/`, `.env`, `vercel.json`)
- `studio/` — Sanity Studio with its own `package.json`, `.env`, and deploy

### Data layer — `src/lib/cms.ts`

All Sanity queries live here. `src/lib/wp.ts` is the old WordPress client — unused, ignore it.

Two exported clients:
- `client` — read-only, CDN-enabled
- `writeClient` — requires `SANITY_API_TOKEN`, used only in API routes for mutations

Portable Text arrays are converted to HTML strings via the internal `blocksToHtml()` helper (uses `@portabletext/to-html`). All page components expect HTML strings, not Portable Text blocks.

Sanity document types: `empleo`, `empleoCategoria`, `evento`, `articulo`, `articuloCategoria`, `faq`, `faqCategoria`, `candidato`, `lineaCrucero`, `cita`, `fechaBloqueada`, `emailTemplate`, `paginaLanding`, `paginaContacto`, `paginaQuienesSomos`, `footer`.

**Categories pattern** — `empleo`, `articulo`, and `faq` all reference a separate category document (`empleoCategoria`, `articuloCategoria`, `faqCategoria`). In GROQ projections use `categoria->nombre` and `categoria->slug.current` to resolve the reference to a string. In Sanity Studio previews use `select: { subtitle: "categoria.nombre" }` (dot notation, not arrow).

`MAX_BOOKINGS_PER_SLOT = 2` constant in `cms.ts` controls how many people can book the same time slot. `getLockedTimesForDate()` returns slots that have reached this limit.

### API routes — `src/pages/api/`

All files require `export const prerender = false`.

- `email/aplicar.ts` — job application form, CV attachment, emails to admin + applicant
- `email/cita.ts` — validates slot availability, creates `cita` in Sanity, sends confirmation
- `email/cancelar-cita.ts` — updates `cita.estado` to `"cancelada"`, sends cancellation email. Protected by `x-cancel-secret` header. CORS allows only `https://vipcaribbean.sanity.studio` and `http://localhost:3333`
- `email/_mailer.ts` — Nodemailer transporter, Gmail or Yahoo via `EMAIL_PROVIDER` env var
- `blocked-dates.ts` — returns `fechaBloqueada` documents
- `locked-times.ts` — returns taken slots for a date (`?date=YYYY-MM-DD`)
- `cron/cleanup-citas.ts` — deletes all citas from the previous Wednesday. Called by Vercel Cron every Thursday at 4:00 AM UTC (= 12:00 AM UTC-4 / Dominican Republic). Authenticated via `Authorization: Bearer {CRON_SECRET}` header

### Appointment system (`/reservar-cita`)

- Only **the next Wednesday** is ever available in the calendar (computed client-side)
- Time slots: 9:00 AM – 12:00 PM every 5 minutes (hardcoded in `ReservarCita.tsx`)
- `vercel.json` configures the Thursday cleanup cron: `"schedule": "0 4 * * 4"`

### Sanity Studio (`studio/`)

- Custom tool `studio/plugins/gestionCitas/CitasTool.tsx` — appointment manager with active/cancelled/all filter. Uses `SANITY_STUDIO_SITE_URL` (injected at build time) to call the Astro API for cancellation emails
- Custom tool `studio/plugins/importCandidatos/ImportTool.tsx` — CSV/Excel importer for candidates
- `studio/structure.ts` — sidebar organization. Empleos, Blog, and FAQs each have a subfolder containing their documents and their category documents

### Rendering HTML content

When rendering Portable Text HTML in components:
- `BlogDetalle.tsx` uses `prose prose-lg` classes from `@tailwindcss/typography` with overrides: `prose-headings:text-foreground prose-a:text-inherit prose-a:no-underline`
- `QuienesSomos.tsx` historia section uses manual Tailwind arbitrary variants: `[&_h2]:text-foreground [&_h3]:text-foreground [&_a]:text-inherit [&_a]:no-underline` — headings inside `dangerouslySetInnerHTML` inherit `text-muted-foreground` from the container without these overrides

### Styling

Tailwind custom tokens in `tailwind.config.ts`: `coral`, `navy`, `ocean`, `warm-white`, `soft-gray`. CSS variables and global base styles in `src/styles/global.css`. `@tailwindcss/typography` and `tailwindcss-animate` are both registered in the plugins array.

### Environment variables

**Root `.env`:** `SITE_URL`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_PROVIDER`, `SANITY_PROJECT_ID`, `SANITY_DATASET`, `SANITY_API_TOKEN`, `CANCEL_SECRET`, `CRON_SECRET`

**`studio/.env`:** `SANITY_STUDIO_CANCEL_SECRET` (must match `CANCEL_SECRET`), `SANITY_STUDIO_SITE_URL` (`http://localhost:4321` dev / `https://www.vipcaribbeanoffice.com` prod). Change to prod URL before running `npm run deploy`.
