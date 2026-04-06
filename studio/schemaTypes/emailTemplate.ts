import { defineField, defineType } from "sanity";

export const emailTemplate = defineType({
  name: "emailTemplate",
  title: "Email Template",
  type: "document",
  __experimental_actions: ["update", "publish"],
  fields: [
    defineField({
      name: "tipo",
      title: "Tipo",
      type: "string",
      readOnly: true,
      hidden: true, // el editor nunca lo ve — se setea automáticamente por documentId
    }),
    defineField({
      name: "asunto",
      title: "Asunto del email",
      type: "string",
      description: "Variables disponibles: {{nombre}}, {{email}}, {{telefono}}, {{fecha}}",
    }),
    defineField({
      name: "cuerpoHtml",
      title: "Cuerpo del email (HTML)",
      type: "text",
      rows: 20,
      description: "Variables disponibles: {{nombre}}, {{email}}, {{telefono}}, {{fecha}}. Puedes usar HTML completo.",
    }),
    defineField({
      name: "variablesDisponibles",
      title: "Variables disponibles",
      type: "string",
      readOnly: true,
      hidden: true, // solo informativo, se muestra por descripción de cada campo
    }),
  ],
  preview: {
    select: {
      tipo: "tipo",
    },
    prepare({ tipo }) {
      return {
        title: tipo ?? "Email Template",
      };
    },
  },
});
