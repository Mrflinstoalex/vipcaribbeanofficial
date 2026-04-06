import { defineType, defineField } from "sanity";

/**
 * Reemplaza el parser de Cheerio (src/lib/parsers/quienesSomos.ts).
 * El contenido ahora es estructurado en lugar de HTML parseado.
 */
export const paginaQuienesSomos = defineType({
  name: "paginaQuienesSomos",
  title: "Página: Quiénes Somos",
  type: "document",
  __experimental_actions: ["update", "publish"],
  groups: [
    { name: "hero",        title: "Hero" },
    { name: "historia",    title: "Nuestra Historia" },
    { name: "mision",      title: "Misión y Visión" },
    { name: "valores",     title: "Valores" },
    { name: "equipo",      title: "Equipo" },
    { name: "stats",       title: "Estadísticas" },
  ],
  fields: [
    // ── HERO ──────────────────────────────────────────────────────────────
    defineField({ group: "hero", name: "hero_titulo",      title: "Título",      type: "string" }),
    defineField({ group: "hero", name: "hero_descripcion", title: "Descripción", type: "text", rows: 3 }),

    // ── HISTORIA ──────────────────────────────────────────────────────────
    defineField({
      group: "historia",
      name: "historia_contenido",
      title: "Texto de la historia",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      group: "historia",
      name: "historia_imagen",
      title: "Imagen",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      group: "historia",
      name: "historia_fundador_nombre",
      title: "Nombre del fundador",
      type: "string",
      description: "Ej: Alfio Musumeci",
    }),
    defineField({
      group: "historia",
      name: "historia_fundador_rol",
      title: "Rol del fundador",
      type: "string",
      description: "Ej: Fundador",
    }),

    // ── MISIÓN / VISIÓN ───────────────────────────────────────────────────
    defineField({
      group: "mision",
      name: "mision_vision",
      title: "Misión y Visión",
      type: "array",
      validation: (R) => R.max(2),
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "titulo",      title: "Título (Misión / Visión)", type: "string" }),
            defineField({ name: "descripcion", title: "Descripción",              type: "text", rows: 3 }),
          ],
          preview: { select: { title: "titulo" } },
        },
      ],
    }),

    // ── VALORES ───────────────────────────────────────────────────────────
    defineField({
      group: "valores",
      name: "valores",
      title: "Valores",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "titulo",      title: "Nombre del valor",  type: "string" }),
            defineField({ name: "descripcion", title: "Descripción",        type: "text", rows: 2 }),
          ],
          preview: { select: { title: "titulo" } },
        },
      ],
    }),

    // ── EQUIPO ────────────────────────────────────────────────────────────
    defineField({
      group: "equipo",
      name: "equipo",
      title: "Miembros del equipo",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "nombre", title: "Nombre",  type: "string" }),
            defineField({ name: "rol",    title: "Rol",     type: "string" }),
            defineField({ name: "imagen", title: "Foto",    type: "image", options: { hotspot: true } }),
          ],
          preview: {
            select: { title: "nombre", subtitle: "rol", media: "imagen" },
          },
        },
      ],
    }),

    // ── ESTADÍSTICAS ──────────────────────────────────────────────────────
    defineField({
      group: "stats",
      name: "stats",
      title: "Estadísticas",
      type: "array",
      description: "Ej: 500+ empleados colocados, 10 líneas de crucero, etc.",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "valor",  title: "Valor (ej: 500+)", type: "string" }),
            defineField({ name: "etiqueta", title: "Etiqueta (ej: Empleados colocados)", type: "string" }),
          ],
          preview: {
            select: { title: "valor", subtitle: "etiqueta" },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Quiénes Somos" }),
  },
});
