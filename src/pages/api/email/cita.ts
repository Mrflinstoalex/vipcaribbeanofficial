// /api/email/cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";

export const prerender = false;

type CitaTemplate = { subject?: string; body_html?: string };

function applyVars(template: string, vars: Record<string, string>) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}

export const POST: APIRoute = async ({ request }) => {
  const { nombre, email, telefono, fecha, dateISO, time } = await request.json();

  if (!nombre || !email || !telefono || !fecha || !dateISO || !time) {
    return new Response(JSON.stringify({ message: "Datos incompletos" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const wpDomain = (import.meta.env.WP_DOMAIN || "").replace(/\/$/, "");
  if (!wpDomain) {
    return new Response(JSON.stringify({ message: "WP_DOMAIN no está definido" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1) ✅ Guardar cita en WordPress (primero, para evitar emails si falla por límite)
  try {
    const saveRes = await fetch(`${wpDomain}/wp-json/vipc/v1/appointments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        name: String(nombre).trim(),
        email: String(email).trim(),
        phone: String(telefono).trim(),
        appointment_date: String(dateISO).trim(), // YYYY-MM-DD
        appointment_time: String(time).trim(),    // 9:05 AM
      }),
    });

    const saveData = await saveRes.json().catch(() => ({}));

    if (!saveRes.ok) {
      // ✅ Propagar el status real (ej. 429) + mensaje al frontend
      return new Response(
        JSON.stringify({
          message: saveData?.message || "No se pudo registrar la cita.",
          code: saveData?.code || "WP_SAVE_FAILED",
        }),
        {
          status: saveRes.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("Error guardando cita en WP:", err);
    return new Response(
      JSON.stringify({ message: "No se pudo registrar la cita. Inténtalo más tarde." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2) ✅ Email interno (solo si el guardado en WP fue OK)
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

  // 3) ✅ Traer template de WP
  let tpl: CitaTemplate | null = null;
  try {
    const res = await fetch(
      `${wpDomain}/wp-json/vipc/v1/email-cita-template?cb=${Date.now()}`,
      { cache: "no-store" }
    );
    if (res.ok) tpl = (await res.json()) as CitaTemplate;
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

  const finalSubject = subjectFromWP ? applyVars(subjectFromWP, vars) : fallbackSubject;
  const finalHtml = bodyFromWP ? applyVars(bodyFromWP, vars) : fallbackHtml;

  // 4) ✅ Email al usuario (solo si todo fue OK)
  await transporter.sendMail({
    from: `"VIP Caribbean" <${import.meta.env.EMAIL_USER}>`,
    to: email,
    subject: finalSubject,
    html: finalHtml,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
