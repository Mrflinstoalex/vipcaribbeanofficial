import { defineType, defineField } from "sanity";

export const paginaContacto = defineType({
  name: "paginaContacto",
  title: "Página de Contacto",
  type: "document",
  __experimental_actions: ["update", "publish"],
  fields: [
    defineField({
      name: "contactos_titulo",
      title: "Título de la página",
      type: "string",
      description: "Ej: Contáctanos",
    }),
    defineField({
      name: "contactos_descripcion",
      title: "Descripción",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "contactos_direccion",
      title: "Dirección",
      type: "text",
      rows: 2,
      description: "Ej: Costambar, Puerto Plata\nRepública Dominicana",
    }),
    defineField({
      name: "contactos_phones",
      title: "Teléfonos",
      type: "text",
      rows: 2,
      description: "Un número por línea. Ej:\n809-970-7669\n809-912-4201",
    }),
    defineField({
      name: "contactos_horario_de_oficina",
      title: "Horario de oficina",
      type: "text",
      rows: 2,
      description: "Ej: Lunes a Viernes: 9:00 AM – 1:00 PM",
    }),
    defineField({
      name: "contactos_email",
      title: "Email",
      type: "string",
    }),
  ],
  preview: {
    prepare: () => ({ title: "Página de Contacto" }),
  },
});
