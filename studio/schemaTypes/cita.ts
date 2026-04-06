import { defineField, defineType } from "sanity";

export const cita = defineType({
  name: "cita",
  title: "Cita",
  type: "document",
  orderings: [
    {
      title: "Fecha (más reciente primero)",
      name: "fechaDesc",
      by: [{ field: "fecha", direction: "desc" }],
    },
  ],
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "telefono",
      title: "Teléfono",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "fecha",
      title: "Fecha",
      type: "date",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "hora",
      title: "Hora",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "estado",
      title: "Estado",
      type: "string",
      options: {
        list: [
          { title: "Activa", value: "activa" },
          { title: "Cancelada", value: "cancelada" },
        ],
        layout: "radio",
      },
      initialValue: "activa",
    }),
  ],
  preview: {
    select: {
      nombre: "nombre",
      fecha: "fecha",
      hora: "hora",
      estado: "estado",
    },
    prepare({ nombre, fecha, hora, estado }) {
      const badge = estado === "cancelada" ? "❌" : "✅";
      return {
        title: nombre,
        subtitle: `${fecha ?? ""} ${hora ?? ""} ${badge}`,
      };
    },
  },
});
