// /api/email/cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";
import { writeClient, getLockedTimesForDate, getEmailTemplate } from "@/lib/cms";

export const prerender = false;

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

  // 1) Check if the time slot is already taken
  const locked = await getLockedTimesForDate(dateISO);
  if (locked.includes(time)) {
    return new Response(
      JSON.stringify({ message: "Ese horario ya está reservado.", code: "TIME_TAKEN" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2) Save cita in Sanity
  try {
    await writeClient.create({
      _type: "cita",
      nombre: String(nombre).trim(),
      email: String(email).trim(),
      telefono: String(telefono).trim(),
      fecha: String(dateISO).trim(),
      hora: String(time).trim(),
      estado: "activa",
    });
  } catch (err) {
    console.error("Error guardando cita en Sanity:", err);
    return new Response(
      JSON.stringify({ message: "No se pudo registrar la cita. Inténtalo más tarde." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3) Email interno
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

  // 4) Fetch template from Sanity
  const tpl = await getEmailTemplate("cita").catch(() => null);

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

  const finalSubject = tpl?.asunto?.trim()
    ? applyVars(tpl.asunto.trim(), vars)
    : fallbackSubject;

  const finalHtml = tpl?.cuerpoHtml?.trim()
    ? applyVars(tpl.cuerpoHtml.trim(), vars)
    : fallbackHtml;

  // 5) Email al usuario
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
