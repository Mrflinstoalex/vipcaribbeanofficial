// /api/email/cancelar-cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";
import { applyVars, fetchWpTemplate } from "@/lib/email/templates";

export const prerender = false;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://wheat-rat-997991.hostingersite.com",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-cancel-secret",
};

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export const OPTIONS: APIRoute = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

export const POST: APIRoute = async ({ request }) => {
  const secret = request.headers.get("x-cancel-secret");
  if (!secret || secret !== import.meta.env.CANCEL_SECRET) {
    return new Response(JSON.stringify({ message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Payload JSON inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const { name, email, appointment_date, appointment_time } = body;

  if (!name || !email || !appointment_date || !appointment_time) {
    return new Response(JSON.stringify({ message: "Datos incompletos." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }

  const wpDomain = (import.meta.env.WP_DOMAIN ?? "").replace(/\/$/, "");
  const vars = { appointment_date, appointment_time };

  // 1) Email al admin + template desde WP en paralelo
  const [, template] = await Promise.all([
    transporter.sendMail({
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
    }),
    fetchWpTemplate(wpDomain, "email-cancel-template"),
  ]);

  // 2) Email al cliente con template de WP o fallback
  const finalSubject = template?.subject?.trim()
    ? applyVars(template.subject.trim(), vars)
    : "Tu cita para la pre-entrevista ha sido cancelada";

  const finalHtml = template?.body_html?.trim()
    ? applyVars(template.body_html.trim(), vars)
    : `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222; line-height: 1.6;">
      <p>Hola,</p>
      <p>Te confirmo que tu cita programada para el <strong>${escHtml(appointment_date)}</strong> a las <strong>${escHtml(appointment_time)}</strong> ha sido cancelada exitosamente.</p>
      <p>Si tu situación cambia y aún tienes interés en la posición, puedes volver a agendar tu espacio a partir de la semana siguiente. Ten en cuenta que las fechas anteriores a esa ya no se encuentran disponibles para reprogramación.</p>
      <p>Para elegir un nuevo horario, por favor utiliza el enlace de citas que encontrarás directamente en nuestra página web:</p>
      <p>
        <a href="https://www.vipcaribbeanoffice.com"
           style="display:inline-block; padding:10px 20px; background:#1a1a2e; color:#fff; text-decoration:none; border-radius:4px;">
          Agendar nueva cita
        </a>
      </p>
      <p>Gracias por informarnos con antelación.</p>
      <br/>
      <p>Atentamente,<br><strong>VIP Caribbean República Dominicana</strong></p>
    </div>
  `;

  await transporter.sendMail({
    from: `"VIP Caribbean" <${import.meta.env.EMAIL_USER}>`,
    to: email,
    subject: finalSubject,
    html: finalHtml,
  });

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS },
  });
};
