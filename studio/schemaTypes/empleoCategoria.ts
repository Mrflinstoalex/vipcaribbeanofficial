import { defineType, defineField } from "sanity";

export const empleoCategoria = defineType({
  name: "empleoCategoria",
  title: "Categorías de Empleos",
  type: "document",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre de la categoría",
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
