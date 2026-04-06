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
      name: "posicion",
      title: "Posición aplicada",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "estado",
      title: "Estado",
      type: "string",
      options: {
        list: [
          { title: "Pendiente",  value: "pendiente" },
          { title: "Aprobado",   value: "aprobado" },
          { title: "Rechazado",  value: "rechazado" },
        ],
        layout: "radio",
      },
      initialValue: "pendiente",
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
      estado: "estado",
      fecha: "fechaEntrevista",
    },
    prepare({ title, subtitle, estado, fecha }) {
      const badge =
        estado === "aprobado" ? "✅" : estado === "rechazado" ? "❌" : "⏳";
      return {
        title: `${badge} ${title}`,
        subtitle: `${subtitle} — ${fecha ?? "Sin fecha"}`,
      };
    },
  },
});
