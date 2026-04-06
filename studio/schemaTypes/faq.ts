import { defineType, defineField } from "sanity";

export const faqCategoria = defineType({
  name: "faqCategoria",
  title: "Categorías de FAQ",
  type: "document",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre de la sección",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "nombre" },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "orden",
      title: "Orden de aparición",
      type: "number",
      initialValue: 0,
    }),
  ],
  preview: {
    select: { title: "nombre", subtitle: "orden" },
    prepare({ title, subtitle }) {
      return { title, subtitle: `Orden: ${subtitle ?? 0}` };
    },
  },
});

export const faq = defineType({
  name: "faq",
  title: "Preguntas Frecuentes",
  type: "document",
  fields: [
    defineField({
      name: "pregunta",
      title: "Pregunta",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "respuesta",
      title: "Respuesta",
      type: "array",
      of: [
        {
          type: "block",
          styles: [{ title: "Normal", value: "normal" }],
          marks: {
            decorators: [
              { title: "Bold", value: "strong" },
              { title: "Italic", value: "em" },
            ],
          },
        },
      ],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "seccion",
      title: "Sección",
      type: "reference",
      to: [{ type: "faqCategoria" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "orden",
      title: "Orden dentro de la sección",
      type: "number",
      initialValue: 0,
    }),
    defineField({
      name: "activa",
      title: "¿Activa?",
      type: "boolean",
      initialValue: true,
      description: "Las FAQs inactivas no se muestran en el sitio.",
    }),
  ],
  preview: {
    select: {
      title: "pregunta",
      subtitle: "seccion.nombre",
      activa: "activa",
    },
    prepare({ title, subtitle, activa }) {
      return {
        title: activa ? title : `⚫ ${title}`,
        subtitle: subtitle ?? "Sin sección",
      };
    },
  },
});
