import { defineType, defineField } from "sanity";

export const paginaLanding = defineType({
  name: "paginaLanding",
  title: "Landing Page (Inicio)",
  type: "document",
  __experimental_actions: ["update", "publish"],
  groups: [
    { name: "hero",     title: "Hero" },
    { name: "servicios", title: "Servicios" },
    { name: "aliados",  title: "Aliados" },
    { name: "proceso",  title: "Cómo Funciona" },
    { name: "cta",      title: "CTA" },
  ],
  fields: [
    // ── HERO ──────────────────────────────────────────────────────────────
    defineField({ group: "hero", name: "hero_title",    title: "Título principal",   type: "string" }),
    defineField({ group: "hero", name: "hero_subtitle", title: "Subtítulo",          type: "text", rows: 2 }),
    defineField({
      group: "hero",
      name: "hero_media_type",
      title: "Tipo de media",
      type: "string",
      options: {
        list: [
          { title: "Imagen", value: "image" },
          { title: "Video",  value: "video" },
        ],
        layout: "radio",
      },
      initialValue: "image",
    }),
    defineField({ group: "hero", name: "hero_image", title: "Imagen del hero",  type: "image", options: { hotspot: true } }),
    defineField({ group: "hero", name: "hero_video", title: "Video del hero (URL)", type: "url",
      description: "Solo si el tipo de media es Video.",
      hidden: ({ document }) => document?.hero_media_type !== "video",
    }),
    defineField({ group: "hero", name: "hero_rating",              title: "Rating (ej: 4.9)",              type: "string" }),
    defineField({ group: "hero", name: "hero_reviews",             title: "Nº de reseñas (ej: 200+)",      type: "string" }),
    defineField({ group: "hero", name: "hero_numero_de_empleados", title: "Nº de empleados colocados",     type: "string" }),
    defineField({ group: "hero", name: "hero_lineas_de_crucero",   title: "Nº de líneas de crucero",       type: "string" }),
    defineField({ group: "hero", name: "hero_linea_de_cruceros_proxima_contratacion", title: "Próxima línea en contratar", type: "string" }),
    defineField({ group: "hero", name: "hero_proxima_contratacion_fecha",             title: "Fecha de próxima contratación", type: "string",
      description: "Ej: Mayo 2025",
    }),

    // ── SERVICIOS ─────────────────────────────────────────────────────────
    defineField({ group: "servicios", name: "nuestro_servicios_titulo",      title: "Título de la sección",      type: "string" }),
    defineField({ group: "servicios", name: "nuestro_servicios_descripcion", title: "Descripción de la sección", type: "text", rows: 2 }),
    defineField({
      group: "servicios",
      name: "servicios",
      title: "Servicios (6 items)",
      type: "array",
      validation: (R) => R.max(6),
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "titulo",      title: "Título",      type: "string" }),
            defineField({ name: "descripcion", title: "Descripción", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "titulo" } },
        },
      ],
    }),

    // ── ALIADOS ───────────────────────────────────────────────────────────
    defineField({ group: "aliados", name: "nuestros_aliados_titulo",      title: "Título de la sección",      type: "string" }),
    defineField({ group: "aliados", name: "nuestros_aliados_descripcion", title: "Descripción de la sección", type: "text", rows: 2 }),
    defineField({
      group: "aliados",
      name: "aliados",
      title: "Aliados / Líneas de crucero",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "nombre", title: "Nombre", type: "string" }),
            defineField({ name: "logo",   title: "Logo",   type: "image" }),
          ],
          preview: { select: { title: "nombre", media: "logo" } },
        },
      ],
    }),

    // ── PROCESO ───────────────────────────────────────────────────────────
    defineField({ group: "proceso", name: "como_funciona_titulo",       title: "Título de la sección",      type: "string" }),
    defineField({ group: "proceso", name: "como_funciona_description",  title: "Descripción de la sección", type: "text", rows: 2 }),
    defineField({
      group: "proceso",
      name: "pasos",
      title: "Pasos del proceso (4 pasos)",
      type: "array",
      validation: (R) => R.max(4),
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "titulo",      title: "Título del paso",      type: "string" }),
            defineField({ name: "descripcion", title: "Descripción del paso", type: "text", rows: 2 }),
          ],
          preview: { select: { title: "titulo" } },
        },
      ],
    }),

    // ── CTA ───────────────────────────────────────────────────────────────
    defineField({ group: "cta", name: "cta_titulo",      title: "Título del CTA",      type: "string" }),
    defineField({ group: "cta", name: "cta_descripcion", title: "Descripción del CTA", type: "text", rows: 2 }),
    defineField({ group: "cta", name: "cta_phone",       title: "Teléfono del CTA",    type: "string" }),
    defineField({ group: "cta", name: "cta_email",       title: "Email del CTA",       type: "string" }),
  ],
  preview: {
    prepare: () => ({ title: "Landing Page (Inicio)" }),
  },
});
