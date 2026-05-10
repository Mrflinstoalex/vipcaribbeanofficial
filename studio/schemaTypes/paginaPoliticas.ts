import { defineType, defineField } from "sanity";

export const paginaPoliticas = defineType({
  name: "paginaPoliticas",
  title: "Página: Políticas de la Empresa",
  type: "document",
  __experimental_actions: ["update", "publish"],
  fields: [
    defineField({
      name: "titulo",
      title: "Título de la página",
      type: "string",
      initialValue: "Políticas de la Empresa",
    }),
    defineField({
      name: "ultimaActualizacion",
      title: "Última actualización",
      type: "date",
      options: { dateFormat: "YYYY-MM-DD" },
    }),
    defineField({
      name: "contenido",
      title: "Contenido",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "Título H2", value: "h2" },
            { title: "Título H3", value: "h3" },
            { title: "Título H4", value: "h4" },
          ],
          marks: {
            decorators: [
              { title: "Negrita", value: "strong" },
              { title: "Cursiva", value: "em" },
              { title: "Subrayado", value: "underline" },
            ],
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Enlace",
                fields: [
                  { name: "href", type: "url", title: "URL" },
                  {
                    name: "blank",
                    type: "boolean",
                    title: "Abrir en nueva pestaña",
                    initialValue: false,
                  },
                ],
              },
            ],
          },
        },
      ],
    }),
  ],
  preview: {
    prepare: () => ({ title: "Políticas de la Empresa" }),
  },
});
