import { defineType, defineField } from "sanity";

export const estadoCandidato = defineType({
  name: "estadoCandidato",
  title: "Estados de candidatos",
  type: "document",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre del estado",
      type: "string",
      validation: (R) => R.required(),
    }),
  ],
  preview: {
    select: { title: "nombre" },
  },
});
