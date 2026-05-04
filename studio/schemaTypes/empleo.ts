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
      name: "salario",
      title: "Salario",
      type: "string",
      description: "Ej: $1,500 USD/mes, Negociable, $800 - $1,200 USD",
    }),
    defineField({
      name: "urgente",
      title: "¿Posición urgente?",
      type: "boolean",
      initialValue: false,
      description: "Aparecerá destacada en la sección de empleos urgentes.",
    }),
    defineField({
      name: "bloqueado",
      title: "¿Posición bloqueada?",
      type: "boolean",
      initialValue: false,
      description: "La vacante seguirá visible pero los candidatos no podrán aplicar a ella. Tampoco aparecerá en el formulario de aplicación.",
    }),
  ],
  preview: {
    select: {
      title: "titulo",
      subtitle: "cruiseLine.nombre",
      categoria: "categoria.nombre",
      media: "logoEmpleo",
      urgente: "urgente",
      bloqueado: "bloqueado",
    },
    prepare({ title, subtitle, categoria, media, urgente, bloqueado }) {
      const prefix = bloqueado ? "🚫" : urgente ? "🔴" : "";
      return {
        title: prefix ? `${prefix} ${title}` : title,
        subtitle: [subtitle, categoria].filter(Boolean).join(" · ") || "Sin línea asignada",
        media,
      };
    },
  },
});
