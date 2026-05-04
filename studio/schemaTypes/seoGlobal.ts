import { defineType, defineField } from "sanity";

export const seoGlobal = defineType({
  name: "seoGlobal",
  title: "SEO Global",
  type: "document",
  fields: [
    defineField({
      name: "defaultTitle",
      title: "Título por defecto",
      type: "string",
      description: "Título que aparece en la pestaña del navegador y en Google para la página de inicio.",
    }),
    defineField({
      name: "defaultDescription",
      title: "Descripción por defecto",
      type: "text",
      rows: 3,
      description: "Descripción que aparece en Google (recomendado: 150–160 caracteres).",
    }),
    defineField({
      name: "defaultOgImage",
      title: "Imagen por defecto (Open Graph)",
      type: "image",
      description: "Imagen que aparece al compartir en redes sociales. Tamaño recomendado: 1200×630 px.",
      options: { hotspot: true },
    }),
    defineField({
      name: "siteName",
      title: "Nombre del sitio",
      type: "string",
      description: "Ej: VIP Caribbean — se usa como sufijo en los títulos de páginas internas.",
    }),
    defineField({
      name: "keywords",
      title: "Palabras clave (keywords)",
      type: "string",
      description: "Separadas por coma. Ej: trabajo en cruceros, empleo cruceros, agencia de empleo RD",
    }),
  ],
  preview: {
    select: { title: "defaultTitle" },
    prepare({ title }) {
      return {
        title: "SEO Global",
        subtitle: title || "Sin título configurado",
      };
    },
  },
});
