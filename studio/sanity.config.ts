import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { schemaTypes } from "./schemaTypes";
import { structure } from "./structure";

export default defineConfig({
  name: "vipcaribbean",
  title: "VIP Caribbean",

  projectId: "97i3rge0",
  dataset: "production",

  plugins: [
    structureTool({ structure }),
    // visionTool() — descomenta esto si necesitas probar queries GROQ durante desarrollo
  ],

  schema: {
    types: schemaTypes,
  },

});
