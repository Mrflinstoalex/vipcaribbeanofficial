import { defineType, defineField } from "sanity";

export const aplicacionWeb = defineType({
  name: "aplicacionWeb",
  title: "Aplicaciones Web",
  type: "document",
  fields: [
    defineField({
      name: "email",
      title: "Correo electrónico",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "telefono",
      title: "Teléfono",
      type: "string",
    }),
    defineField({
      name: "nombre",
      title: "Nombre completo",
      type: "string",
    }),
    defineField({
      name: "posicion",
      title: "Posición aplicada",
      type: "string",
    }),
    defineField({
      name: "fechaAplicacion",
      title: "Fecha de aplicación",
      type: "datetime",
    }),
  ],
  orderings: [
    {
      title: "Fecha (más reciente)",
      name: "fechaDesc",
      by: [{ field: "fechaAplicacion", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "nombre",
      subtitle: "email",
      fecha: "fechaAplicacion",
    },
    prepare({ title, subtitle, fecha }) {
      const date = fecha
        ? new Date(fecha).toLocaleDateString("es-DO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })
        : "Sin fecha";
      return {
        title: title ?? subtitle,
        subtitle: `${subtitle} — ${date}`,
      };
    },
  },
});
