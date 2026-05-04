import { defineType, defineField } from "sanity";

export const candidato = defineType({
  name: "candidato",
  title: "Candidatos",
  type: "document",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre completo",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "email",
      title: "Correo electrónico",
      type: "string",
    }),
    defineField({
      name: "posicion",
      title: "Posición aplicada",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "estado",
      title: "Estado",
      type: "reference",
      to: [{ type: "estadoCandidato" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "fechaEntrevista",
      title: "Fecha de entrevista",
      type: "date",
      options: { dateFormat: "DD/MM/YYYY" },
      validation: (R) => R.required(),
    }),
  ],
  // Ordena por fecha descendente en el listado del Studio
  orderings: [
    {
      title: "Fecha (más reciente)",
      name: "fechaDesc",
      by: [{ field: "fechaEntrevista", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "nombre",
      subtitle: "posicion",
      estadoNombre: "estado.nombre",
      fecha: "fechaEntrevista",
    },
    prepare({ title, subtitle, estadoNombre, fecha }) {
      return {
        title,
        subtitle: `${subtitle} · ${estadoNombre ?? "Sin estado"} — ${fecha ?? "Sin fecha"}`,
      };
    },
  },
});
