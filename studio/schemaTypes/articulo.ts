import { defineType, defineField } from "sanity";

export const articulo = defineType({
  name: "articulo",
  title: "Blog",
  type: "document",
  fields: [
    defineField({
      name: "titulo",
      title: "Título",
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
      name: "fecha",
      title: "Fecha de publicación",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "imagen",
      title: "Imagen destacada",
      type: "image",
      options: { hotspot: true },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "categoria",
      title: "Categoría",
      type: "reference",
      to: [{ type: "articuloCategoria" }],
      description: "Selecciona la categoría a la que pertenece este artículo.",
    }),
    defineField({
      name: "tiempoLectura",
      title: "Tiempo de lectura",
      type: "string",
      description: "Ej: 5 min",
    }),
    defineField({
      name: "descripcionCorta",
      title: "Descripción corta (excerpt)",
      type: "text",
      rows: 3,
      description: "Aparece en la tarjeta del artículo en el listado.",
    }),
    defineField({
      name: "descripcionLarga",
      title: "Contenido completo",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Título H2", value: "h2" },
            { title: "Título H3", value: "h3" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
          },
        },
        // Permite insertar imágenes dentro del artículo
        {
          type: "image",
          options: { hotspot: true },
          fields: [{ name: "alt", title: "Texto alternativo", type: "string" }],
        },
      ],
    }),
    defineField({
      name: "destacado",
      title: "¿Artículo destacado?",
      type: "boolean",
      initialValue: false,
      description: "Aparece en la sección de artículos populares.",
    }),
    defineField({
      name: "ordenDestacado",
      title: "Orden (si es destacado)",
      type: "number",
      hidden: ({ document }) => !document?.destacado,
    }),
  ],
  preview: {
    select: {
      title: "titulo",
      subtitle: "categoria.nombre",
      media: "imagen",
      destacado: "destacado",
    },
    prepare({ title, subtitle, media, destacado }) {
      return {
        title: destacado ? `⭐ ${title}` : title,
        subtitle: subtitle ?? "Sin categoría",
        media,
      };
    },
  },
});
