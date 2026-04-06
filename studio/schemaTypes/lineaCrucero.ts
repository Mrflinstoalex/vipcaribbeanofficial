import { defineType, defineField } from "sanity";

export const lineaCrucero = defineType({
  name: "lineaCrucero",
  title: "Líneas de Crucero",
  type: "document",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre",
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
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: false },
    }),
  ],
  preview: {
    select: { title: "nombre", media: "logo" },
  },
});
