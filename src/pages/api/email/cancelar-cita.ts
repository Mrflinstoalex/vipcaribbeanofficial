// /api/email/cancelar-cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";

export const prerender = false;

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, string>;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Payload JSON inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { name, email, appointment_date, appointment_time } = body;

  if (!name || !email || !appointment_date || !appointment_time) {
    return new Response(JSON.stringify({ message: "Datos incompletos." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1) Email al admin
  await transporter.sendMail({
    from: `"Citas Web" <${import.meta.env.EMAIL_USER}>`,
    to: import.meta.env.EMAIL_USER,
    subject: "❌ Cita cancelada desde admin",
    html: `
      <h3>Cita cancelada</h3>
      <p><b>Nombre:</b> ${escHtml(name)}</p>
      <p><b>Email:</b> ${escHtml(email)}</p>
      <p><b>Fecha:</b> ${escHtml(appointment_date)}</p>
      <p><b>Hora:</b> ${escHtml(appointment_time)}</p>
    `,
  });

  // 2) Email de confirmación al cliente
  await transporter.sendMail({
    from: `"VIP Caribbean" <${import.meta.env.EMAIL_USER}>`,
    to: email,
    subject: "Tu cita ha sido cancelada – VIP Caribbean",
    html: `
      <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
        <h2>Hola ${escHtml(name)},</h2>
        <p>Tu cita ha sido cancelada exitosamente.</p>
        <p><b>Fecha:</b> ${escHtml(appointment_date)}</p>
        <p><b>Hora:</b> ${escHtml(appointment_time)}</p>
        <p>Si deseas reagendar, visita nuestro sitio web.</p>
        <br/>
        <p>Atentamente,<br><strong>VIP Caribbean República Dominicana</strong></p>
      </div>
    `,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
