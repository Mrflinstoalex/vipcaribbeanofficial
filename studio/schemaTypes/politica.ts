import { defineType, defineField } from "sanity";

export const politica = defineType({
  name: "politica",
  title: "Políticas",
  type: "document",
  fields: [
    defineField({
      name: "titulo",
      title: "Título",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "resumen",
      title: "Resumen (visible en la card)",
      type: "text",
      rows: 2,
      description: "Descripción corta que aparece en la card. Máx. 150 caracteres.",
      validation: (R) => R.required().max(150),
    }),
    defineField({
      name: "icono",
      title: "Icono (emoji)",
      type: "string",
      description: "Emoji opcional para la card. Ej: 🔒, 📋, ✅, 🤝",
    }),
    defineField({
      name: "contenido",
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
              { title: "Negrita", value: "strong" },
              { title: "Itálica", value: "em" },
            ],
          },
        },
      ],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "orden",
      title: "Orden de aparición",
      type: "number",
      description: "Número para controlar el orden. 1 aparece primero.",
      initialValue: 99,
    }),
  ],
  preview: {
    select: {
      title: "titulo",
      subtitle: "resumen",
      icono: "icono",
    },
    prepare({ title, subtitle, icono }) {
      return {
        title: icono ? `${icono} ${title}` : title,
        subtitle,
      };
    },
  },
});
