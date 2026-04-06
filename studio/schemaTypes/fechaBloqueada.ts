import { defineField, defineType } from "sanity";

export const fechaBloqueada = defineType({
  name: "fechaBloqueada",
  title: "Fecha Bloqueada",
  type: "document",
  fields: [
    defineField({
      name: "fecha",
      title: "Fecha (miércoles a bloquear)",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "motivo",
      title: "Motivo",
      type: "string",
      description: 'Ej: "Feriado", "Emergencia"',
    }),
  ],
  preview: {
    select: {
      fecha: "fecha",
      motivo: "motivo",
    },
    prepare({ fecha, motivo }) {
      return {
        title: fecha ?? "Sin fecha",
        subtitle: motivo ?? "",
      };
    },
  },
});
