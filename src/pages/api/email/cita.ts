// /api/email/cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";

export const prerender = false;

type CitaTemplate = { subject?: string; body_html?: string };

function applyVars(template: string, vars: Record<string, string>) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}

export const POST: APIRoute = async ({ request }) => {
  const { nombre, email, telefono, fecha } = await request.json();

  if (!nombre || !email || !telefono || !fecha) {
    return new Response(JSON.stringify({ message: "Datos incompletos" }), {
      status: 400,
    });
  }

  /* 📩 Email interno */
  await transporter.sendMail({
    from: `"Citas Web" <${import.meta.env.EMAIL_USER}>`,
    to: import.meta.env.EMAIL_USER,
    subject: "📅 Nueva cita reservada",
    html: `
      <h3>Nueva cita reservada</h3>
      <p><b>Nombre:</b> ${nombre}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Teléfono:</b> ${telefono}</p>
      <p><b>Fecha:</b> ${fecha}</p>
    `,
  });

  // ✅ Traer template de WP
  let tpl: CitaTemplate | null = null;
  try {
    const wpDomain = (import.meta.env.WP_DOMAIN || "").replace(/\/$/, "");
    if (wpDomain) {
      const res = await fetch(
        `${wpDomain}/wp-json/vipc/v1/email-cita-template?cb=${Date.now()}`,
        { cache: "no-store" }
      );
      if (res.ok) tpl = (await res.json()) as CitaTemplate;
    }
  } catch (e) {
    console.error("Error cargando template cita desde WP:", e);
  }

  const vars = {
    nombre: String(nombre),
    email: String(email),
    telefono: String(telefono),
    fecha: String(fecha),
  };

  const fallbackSubject = "✅ Confirmación de cita";
  const fallbackHtml = `
    <h2>Hola ${vars.nombre},</h2>
    <p>Tu cita ha sido reservada exitosamente.</p>
    <p><b>Fecha:</b> ${vars.fecha}</p>
    <p>📞 Recuerda llamar 24 horas antes al <b>809-912-4201</b>.</p>
    <br/>
    <p>VIP Caribbean</p>
  `;

  const subjectFromWP = tpl?.subject?.trim();
  const bodyFromWP = tpl?.body_html?.trim();

  const finalSubject = subjectFromWP
    ? applyVars(subjectFromWP, vars)
    : fallbackSubject;

  const finalHtml = bodyFromWP
    ? applyVars(bodyFromWP, vars)
    : fallbackHtml;

  /* 📧 Email al usuario */
  await transporter.sendMail({
    from: `"VIP Caribbean" <${import.meta.env.EMAIL_USER}>`,
    to: email,
    subject: finalSubject,
    html: finalHtml,
  });

  return new Response(JSON.stringify({ success: true }));
};
