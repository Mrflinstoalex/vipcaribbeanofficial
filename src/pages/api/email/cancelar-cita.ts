// /api/email/cancelar-cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";

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

function applyVars(template: string, vars: Record<string, string>) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}

type CancelTemplate = { subject?: string; body_html?: string };

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
  let template: CancelTemplate | null = null;
  const [,] = await Promise.all([
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
    (async () => {
      try {
        const res = await fetch(
          `${wpDomain}/wp-json/vipc/v1/email-cancel-template?cb=${Date.now()}`,
          { cache: "no-store" }
        );
        if (res.ok) template = await res.json() as CancelTemplate;
      } catch (e) {
        console.error("Error cargando template cancelación desde WP:", e);
      }
    })(),
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
      <p>Tu cita del <strong>${escHtml(appointment_date)}</strong> a las <strong>${escHtml(appointment_time)}</strong> ha sido cancelada.</p>
      <p>Para reagendar visita nuestra página web.</p>
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
