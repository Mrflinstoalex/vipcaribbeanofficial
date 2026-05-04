import { defineType, defineField } from "sanity";

export const listaCorreos = defineType({
  name: "listaCorreos",
  title: "Listas de correo",
  type: "document",
  fields: [
    defineField({
      name: "nombre",
      title: "Nombre de la lista",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "descripcion",
      title: "Descripción",
      type: "string",
    }),
    defineField({
      name: "destinatarios",
      title: "Destinatarios",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "email",
              title: "Correo electrónico",
              type: "string",
              validation: (R) => R.required().email(),
            }),
            defineField({
              name: "nombre",
              title: "Nombre",
              type: "string",
            }),
          ],
          preview: {
            select: { title: "nombre", subtitle: "email" },
            prepare({ title, subtitle }) {
              return { title: title || subtitle, subtitle: title ? subtitle : undefined };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "nombre",
      subtitle: "descripcion",
      destinatarios: "destinatarios",
    },
    prepare({ title, subtitle, destinatarios }) {
      const count = Array.isArray(destinatarios) ? destinatarios.length : 0;
      return {
        title: `📋 ${title}`,
        subtitle: subtitle || `${count} destinatario${count !== 1 ? "s" : ""}`,
      };
    },
  },
});
