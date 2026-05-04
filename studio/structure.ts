import type { StructureBuilder } from "sanity/structure";
import { ImportTool } from "./plugins/importCandidatos/ImportTool";
import { ImportEmpleosTool } from "./plugins/importEmpleos/ImportEmpleosTool";
import { CitasTool } from "./plugins/gestionCitas/CitasTool";
import { EnviarEmailsTool } from "./plugins/enviarEmails/EnviarEmailsTool";

/**
 * Panel lateral del Studio organizado por sección.
 * Todos los singletons de página van arriba bajo "Páginas".
 * El contenido dinámico (empleos, blog, etc.) va abajo.
 */
export const structure = (S: StructureBuilder) =>
  S.list()
    .title("Panel de administración")
    .items([

      // ── PÁGINAS (singletons) ────────────────────────────────────────────
      S.listItem()
        .title("Páginas")
        .child(
          S.list()
            .title("Páginas")
            .items([
              S.listItem()
                .title("🏠 Landing Page (Inicio)")
                .id("paginaLanding")
                .child(
                  S.document()
                    .schemaType("paginaLanding")
                    .documentId("paginaLanding")
                ),
              S.listItem()
                .title("📞 Página de Contacto")
                .id("paginaContacto")
                .child(
                  S.document()
                    .schemaType("paginaContacto")
                    .documentId("paginaContacto")
                ),
              S.listItem()
                .title("👥 Quiénes Somos")
                .id("paginaQuienesSomos")
                .child(
                  S.document()
                    .schemaType("paginaQuienesSomos")
                    .documentId("paginaQuienesSomos")
                ),
              S.listItem()
                .title("🔻 Footer")
                .id("footer")
                .child(
                  S.document()
                    .schemaType("footer")
                    .documentId("footer")
                ),
              S.listItem()
                .title("🔍 SEO Global")
                .id("seoGlobal")
                .child(
                  S.document()
                    .schemaType("seoGlobal")
                    .documentId("seoGlobal")
                ),
            ])
        ),

      S.divider(),

      // ── CONTENIDO DINÁMICO ──────────────────────────────────────────────
      S.listItem()
        .title("💼 Empleos")
        .child(
          S.list()
            .title("Empleos")
            .items([
              S.documentTypeListItem("empleo").title("💼 Ver todos los empleos"),
              S.documentTypeListItem("empleoCategoria").title("📂 Categorías de Empleos"),
              S.listItem()
                .title("📥 Importar desde Excel / CSV")
                .child(
                  S.component(ImportEmpleosTool).title("Importar Empleos")
                ),
            ])
        ),
      S.documentTypeListItem("lineaCrucero").title("🚢 Líneas de Crucero"),

      S.divider(),

      S.listItem()
        .title("👤 Candidatos (Pre-entrevista)")
        .child(
          S.list()
            .title("Candidatos")
            .items([
              S.documentTypeListItem("candidato").title("📋 Ver todos los candidatos"),
              S.documentTypeListItem("estadoCandidato").title("🏷️ Estados de candidatos"),
              S.listItem()
                .title("📥 Importar desde Excel / CSV")
                .child(
                  S.component(ImportTool).title("Importar Candidatos")
                ),
              S.documentTypeListItem("listaCorreos").title("📋 Listas de correo"),
              S.listItem()
                .title("📧 Enviar emails a candidatos")
                .child(
                  S.component(EnviarEmailsTool).title("Enviar Emails")
                ),
            ])
        ),

      S.divider(),

      // ── CITAS ───────────────────────────────────────────────────────────
      S.listItem()
        .title("📅 Citas")
        .child(
          S.list()
            .title("Citas")
            .items([
              S.listItem()
                .title("📋 Ver citas por miércoles")
                .child(
                  S.component(CitasTool).title("Gestión de Citas")
                ),
              S.documentTypeListItem("fechaBloqueada").title("🚫 Fechas bloqueadas"),
            ])
        ),

      S.divider(),

      S.documentTypeListItem("evento").title("🖼️ Eventos / Galería"),

      S.divider(),

      S.listItem()
        .title("📝 Blog")
        .child(
          S.list()
            .title("Blog")
            .items([
              S.documentTypeListItem("articulo").title("📝 Ver todos los artículos"),
              S.documentTypeListItem("articuloCategoria").title("📂 Categorías de Blog"),
            ])
        ),

      S.divider(),

      // ── EMAIL TEMPLATES ─────────────────────────────────────────────────
      S.listItem()
        .title("📧 Email Templates")
        .child(
          S.list()
            .title("Email Templates")
            .items([
              S.listItem()
                .title("📝 Email: Aplicación")
                .id("emailTemplate-aplicacion")
                .child(
                  S.document()
                    .schemaType("emailTemplate")
                    .documentId("emailTemplate-aplicacion")
                ),
              S.listItem()
                .title("📅 Email: Confirmación de Cita")
                .id("emailTemplate-cita")
                .child(
                  S.document()
                    .schemaType("emailTemplate")
                    .documentId("emailTemplate-cita")
                ),
              S.listItem()
                .title("❌ Email: Cancelación")
                .id("emailTemplate-cancelacion")
                .child(
                  S.document()
                    .schemaType("emailTemplate")
                    .documentId("emailTemplate-cancelacion")
                ),
            ])
        ),

      S.divider(),

      S.listItem()
        .title("❓ Preguntas Frecuentes")
        .child(
          S.list()
            .title("Preguntas Frecuentes")
            .items([
              S.documentTypeListItem("faq").title("❓ Ver todas las preguntas"),
              S.documentTypeListItem("faqCategoria").title("📂 Categorías de FAQ"),
            ])
        ),

    ]);
