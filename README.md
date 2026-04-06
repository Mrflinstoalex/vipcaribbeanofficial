# VIP Caribbean — Documentación del Proyecto

Sitio web oficial de VIP Caribbean República Dominicana. Agencia de reclutamiento para cruceros.

---

## Estructura del repositorio

```
vipcaribbeanofficial/
├── src/                  # Astro app (sitio web público)
├── studio/               # Sanity Studio (panel de administración)
├── vercel.json           # Configuración de crons en Vercel
└── .env                  # Variables de entorno del sitio web
```

---

## 1. Sitio web (`src/`)

**Stack:** Astro 5 + React 19 + TypeScript + Tailwind CSS + shadcn/ui + @tailwindcss/typography  
**Deploy:** Vercel — `https://www.vipcaribbeanoffice.com`

### Comandos

```bash
# Desde la raíz del proyecto
pnpm dev          # Servidor local en http://localhost:4321
pnpm build        # Build de producción
pnpm preview      # Preview del build
pnpm astro check  # Validación de TypeScript
```

### Variables de entorno (`.env`)

| Variable | Descripción |
|---|---|
| `SITE_URL` | URL del sitio (`http://localhost:4321` en dev, `https://www.vipcaribbeanoffice.com` en prod) |
| `EMAIL_PROVIDER` | `gmail` o `yahoo` |
| `EMAIL_USER` | Correo SMTP |
| `EMAIL_PASS` | Contraseña de aplicación SMTP |
| `SANITY_PROJECT_ID` | ID del proyecto Sanity (`97i3rge0`) |
| `SANITY_DATASET` | Dataset de Sanity (`production`) |
| `SANITY_API_TOKEN` | Token con permisos de escritura (para crear/actualizar citas) |
| `CANCEL_SECRET` | Secreto compartido entre el Studio y el API para autorizar cancelaciones |
| `CRON_SECRET` | Secreto que Vercel envía al ejecutar el cron job de limpieza |

### Cómo fluye la data

Todas las páginas `.astro` obtienen datos en build time llamando funciones de `src/lib/cms.ts`, que hace queries GROQ al backend de Sanity. Los datos se pasan como props a componentes React.

```
Sanity CMS → src/lib/cms.ts → páginas .astro → componentes React
```

> `src/lib/wp.ts` existe pero ya **no se usa** — es el cliente anterior de WordPress.

### Notas importantes de renderizado de contenido

- El contenido Portable Text de Sanity se convierte a HTML con `blocksToHtml()` en `cms.ts`
- En `BlogDetalle.tsx` el HTML se renderiza con la clase `prose` de `@tailwindcss/typography`
- En `QuienesSomos.tsx` los headings dentro del HTML tienen clases Tailwind explícitas (`[&_h2]`, `[&_h3]`) para que sean `text-foreground` (negro) y no hereden el color `text-muted-foreground` del contenedor
- Los `<a>` generados por Portable Text tienen `text-inherit no-underline` en ambas páginas para evitar el color azul del navegador por defecto

---

## 2. Panel de administración — Sanity Studio (`studio/`)

**URL producción:** `https://vipcaribbean.sanity.studio`  
**URL local:** `http://localhost:3333`

### Comandos

```bash
# Desde la carpeta studio/
npm run dev      # Studio local en http://localhost:3333
npm run build    # Build del Studio
npm run deploy   # Publica el Studio en sanity.studio
```

### Variables de entorno (`studio/.env`)

| Variable | Descripción |
|---|---|
| `SANITY_STUDIO_CANCEL_SECRET` | Debe coincidir con `CANCEL_SECRET` del sitio web |
| `SANITY_STUDIO_SITE_URL` | URL del sitio Astro — `http://localhost:4321` en dev, `https://www.vipcaribbeanoffice.com` en prod |

> Las variables con prefijo `SANITY_STUDIO_` se inyectan en **build time**. Si cambias `SANITY_STUDIO_SITE_URL` para producción, debes volver a hacer `npm run deploy`.

### Tipos de documentos en Sanity

#### Singletons (páginas únicas)
| Tipo | Descripción |
|---|---|
| `paginaLanding` | Contenido de la página de inicio (hero, servicios, aliados, pasos, CTA) |
| `paginaContacto` | Datos de la página de contacto |
| `paginaQuienesSomos` | Contenido de Quiénes Somos (hero, historia, misión/visión, valores, equipo, stats) |
| `footer` | Descripción, redes sociales, dirección, teléfono y email del footer |

#### Contenido dinámico
| Tipo | Descripción |
|---|---|
| `empleoCategoria` | Categorías de empleos (ej: Hospitalidad, Cubierta, Entretenimiento). Referenciado desde `empleo` |
| `empleo` | Vacantes de trabajo. Referencia a `empleoCategoria` y `lineaCrucero` |
| `lineaCrucero` | Líneas de crucero con nombre y logo |
| `evento` | Eventos de la galería con fotos y videos |
| `articuloCategoria` | Categorías de artículos del blog (ej: Tips, Noticias, Guías). Referenciado desde `articulo` |
| `articulo` | Artículos del blog. Referencia a `articuloCategoria` |
| `faqCategoria` | Categorías de preguntas frecuentes. Referenciado desde `faq` |
| `faq` | Preguntas frecuentes. Referencia a `faqCategoria` |
| `candidato` | Resultados de pre-entrevista (nombre, posición, estado, fecha) |

> Los tres tipos de contenido con categorías (`empleo`, `articulo`, `faq`) usan el mismo patrón: documento de categoría independiente con `nombre`, `slug` y `orden`, referenciado desde el documento principal. En `cms.ts` se resuelve con `categoria->nombre` en la GROQ projection.

#### Citas
| Tipo | Descripción |
|---|---|
| `cita` | Cita reservada por un usuario (nombre, email, teléfono, fecha, hora, estado: `activa`/`cancelada`) |
| `fechaBloqueada` | Miércoles marcados como cerrados — ese día no aparece disponible para reservar |

#### Email Templates
Los templates tienen IDs fijos y admiten variables `{{ nombre }}`, `{{ email }}`, `{{ fecha }}`, `{{ hora }}` que se reemplazan al enviar.

| ID del documento | Descripción |
|---|---|
| `emailTemplate-aplicacion` | Email al candidato cuando aplica a un empleo |
| `emailTemplate-cita` | Confirmación de cita al usuario |
| `emailTemplate-cancelacion` | Notificación de cancelación al usuario |

---

## 3. Sistema de citas (`/reservar-cita`)

### Cómo funciona

1. Al cargar la página se consultan dos APIs en paralelo:
   - `GET /api/blocked-dates` → miércoles bloqueados (documentos `fechaBloqueada` en Sanity)
   - `GET /api/locked-times?date=YYYY-MM-DD` → horarios llenos del próximo miércoles
2. El calendario solo habilita **el próximo miércoles** (se abre semana a semana).
3. Los horarios disponibles van de **9:00 AM a 12:00 PM** en intervalos de **5 minutos**.
4. Cada horario admite **máximo 2 personas** (`MAX_BOOKINGS_PER_SLOT = 2` en `cms.ts`). Al llegar a 2 reservas activas el horario aparece 🔒 y se deshabilita. Para cambiar el límite, editar esa constante.
5. Al confirmar, `POST /api/email/cita` verifica el cupo en tiempo real, guarda el documento `cita` en Sanity y envía email de confirmación al usuario y al admin.

### Gestión desde el Studio

El panel **"Gestión de Citas"** en `https://vipcaribbean.sanity.studio` permite:
- Ver citas agrupadas por miércoles
- Filtrar: ✅ Activas · ❌ Canceladas · 📋 Todas (por defecto muestra solo activas)
- Cancelar una cita — actualiza `estado: "cancelada"` en Sanity y envía email de cancelación al usuario

Al cancelar, el Studio llama a `POST /api/email/cancelar-cita` en el sitio Astro usando `SANITY_STUDIO_SITE_URL`. El endpoint valida el header `x-cancel-secret` contra `CANCEL_SECRET`.

### Limpieza automática (cron)

Cada **jueves a las 12:00 AM hora RD (UTC-4)**, Vercel ejecuta:

```
GET /api/cron/cleanup-citas
```

Borra de Sanity **todas las citas del miércoles anterior**. Configurado en `vercel.json` con el schedule `0 4 * * 4` (jueves 4:00 AM UTC = 12:00 AM UTC-4).

Vercel envía automáticamente `Authorization: Bearer {CRON_SECRET}` — el endpoint rechaza cualquier llamada sin ese header.

---

## 4. API routes (`src/pages/api/`)

Todas requieren `export const prerender = false`.

| Ruta | Método | Descripción |
|---|---|---|
| `/api/email/aplicar` | POST | Formulario de aplicación (multipart/form-data), adjunta CV, envía emails al admin y al candidato |
| `/api/email/cita` | POST | Valida cupo disponible, guarda cita en Sanity, envía confirmación |
| `/api/email/cancelar-cita` | POST | Actualiza estado de cita en Sanity, envía email de cancelación. Requiere header `x-cancel-secret` |
| `/api/blocked-dates` | GET | Retorna array de fechas bloqueadas desde Sanity |
| `/api/locked-times` | GET | Retorna horarios llenos para una fecha (`?date=YYYY-MM-DD`) |
| `/api/cron/cleanup-citas` | GET | Borra citas del miércoles anterior. Solo acepta llamadas autenticadas de Vercel Cron |

El envío de emails usa **Nodemailer** con SMTP Gmail o Yahoo según `EMAIL_PROVIDER`.  
CORS en `/api/email/cancelar-cita` acepta únicamente: `https://vipcaribbean.sanity.studio` y `http://localhost:3333`.

---

## 5. Deploy

### Sitio web → Vercel

1. Push a la rama principal → Vercel hace deploy automático.
2. Configurar todas las variables de entorno en el dashboard de Vercel (las mismas del `.env`).

### Studio → Sanity

```bash
cd studio

# Antes de deployar a producción, asegurarse que studio/.env tenga:
# SANITY_STUDIO_SITE_URL=https://www.vipcaribbeanoffice.com

npm run deploy
```

> En desarrollo local usar `SANITY_STUDIO_SITE_URL=http://localhost:4321` para que la cancelación de citas llame al servidor local de Astro.
