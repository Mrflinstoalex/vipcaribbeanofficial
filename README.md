# VIP Caribbean — Documentación completa

Plataforma web oficial de VIP Caribbean República Dominicana. Agencia de empleo en cruceros.

---

## Tabla de contenidos

1. [Stack y estructura del repositorio](#1-stack-y-estructura-del-repositorio)
2. [Requisitos previos](#2-requisitos-previos)
3. [Configuración inicial (primera vez)](#3-configuración-inicial-primera-vez)
4. [Variables de entorno](#4-variables-de-entorno)
5. [Correr en desarrollo](#5-correr-en-desarrollo)
6. [Build y preview de producción](#6-build-y-preview-de-producción)
7. [Tests end-to-end (Playwright)](#7-tests-end-to-end-playwright)
8. [Git y GitHub — flujo de trabajo](#8-git-y-github--flujo-de-trabajo)
9. [Deploy a Vercel](#9-deploy-a-vercel)
10. [Sanity Studio — guía completa](#10-sanity-studio--guía-completa)
11. [Capa de datos — todas las funciones de cms.ts](#11-capa-de-datos--todas-las-funciones-de-cmsts)
12. [API Routes — todos los endpoints](#12-api-routes--todos-los-endpoints)
13. [Sistema de emails](#13-sistema-de-emails)
14. [Sistema de citas](#14-sistema-de-citas)
15. [Páginas del sitio web](#15-páginas-del-sitio-web)
16. [SEO y Layout global](#16-seo-y-layout-global)
17. [Estilos y diseño](#17-estilos-y-diseño)
18. [Cron jobs automáticos](#18-cron-jobs-automáticos)

---

## 1. Stack y estructura del repositorio

```
vipcaribbeanofficial/
├── src/                    ← Aplicación Astro (web pública)
│   ├── pages/              ← Rutas del sitio + API endpoints
│   │   ├── api/            ← Backend: email, citas, cron
│   │   └── *.astro         ← Páginas públicas
│   ├── components/         ← Componentes React y Astro
│   │   └── pages/          ← Componentes por página (React islands)
│   ├── layouts/            ← Layout global (Layout.astro)
│   ├── lib/                ← cms.ts (capa de datos Sanity)
│   └── styles/             ← global.css + tokens Tailwind
│
├── studio/                 ← Sanity Studio (admin independiente)
│   ├── plugins/            ← Herramientas personalizadas del Studio
│   │   ├── gestionCitas/   ← Panel de administración de citas
│   │   ├── importCandidatos/ ← Importador CSV/Excel de candidatos
│   │   ├── importEmpleos/  ← Importador CSV/Excel de empleos
│   │   └── enviarEmails/   ← Herramienta de envío masivo de emails
│   ├── schemaTypes/        ← Esquemas de todos los tipos de documento
│   ├── structure.ts        ← Organización del panel lateral
│   └── sanity.config.ts    ← Configuración del Studio
│
├── e2e/                    ← Tests Playwright
├── vercel.json             ← Cron jobs de Vercel
├── astro.config.mjs        ← Configuración de Astro
├── tailwind.config.ts      ← Tokens de color personalizados
└── playwright.config.ts    ← Configuración de tests
```

**Tecnologías principales:**
- **Astro 5** — framework web, `output: "static"` por defecto; las rutas con datos en tiempo real exportan `export const prerender = false`
- **React 19** — "islands" de interactividad (formularios, filtros, calendarios)
- **TypeScript**
- **Tailwind CSS 3** + **shadcn/ui** (componentes Radix UI) + **@tailwindcss/typography**
- **Sanity CMS** — toda la gestión de contenido
- **Nodemailer** — envío de emails por SMTP (Gmail o Yahoo)
- **Playwright** — tests e2e
- **Vercel** — hosting y cron jobs

---

## 2. Requisitos previos

- **Node.js** >= 18
- **pnpm** (aplicación Astro): `npm install -g pnpm`
- **npm** (Sanity Studio, dentro de `studio/`)
- Cuenta en **Sanity.io** con proyecto `97i3rge0` / dataset `production`
- Cuenta de correo Gmail o Yahoo con contraseña de aplicación (App Password)

---

## 3. Configuración inicial (primera vez)

### Aplicación Astro (raíz del repo)

```bash
pnpm install
```

Crear el archivo `.env` en la raíz (ver sección 4).

### Sanity Studio

```bash
cd studio
npm install
```

Crear el archivo `studio/.env` (ver sección 4).

---

## 4. Variables de entorno

### `.env` (raíz — aplicación Astro)

```env
# URL pública del sitio (sin slash al final)
SITE_URL=https://www.vipcaribbeanoffice.com

# Credenciales de email SMTP
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password
EMAIL_PROVIDER=gmail          # "gmail" o "yahoo"

# Sanity CMS
SANITY_PROJECT_ID=97i3rge0
SANITY_DATASET=production
SANITY_API_TOKEN=tu_token_con_permisos_de_escritura

# Secretos de seguridad
CANCEL_SECRET=una_cadena_secreta_larga   # Para cancelar citas y enviar emails masivos
CRON_SECRET=otra_cadena_secreta          # Para el cron de limpieza de citas
```

**Para desarrollo local**, `SITE_URL` no es necesaria — solo afecta metadatos SEO. El `EMAIL_PROVIDER` define qué servidor SMTP se usa. El `SANITY_API_TOKEN` requiere permisos de editor o mayor en el proyecto Sanity.

### `studio/.env` (Sanity Studio)

```env
# Debe ser EXACTAMENTE igual al CANCEL_SECRET del .env raíz
SANITY_STUDIO_CANCEL_SECRET=la_misma_cadena_secreta_que_usas_en_el_env_raiz

# URL del sitio Astro al que se llaman los endpoints
SANITY_STUDIO_SITE_URL=http://localhost:4321       # en desarrollo
# SANITY_STUDIO_SITE_URL=https://www.vipcaribbeanoffice.com  # en producción
```

> **Importante:** Antes de hacer `npm run deploy` del Studio, cambiar `SANITY_STUDIO_SITE_URL` a la URL de producción. El Studio en producción llama al endpoint de Astro para cancelar citas y enviar emails.

---

## 5. Correr en desarrollo

Abrir **dos terminales** en paralelo:

**Terminal 1 — Astro (sitio web):**
```bash
pnpm dev
# → http://localhost:4321
```

**Terminal 2 — Sanity Studio (panel admin):**
```bash
cd studio
npm run dev
# → http://localhost:3333
```

Ambos pueden correr al mismo tiempo sin conflictos. El Studio se conecta al sitio Astro local vía `SANITY_STUDIO_SITE_URL=http://localhost:4321`.

---

## 6. Build y preview de producción

```bash
# Verificar tipos TypeScript antes del build
pnpm astro check

# Compilar el sitio para producción
pnpm build
# → Genera ./dist/

# Previsualizar el build de producción localmente
pnpm preview
# → http://localhost:4321
```

```bash
# Publicar el Studio a sanity.studio (solo cuando hay cambios de esquemas o plugins)
cd studio
npm run deploy
```

---

## 7. Tests end-to-end (Playwright)

Los tests están en `e2e/` y usan **Playwright**. El servidor de desarrollo se inicia automáticamente (`playwright.config.ts` lo configura).

```bash
# Correr todos los tests (headless)
pnpm test

# Interfaz visual interactiva para depurar tests
pnpm test:ui

# Ver el último reporte HTML de tests
pnpm test:report

# Correr solo un archivo específico
pnpm test e2e/reservar-cita.spec.ts
pnpm test e2e/aplicar.spec.ts
pnpm test e2e/empleos.spec.ts
pnpm test e2e/resultados.spec.ts
```

### Descripción de los specs

| Archivo | Qué prueba |
|---|---|
| `reservar-cita.spec.ts` | Flujo completo de reserva: calendario, selección de hora, llenado del formulario, envío y confirmación. Mockea `/api/email/cita`. |
| `aplicar.spec.ts` | Formulario de aplicación de empleo: validaciones, subida de CV (PDF), envío y reset. Mockea `/api/email/aplicar`. |
| `empleos.spec.ts` | Listado y filtrado de empleos. |
| `resultados.spec.ts` | Página de resultados de pre-entrevista con filtros. |

### Cómo funcionan los mocks en los tests

Los tests usan `page.route(url, handler)` de Playwright para interceptar las llamadas a la API y devolver respuestas falsas. Esto hace los tests independientes del backend real:

```typescript
// Ejemplo: mockear el endpoint de citas para que siempre responda OK
await page.route("/api/email/cita", (route) =>
  route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ success: true }),
  })
);
```

### Truco especial para el upload de CV

React 19 en islas de Astro no responde al método estándar `setInputFiles` de Playwright. Por eso `aplicar.spec.ts` usa una función `uploadCV` que accede directamente a los React props del DOM:

```typescript
const uploadCV = async (page, file) => {
  await page.evaluate(({ name, mimeType, content }) => {
    const input = document.getElementById("cv");
    const propsKey = Object.keys(input).find((k) => k.startsWith("__reactProps$"));
    const onChange = input[propsKey]?.onChange;
    const fileObj = new File([new Uint8Array(content)], name, { type: mimeType });
    const dt = new DataTransfer();
    dt.items.add(fileObj);
    Object.defineProperty(input, "files", { value: dt.files, configurable: true });
    onChange({ target: input, currentTarget: input });
  }, { name: file.name, mimeType: file.mimeType, content: Array.from(file.buffer) });
};
```

---

## 8. Git y GitHub — flujo de trabajo

### Verificar estado actual

```bash
# Ver archivos modificados, staged y sin seguimiento
git status

# Ver diferencias de los cambios actuales
git diff

# Ver historial de commits recientes
git log --oneline -10
```

### Flujo básico: guardar y subir cambios

```bash
# 1. Agregar archivos específicos al staging
git add src/components/MiComponente.tsx
git add studio/schemaTypes/nuevoSchema.ts

# Agregar todos los cambios (verificar que no incluya .env u otros secretos)
git add .

# 2. Crear el commit
git commit -m "feat: descripción clara de qué cambió y por qué"

# 3. Subir al repositorio en GitHub
git push origin main
```

### Tipos de prefijos para mensajes de commit

| Prefijo | Cuándo usarlo |
|---|---|
| `feat:` | Nueva funcionalidad |
| `fix:` | Corrección de bug |
| `style:` | Cambios de estilos/UI sin lógica |
| `refactor:` | Reestructurar código sin cambiar comportamiento |
| `content:` | Cambios de contenido (textos, imágenes) |
| `chore:` | Cambios de configuración, dependencias |

### Crear una rama para trabajar sin afectar main

```bash
# Crear y cambiar a una nueva rama
git checkout -b nombre-de-la-rama

# Hacer cambios, commits...
git add .
git commit -m "descripción del cambio"

# Subir la rama a GitHub
git push origin nombre-de-la-rama

# Fusionar con main cuando esté listo
git checkout main
git merge nombre-de-la-rama
git push origin main
```

### Descargar cambios del repositorio remoto

```bash
# Traer y aplicar cambios del remoto
git pull origin main
```

### Ver diferencias entre ramas

```bash
git diff main..nombre-de-la-rama
```

### Deshacer cambios (con cuidado)

```bash
# Deshacer cambios de un archivo antes del staging
git checkout -- src/components/MiComponente.tsx

# Quitar un archivo del staging sin perder los cambios
git restore --staged src/components/MiComponente.tsx

# Ver commits recientes y volver a uno anterior (destructivo — pierde trabajo)
git log --oneline
git reset --hard abc1234   # reemplaza abc1234 con el hash del commit
```

---

## 9. Deploy a Vercel

El deploy a producción ocurre **automáticamente** cuando se hace `git push origin main` si el repositorio está conectado a Vercel. No se necesita ningún comando adicional.

**Variables de entorno en Vercel:** deben configurarse manualmente en el dashboard de Vercel (`Settings → Environment Variables`) con los mismos valores del `.env` raíz.

**Para el Studio:**
```bash
cd studio
# Cambiar SANITY_STUDIO_SITE_URL a la URL de producción en studio/.env
npm run deploy
# → Publica el Studio en https://vipcaribbean.sanity.studio
```

---

## 10. Sanity Studio — guía completa

El Studio se accede en `http://localhost:3333` (dev) o en `https://vipcaribbean.sanity.studio` (producción).

### Panel lateral — secciones

```
Panel de administración
├── Páginas
│   ├── 🏠 Landing Page (Inicio)     ← singleton paginaLanding
│   ├── 📞 Página de Contacto        ← singleton paginaContacto
│   ├── 👥 Quiénes Somos             ← singleton paginaQuienesSomos
│   ├── 🔻 Footer                    ← singleton footer
│   └── 🔍 SEO Global                ← singleton seoGlobal
│
├── 💼 Empleos
│   ├── 💼 Ver todos los empleos
│   ├── 📂 Categorías de Empleos
│   └── 📥 Importar desde Excel / CSV  ← plugin ImportEmpleosTool
│
├── 🚢 Líneas de Crucero
│
├── 👤 Candidatos (Pre-entrevista)
│   ├── 📋 Ver todos los candidatos
│   ├── 🏷️ Estados de candidatos
│   ├── 📥 Importar desde Excel / CSV  ← plugin ImportTool
│   ├── 📋 Listas de correo
│   └── 📧 Enviar emails a candidatos  ← plugin EnviarEmailsTool
│
├── 📅 Citas
│   ├── 📋 Ver citas por miércoles     ← plugin CitasTool
│   └── 🚫 Fechas bloqueadas
│
├── 🖼️ Eventos / Galería
│
├── 📝 Blog
│   ├── 📝 Ver todos los artículos
│   └── 📂 Categorías de Blog
│
├── 📧 Email Templates
│   ├── 📝 Email: Aplicación
│   ├── 📅 Email: Confirmación de Cita
│   └── ❌ Email: Cancelación
│
└── ❓ Preguntas Frecuentes
    ├── ❓ Ver todas las preguntas
    └── 📂 Categorías de FAQ
```

---

### Herramienta: Importar Empleos

Ubicación en el Studio: **Empleos → Importar desde Excel / CSV**

Permite subir múltiples empleos a la vez desde un archivo `.csv` o `.xlsx`.

**Columnas del archivo (el orden no importa, los nombres son flexibles):**

| Columna aceptada | Requerida | Descripción |
|---|---|---|
| `titulo` / `puesto` / `posicion` | ✅ Sí | Nombre del puesto de trabajo |
| `categoria` | No | Nombre de la categoría. Se crea automáticamente con su slug si no existe. No genera duplicados si varias filas usan el mismo nombre. |
| `cruiseLine` / `linea` / `naviera` | No | Nombre de la línea de crucero. Se crea automáticamente si no existe. |
| `salario` / `sueldo` | No | Texto libre, ej: `$1,500 USD/mes` |
| `duracion` / `contrato` / `duracionContrato` | No | Texto libre, ej: `6 meses` |
| `urgente` | No | `si`, `sí`, `yes`, `true` o `1` = urgente. Por defecto: no. |
| `bloqueado` | No | Igual que urgente. Por defecto: no. |
| `descripcion` | No | Texto plano. Se guarda como un párrafo en Portable Text. Se puede enriquecer luego en el editor del Studio. |

**Cómo funciona:**
1. Arrastra el archivo o haz clic en la zona de carga
2. Se muestra una tabla de preview con todas las filas. Las filas sin `titulo` aparecen en rojo y son omitidas
3. Haz clic en "Importar N empleos"
4. Una barra de progreso muestra el avance. El progreso persiste si navegas a otra sección y vuelves
5. El resultado final indica cuántos se importaron correctamente y cuántos fallaron
6. El slug de cada empleo se genera automáticamente desde el título (normalizado: sin tildes, minúsculas, guiones)

---

### Herramienta: Importar Candidatos

Ubicación: **Candidatos → Importar desde Excel / CSV**

Misma mecánica que el importador de empleos.

**Columnas:**

| Columna | Requerida |
|---|---|
| `nombre` / `name` / `candidato` | ✅ Sí |
| `posicion` / `cargo` / `puesto` | ✅ Sí |
| `fechaEntrevista` / `fecha` / `date` | ✅ Sí (formato `DD/MM/YYYY` o `YYYY-MM-DD`) |
| `estado` / `status` | No (por defecto: `Pendiente`) |
| `email` / `correo` | No |

El campo `estado` se crea como documento `estadoCandidato` si no existe. No genera duplicados entre filas.

---

### Herramienta: Enviar Emails

Ubicación: **Candidatos → Enviar emails a candidatos**

Envía emails personalizados en masa desde el Studio. Tiene tres modos:

**1. Listas de correo (pestaña por defecto)**
- Muestra todas las listas creadas en **Candidatos → Listas de correo**
- Al seleccionar una lista, muestra sus destinatarios en un preview
- Para enviar a todos los de esa lista, componer el email y hacer clic en Enviar

**2. Seleccionar candidatos**
- Carga todos los candidatos que tengan email registrado en Sanity
- Filtros: `estado` (Todos / Pendiente / Aprobado / Rechazado) y búsqueda por `posición`
- Checkboxes individuales o "seleccionar todos" (con estado indeterminate si hay selección parcial)

**3. Lista manual**
- Campo de texto con autocompletado — busca candidatos existentes mientras escribes
- También acepta cualquier email escrito manualmente (presionar Enter para agregar)
- Los destinatarios aparecen como etiquetas (tags) que se pueden eliminar individualmente

**Composer de email:**
- `Asunto` — requerido. Acepta variables de personalización.
- `Mensaje` — área de texto requerida. Acepta variables de personalización.
- Variables disponibles:
  - `{{nombre}}` → se reemplaza por el nombre de cada destinatario
  - `{{posicion}}` → posición del candidato
  - `{{estado}}` → estado del candidato (ej: Pendiente, Aprobado)
- El botón de envío solo se activa cuando hay destinatarios y ambos campos están llenos
- Pide confirmación antes de enviar: "¿Enviar email a N destinatarios?"

**Ejemplo de mensaje con variables:**
```
Hola {{nombre}},

Queremos informarte que tu aplicación para {{posicion}} ha sido actualizada.
Tu estado actual es: {{estado}}.

Atentamente,
VIP Caribbean
```

---

### Herramienta: Gestión de Citas

Ubicación: **Citas → Ver citas por miércoles**

- Muestra las citas agrupadas por el próximo miércoles disponible
- Filtros: Activas / Canceladas / Todas
- Botón "Cancelar cita" por cada cita: actualiza `estado = "cancelada"` en Sanity y envía email al cliente y al admin automáticamente

---

### Listas de correo

Se gestionan en **Candidatos → Listas de correo**. Cada documento tiene:
- `nombre` — nombre identificador de la lista (requerido)
- `descripcion` — descripción opcional que aparece en la herramienta de envío
- `destinatarios` — array de objetos con `email` (requerido) y `nombre` (opcional)

Se usan desde la herramienta **Enviar emails** para enviar a todos los miembros de una sola vez.

---

### Email Templates

Ubicación: **Email Templates** en el panel lateral.

Hay tres documentos con `_id` fijo:

| Documento | `_id` | Cuándo se usa |
|---|---|---|
| Email: Aplicación | `emailTemplate-aplicacion` | Cuando alguien envía un CV por `/aplicar` |
| Email: Confirmación de Cita | `emailTemplate-cita` | Cuando alguien reserva una cita |
| Email: Cancelación | `emailTemplate-cancelacion` | Cuando el admin cancela una cita desde el Studio |

Los campos `asunto` y `cuerpoHtml` soportan variables con sintaxis `{{variable}}`:

| Template | Variables disponibles |
|---|---|
| `aplicacion` | `{{nombre}}`, `{{email}}`, `{{posicion}}`, `{{telefono}}`, `{{mensaje}}` |
| `cita` | `{{nombre}}`, `{{email}}`, `{{telefono}}`, `{{fecha}}` |
| `cancelacion` | `{{appointment_date}}`, `{{appointment_time}}` |

Si el documento no existe en Sanity, el sistema usa un HTML predeterminado que está en el código de cada endpoint.

---

### SEO Global

Ubicación: **Páginas → SEO Global**

Controla los valores por defecto de SEO para todo el sitio:
- `defaultTitle` — título base de la pestaña del navegador
- `defaultDescription` — descripción para Google (recomendado 150-160 caracteres)
- `defaultOgImage` — imagen al compartir en redes sociales (recomendado 1200×630 px)
- `siteName` — nombre del sitio, usado como sufijo en páginas internas
- `keywords` — palabras clave separadas por coma

La jerarquía de SEO es: **props de la página → Sanity SEO Global → valores hardcodeados en Layout.astro**.

---

## 11. Capa de datos — todas las funciones de `cms.ts`

Todas las funciones viven en `src/lib/cms.ts`. Las de lectura usan el cliente CDN (`useCdn: true`). Las mutaciones usan `writeClient` que requiere `SANITY_API_TOKEN`.

### Empleos

```typescript
// Todos los empleos, ordenados por fecha de creación descendente
getAllEmpleos(): Promise<Empleo[]>

// Solo empleos con urgente == true
getUrgentEmpleos(): Promise<Empleo[]>

// Empleos donde bloqueado != true (para el formulario de aplicación)
getEmpleosDisponibles(): Promise<Empleo[]>

// Un empleo por slug. Retorna null si no existe
getEmpleoBySlug(slug: string): Promise<Empleo | null>

// Array de todos los slugs (para generación estática de rutas)
getAllEmpleosSlugs(): Promise<string[]>
```

Forma del objeto empleo retornado:
```typescript
{
  id: string,
  slug: string,
  titulo: string,
  descripcion: string,        // HTML string (convertido desde Portable Text)
  logoEmpleo: string | null,  // URL de la imagen
  cruiseLine: {
    nombre: string | null,
    logo: string | null,
    enlace: null
  },
  categoria: string | null,   // nombre de la categoría
  duracion_del_contrato: string | null,
  salario: string | null,
  urgente: boolean,
  bloqueado: boolean
}
```

### Blog

```typescript
// Todos los artículos, ordenados por fecha descendente
getAllBlogArticles(): Promise<Articulo[]>

// Un artículo por slug. Retorna null si no existe
getBlogArticleBySlug(slug: string): Promise<Articulo | null>

// Array de slugs para generación estática
getAllBlogArticlesSlugs(): Promise<string[]>
```

Forma del objeto artículo:
```typescript
{
  id: string,
  slug: string,
  title: string,
  image: string | null,    // URL de la imagen destacada
  excerpt: string,         // descripcionCorta
  content: string,         // HTML del contenido completo
  category: string,        // slug de categoría
  categoryLabel: string,   // nombre legible de la categoría
  readTime: string,        // ej: "5 min"
  popular: boolean,        // destacado
  orden: number,
  date: string             // ISO string
}
```

### Eventos / Galería

```typescript
// Lista de eventos para el grid de galería
getAllEventos(): Promise<Evento[]>
// Retorna: { id, slug, titulo, descripcion, fecha, lugar, portada, fotosCount, videosCount }

// Evento completo con todas sus fotos y videos
getEventoBySlug(slug: string): Promise<EventoDetalle>
// Retorna: { id, slug, titulo, descripcionCorta, fecha, lugar, images: string[], videos: string[], seoImage }

// Array de slugs para generación estática
getAllEventosSlugs(): Promise<string[]>
```

### Candidatos

```typescript
// Todos los candidatos, ordenados por fechaEntrevista descendente
getAllCandidatos(): Promise<Candidato[]>
// Retorna: { id, nombre, posicion, estado, fechaRaw }

// Candidatos con filtros opcionales
getFilteredCandidatos({ mes?, anio?, estado? }): Promise<Candidato[]>
// mes y anio son strings numéricos: "1"-"12" y "2025"
// estado es case-insensitive
```

### FAQs

```typescript
// FAQs activas, agrupadas por sección, ordenadas alfabéticamente por nombre de sección
getFaqsGrouped(): Promise<FaqCategoria[]>
```

Retorna:
```typescript
FaqCategoria = {
  key: string,           // slug de la sección
  categoria: string,     // nombre legible de la sección
  preguntas: Array<{
    id: string,
    pregunta: string,
    respuestaHtml: string,  // HTML convertido desde Portable Text
    order: number
  }>
}
```

### Páginas singleton

```typescript
// Datos de la landing page: hero, servicios, aliados, pasos del proceso, CTA
getLandingPageData(): Promise<object>

// Datos de la página de contacto: título, descripción, dirección, teléfonos, horario, email
getContactoData(): Promise<object>

// Datos de la página Quiénes Somos: hero, historia, misión/visión, valores, equipo, stats
getQuienesSomosData(): Promise<{
  hero: { title, description },
  historia: { title, html, image, badge },
  misionVision: { items: { title, description }[] },
  valores: { items: { title, description }[] },
  equipo: { members: { name, role, image }[] },
  stats: { items: { value, label }[] }
} | null>

// Datos del footer: descripción, redes sociales, dirección, teléfono, email
// Retorna en formato { acf: {...} } para compatibilidad con Footer.tsx
getPageInfo("footer"): Promise<PageInfo>

// SEO global del sitio
getSeoGlobal(): Promise<{
  defaultTitle, defaultDescription, defaultOgImage, siteName, keywords
} | null>
```

### Citas

```typescript
// Fechas completamente bloqueadas (array de strings "YYYY-MM-DD")
getBlockedDates(): Promise<string[]>

// Horarios que alcanzaron MAX_BOOKINGS_PER_SLOT=2 para una fecha dada
// Estos horarios no se muestran como disponibles en el calendario
getLockedTimesForDate(fecha: string): Promise<string[]>
// fecha: "YYYY-MM-DD"
```

### Email Templates

```typescript
// Obtiene template de Sanity. Retorna null si el documento no existe
getEmailTemplate(tipo: "aplicacion" | "cita" | "cancelacion"): Promise<{
  asunto: string,
  cuerpoHtml: string
} | null>
```

### Líneas de crucero

```typescript
// Todas las líneas de crucero, ordenadas por nombre
getAllLineasCruceros(): Promise<{ id, nombre, logo }[]>
```

---

## 12. API Routes — todos los endpoints

Todos los archivos de API tienen `export const prerender = false`.

### `POST /api/email/aplicar`

Recibe un `FormData` con los datos de una aplicación de empleo.

**Campos requeridos:** `nombre`, `email`, `telefono`, `cv` (archivo PDF o Word)
**Campos opcionales:** `posicion`, `mensaje`

**Flujo:**
1. Valida que los campos requeridos estén presentes
2. Envía email al admin (`EMAIL_USER`) con los datos del aplicante y el CV como adjunto
3. Busca el template `emailTemplate-aplicacion` en Sanity
4. Envía email de confirmación al aplicante usando el template (o HTML de fallback si no existe)

**Respuesta exitosa:** `{ success: true }` con status 200
**Error de validación:** `{ message: "Datos incompletos" }` con status 400

---

### `POST /api/email/cita`

Crea una nueva reserva de cita.

**Body JSON:**
```json
{
  "nombre": "María García",
  "email": "maria@example.com",
  "telefono": "8091234567",
  "fecha": "miércoles, 11 de junio de 2025",
  "dateISO": "2025-06-11",
  "time": "9:00 AM"
}
```

**Flujo:**
1. Valida que todos los campos estén presentes
2. Llama a `getLockedTimesForDate(dateISO)` — si el horario ya está lleno responde `409` con `{ code: "TIME_TAKEN" }`
3. Crea documento `cita` en Sanity via `writeClient` con `estado: "activa"`
4. Envía email de notificación al admin
5. Busca template `emailTemplate-cita` en Sanity, envía confirmación al usuario

**Respuesta exitosa:** `{ success: true }` con status 200

---

### `POST /api/email/cancelar-cita`

Cancela una cita existente. Llamado desde `CitasTool` en el Studio.

**Headers requeridos:**
- `x-cancel-secret: <valor de CANCEL_SECRET>`
- `Content-Type: application/json`

**CORS:** Solo acepta peticiones desde `https://vipcaribbean.sanity.studio` y `http://localhost:3333`.

**Body JSON:**
```json
{
  "name": "María García",
  "email": "maria@example.com",
  "appointment_date": "miércoles, 11 de junio",
  "appointment_time": "9:00 AM",
  "citaId": "_id_del_documento_en_sanity"
}
```

**Flujo:**
1. Verifica el header `x-cancel-secret` contra `CANCEL_SECRET`
2. Si hay `citaId`, actualiza `cita.estado = "cancelada"` en Sanity
3. Envía email al admin y al cliente en paralelo
4. Usa template `emailTemplate-cancelacion` o HTML fallback

**Respuesta exitosa:** `{ success: true }` con status 200

---

### `POST /api/email/candidatos-bulk`

Envío masivo de emails personalizado. Llamado desde `EnviarEmailsTool` en el Studio.

**Headers requeridos:** `x-cancel-secret: <CANCEL_SECRET>`, `Content-Type: application/json`

**CORS:** Mismo allowlist que `cancelar-cita.ts`.

**Body JSON:**
```json
{
  "recipients": [
    {
      "email": "candidato@ejemplo.com",
      "nombre": "Juan Pérez",
      "posicion": "Waiter",
      "estado": "pendiente"
    }
  ],
  "asunto": "Actualización para {{nombre}}",
  "cuerpo": "Hola {{nombre}},\n\nTu posición es {{posicion}} y tu estado es {{estado}}."
}
```

**Flujo:** Itera sobre `recipients`, reemplaza `{{nombre}}`, `{{posicion}}`, `{{estado}}` en asunto y cuerpo para cada uno, y envía un email individual. El cuerpo de texto plano se convierte a HTML (cada línea en un `<p>`).

**Respuesta:** `{ success: true, sent: N, errors: M }` con status 200

---

### `GET /api/blocked-dates`

Retorna las fechas bloqueadas para el calendario de citas.

**Respuesta:** `["2025-06-11", "2025-06-18", ...]`

---

### `GET /api/locked-times?date=YYYY-MM-DD`

Retorna los horarios completos (con 2 reservas) para una fecha.

**Query param requerido:** `date` en formato `YYYY-MM-DD`

**Respuesta:** `["9:00 AM", "9:05 AM", ...]`

---

### `GET /api/cron/cleanup-citas`

Limpia citas del miércoles anterior. Solo Vercel puede llamar este endpoint en producción.

**Header requerido:** `Authorization: Bearer <CRON_SECRET>`

**Para probar manualmente en desarrollo:**
```bash
curl -H "Authorization: Bearer tu_cron_secret" http://localhost:4321/api/cron/cleanup-citas
```

**Respuesta:** `{ success: true, fecha: "YYYY-MM-DD", deleted: N }`

---

## 13. Sistema de emails

### Configuración del transporter (`_mailer.ts`)

Usa **Nodemailer** con SMTP. El proveedor se define con `EMAIL_PROVIDER`:
- `gmail` → `smtp.gmail.com:587` con STARTTLS
- `yahoo` → `smtp.mail.yahoo.com:587` con STARTTLS

Para Gmail se necesita una **App Password** (no la contraseña normal). Se genera en `myaccount.google.com → Seguridad → Contraseñas de aplicaciones`. La cuenta debe tener verificación en dos pasos activada.

### Template engine

Todos los templates usan la misma función de sustitución `{{variable}}`:
```typescript
function applyVars(template: string, vars: Record<string, string>) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}
```

Si la variable no existe en `vars`, se reemplaza por cadena vacía. Los espacios alrededor del nombre de variable son opcionales (`{{ nombre }}` y `{{nombre}}` son equivalentes).

### Lógica de fallback

Para cada email transaccional, el sistema intenta cargar el template de Sanity. Si el documento no existe o hay un error al cargarlo, usa HTML hardcodeado como fallback. Esto garantiza que los emails se envíen aunque el Studio no tenga los templates configurados.

---

## 14. Sistema de citas

### Lógica del calendario

Solo está disponible **el próximo miércoles** como día de cita. Este cálculo se hace en el cliente React (`ReservarCita.tsx`) sin llamadas a la API:

```typescript
const nextWednesday = () => {
  const today = new Date();
  const day = today.getDay(); // 0=Dom, 3=Mié
  const daysUntilWednesday = (3 - day + 7) % 7 || 7;
  const next = new Date(today);
  next.setDate(today.getDate() + daysUntilWednesday);
  return next;
};
```

Si hoy es miércoles, devuelve el próximo miércoles (no hoy).

### Horarios disponibles

- Rango: **9:00 AM – 12:00 PM**
- Intervalo: cada **5 minutos**
- Total: 37 slots por miércoles
- Los horarios están hardcodeados en `ReservarCita.tsx`

### Control de concurrencia (doble reserva)

`MAX_BOOKINGS_PER_SLOT = 2` — dos personas pueden reservar el mismo horario. Al llegar a 2 reservas activas, ese slot desaparece de los disponibles. La lógica está en `getLockedTimesForDate()`:

```typescript
// Cuenta cuántas citas activas hay por horario
// Si count >= 2, ese horario está "locked"
const counts: Record<string, number> = {};
for (const r of results) {
  if (r.hora) counts[r.hora] = (counts[r.hora] ?? 0) + 1;
}
return Object.entries(counts)
  .filter(([, count]) => count >= MAX_BOOKINGS_PER_SLOT)
  .map(([hora]) => hora);
```

### Ciclo de vida de una cita

1. **Reserva:** usuario completa el formulario → se crea `{ _type: "cita", estado: "activa" }` en Sanity
2. **Cancelación:** admin hace clic en "Cancelar" en `CitasTool` → `estado` cambia a `"cancelada"` + email al cliente
3. **Limpieza:** cada jueves a las 4:00 AM UTC, el cron borra todas las citas del miércoles anterior (activas y canceladas)

### Fechas bloqueadas

Se gestionan en **Citas → Fechas bloqueadas** en el Studio. Un documento `fechaBloqueada` es simplemente una fecha `YYYY-MM-DD`. Si esa fecha coincide con el próximo miércoles, el calendario no muestra ningún día disponible y el usuario ve un mensaje indicando que no hay citas disponibles.

---

## 15. Páginas del sitio web

| URL | Componente principal | Datos que carga |
|---|---|---|
| `/` | `HeroV20`, `UrgentJobs`, `AppointmentSection`, `Services`, `Partners`, `Process`, `CTA` | `getLandingPageData()`, `getUrgentEmpleos()` |
| `/empleos` | `Empleos.tsx` — listado con filtros por categoría | `getAllEmpleos()` |
| `/empleos/[slug]` | `EmpleoDetalle.tsx` — detalle con botón Aplicar | `getEmpleoBySlug(slug)` |
| `/aplicar` | `Aplicar.tsx` — formulario con upload de CV | `getEmpleosDisponibles()` (para el select de posición) |
| `/blog` | `Blog.tsx` — grid con filtros por categoría | `getAllBlogArticles()` |
| `/blog/[slug]` | `BlogDetalle.tsx` — artículo completo | `getBlogArticleBySlug(slug)` |
| `/galeria` | `GaleriaEventos.tsx` — grid de eventos | `getAllEventos()` |
| `/galeria/[slug]` | `EventoDetalle.tsx` — fotos y videos | `getEventoBySlug(slug)` |
| `/reservar-cita` | `ReservarCita.tsx` — calendario + formulario | `/api/blocked-dates`, `/api/locked-times` |
| `/resultados` | `ResultadosPreEntrevista.tsx` — tabla con filtros | `getAllCandidatos()` |
| `/contacto` | `Contacto.tsx` | `getContactoData()` |
| `/quienes-somos` | `QuienesSomos.tsx` | `getQuienesSomosData()` |
| `/faq` | `PreguntasFrecuentes.tsx` — acordeón | `getFaqsGrouped()` |
| `/404` | `NotFound.tsx` | — |

### Variantes del Hero

Hay 20 variantes en `src/components/HeroV1.tsx` a `HeroV20.tsx`. La variante activa se controla en `src/pages/index.astro`. Para cambiarla, editar ese archivo y descomentar la línea del import deseado:

```astro
// Activo actualmente:
import Hero from "@/components/HeroV20";

// Para cambiar, comentar la línea de arriba y descomentar una de estas:
// import Hero from "@/components/HeroV12"; // Cinematic Center — heading colosal centrado
// import Hero from "@/components/HeroV11"; // Command Dark — navy sólido con diagonal
// import Hero from "@/components/HeroV7";  // Editorial Magazine — tipografía masiva
```

Todas las variantes aceptan el mismo objeto `data` con los campos de `paginaLanding`.

---

## 16. SEO y Layout global

El layout `src/layouts/Layout.astro` se aplica a todas las páginas y gestiona:

- Meta tags (`title`, `description`, `robots`, `keywords`)
- Open Graph (redes sociales)
- Twitter Card
- Favicons y manifest PWA
- Google Fonts: **Plus Jakarta Sans** y **Outfit**
- Astro View Transitions (animaciones de navegación entre páginas)
- Vercel Analytics y Speed Insights
- Schema.org `Organization` JSON-LD

**Props que acepta el Layout:**
```astro
<Layout
  title="Título personalizado de esta página"
  description="Descripción específica de esta página"
  ogImage="https://example.com/imagen.jpg"
  noindex={false}  // true para excluir del índice de Google
>
```

**Jerarquía SEO** (mayor prioridad primero):
1. Props `title`, `description`, `ogImage` pasados por cada página
2. Campos del documento `seoGlobal` en Sanity
3. Valores hardcodeados en `Layout.astro` como último fallback

---

## 17. Estilos y diseño

**Colores personalizados** definidos en `tailwind.config.ts`:

| Token | Clase Tailwind | Uso |
|---|---|---|
| `coral` | `bg-coral`, `text-coral` | Acento principal, botones CTA |
| `navy` | `bg-navy`, `text-navy` | Fondo oscuro, headers |
| `ocean` | `bg-ocean`, `text-ocean` | Azul secundario |
| `warm-white` | `bg-warm-white` | Fondo claro cálido |
| `soft-gray` | `bg-soft-gray` | Bordes y superficies sutiles |

**Variables CSS de shadcn/ui** en `src/styles/global.css`:
`--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, `--radius`, y sus variantes. Se usan con `bg-background`, `text-foreground`, etc.

**Renderizado de Portable Text** — siempre se convierte a HTML string con `blocksToHtml()` antes de pasarlo a los componentes. Los componentes usan `dangerouslySetInnerHTML`:

```tsx
// Para componentes de blog con estilos de tipografía completos:
<div className="prose prose-lg prose-headings:text-foreground prose-a:text-inherit prose-a:no-underline">
  <div dangerouslySetInnerHTML={{ __html: content }} />
</div>

// Para secciones donde el contenedor tiene color de texto muted,
// los headings necesitan override explícito:
<div className="[&_h2]:text-foreground [&_h3]:text-foreground [&_a]:text-inherit [&_a]:no-underline"
     dangerouslySetInnerHTML={{ __html: html }} />
```

---

## 18. Cron jobs automáticos

Configurado en `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-citas",
      "schedule": "0 4 * * 4"
    }
  ]
}
```

- **Cuándo corre:** Todos los **jueves a las 4:00 AM UTC** = 12:00 AM hora dominicana (UTC-4)
- **Qué hace:** Borra todas las citas del miércoles anterior (el día de ayer cuando corre el jueves)
- **Autenticación:** Vercel inyecta automáticamente `Authorization: Bearer {CRON_SECRET}` en la petición. El endpoint lo verifica antes de ejecutar
- **Logs:** Disponibles en el dashboard de Vercel → Functions → Logs

**Para probar el cron manualmente:**
```bash
# En desarrollo local
curl -H "Authorization: Bearer tu_cron_secret" http://localhost:4321/api/cron/cleanup-citas

# En producción (desde terminal con acceso a las variables de entorno)
curl -H "Authorization: Bearer $CRON_SECRET" https://www.vipcaribbeanoffice.com/api/cron/cleanup-citas
```
