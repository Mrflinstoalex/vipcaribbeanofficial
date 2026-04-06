import { defineType, defineField } from "sanity";

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  // Singleton — sin botón de borrar ni "Crear nuevo"
  __experimental_actions: ["update", "publish"],
  fields: [
    defineField({
      name: "footer_description",
      title: "Texto bajo el logo",
      type: "text",
      rows: 3,
      description: "Texto corto que aparece bajo 'VIP Caribbean' en el footer.",
    }),
    defineField({
      name: "facebook_link",
      title: "URL de Facebook",
      type: "url",
    }),
    defineField({
      name: "instagram_link",
      title: "URL de Instagram",
      type: "url",
    }),
    defineField({
      name: "footer_direccion",
      title: "Dirección de la oficina",
      type: "string",
    }),
    defineField({
      name: "footer_phone",
      title: "Teléfono",
      type: "string",
      description: "Ej: 809-970-7669",
    }),
    defineField({
      name: "footer_email",
      title: "Email de contacto",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Footer" }),
  },
});
