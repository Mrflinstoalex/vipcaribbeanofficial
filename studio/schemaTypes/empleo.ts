import { defineType, defineField } from "sanity";

export const empleo = defineType({
  name: "empleo",
  title: "Empleos",
  type: "document",
  fields: [
    defineField({
      name: "titulo",
      title: "Título del puesto",
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
      name: "descripcion",
      title: "Descripción completa",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Título", value: "h3" },
          ],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
          },
        },
      ],
    }),
    defineField({
      name: "logoEmpleo",
      title: "Logo del empleo",
      type: "image",
      options: { hotspot: false },
    }),
    defineField({
      name: "cruiseLine",
      title: "Línea de crucero",
      type: "reference",
      to: [{ type: "lineaCrucero" }],
    }),
    defineField({
      name: "categoria",
      title: "Categoría",
      type: "reference",
      to: [{ type: "empleoCategoria" }],
      description: "Selecciona la categoría a la que pertenece este puesto.",
    }),
    defineField({
      name: "duracionContrato",
      title: "Duración del contrato",
      type: "string",
      description: "Ej: 6 meses, 4-6 meses",
    }),
    defineField({
      name: "urgente",
      title: "¿Posición urgente?",
      type: "boolean",
      initialValue: false,
      description: "Aparecerá destacada en la sección de empleos urgentes.",
    }),
  ],
  preview: {
    select: {
      title: "titulo",
      subtitle: "cruiseLine.nombre",
      categoria: "categoria.nombre",
      media: "logoEmpleo",
      urgente: "urgente",
    },
    prepare({ title, subtitle, categoria, media, urgente }) {
      return {
        title: urgente ? `🔴 ${title}` : title,
        subtitle: [subtitle, categoria].filter(Boolean).join(" · ") || "Sin línea asignada",
        media,
      };
    },
  },
});
