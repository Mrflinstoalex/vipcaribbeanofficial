import { defineType, defineField } from "sanity";

export const evento = defineType({
  name: "evento",
  title: "Eventos / Galería",
  type: "document",
  fields: [
    defineField({
      name: "titulo",
      title: "Título del evento",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (URL)",
      type: "slug",
      options: { source: "titulo" },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "descripcionCorta",
      title: "Descripción corta",
      type: "text",
      rows: 3,
      description: "Aparece en la tarjeta del evento en la galería.",
    }),
    defineField({
      name: "fecha",
      title: "Fecha del evento",
      type: "date",
      options: { dateFormat: "DD/MM/YYYY" },
    }),
    defineField({
      name: "lugar",
      title: "Lugar",
      type: "string",
    }),
    defineField({
      name: "galeria",
      title: "Galería de fotos",
      type: "array",
      // Drag & drop de múltiples imágenes directamente en el Studio
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Texto alternativo",
              type: "string",
            },
          ],
        },
      ],
      options: { layout: "grid" },
    }),
    defineField({
      name: "videos",
      title: "Videos (URLs)",
      type: "array",
      of: [{ type: "url" }],
      description: "URLs de videos de YouTube, Vimeo, etc.",
    }),
  ],
  preview: {
    select: {
      title: "titulo",
      subtitle: "fecha",
      media: "galeria.0",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ?? "Sin fecha",
        media,
      };
    },
  },
});
