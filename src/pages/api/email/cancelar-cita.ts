// /api/email/cancelar-cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";
import { writeClient, getEmailTemplate } from "@/lib/cms";

export const prerender = false;

const ALLOWED_ORIGINS = [
  "https://vipcaribbean.sanity.studio",
  "http://localhost:3333",
];

function corsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, x-cancel-secret",
  };
}

function escHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function applyVars(template: string, vars: Record<string, string>) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}

export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};

export const POST: APIRoute = async ({ request }) => {
  const headers = { "Content-Type": "application/json", ...corsHeaders(request) };
  const secret = request.headers.get("x-cancel-secret");
  if (!secret || secret !== import.meta.env.CANCEL_SECRET) {
    return new Response(JSON.stringify({ message: "No autorizado." }), {
      status: 401,
      headers,
    });
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Payload JSON inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }

  const { name, email, appointment_date, appointment_time, citaId } = body;

  if (!name || !email || !appointment_date || !appointment_time) {
    return new Response(JSON.stringify({ message: "Datos incompletos." }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...headers },
    });
  }

  // Update cita status in Sanity if citaId provided
  if (citaId) {
    await writeClient.patch(citaId).set({ estado: "cancelada" }).commit().catch(() => {});
  }

  const vars = { appointment_date, appointment_time };

  // Email al admin + template desde Sanity en paralelo
  let template: { asunto: string; cuerpoHtml: string } | null = null;
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
        template = await getEmailTemplate("cancelacion");
      } catch (e) {
        console.error("Error cargando template cancelación desde Sanity:", e);
      }
    })(),
  ]);

  // Email al cliente con template de Sanity o fallback
  const finalSubject = template?.asunto?.trim()
    ? applyVars(template.asunto.trim(), vars)
    : "Tu cita para la pre-entrevista ha sido cancelada";

  const finalHtml = template?.cuerpoHtml?.trim()
    ? applyVars(template.cuerpoHtml.trim(), vars)
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
    headers: { "Content-Type": "application/json", ...headers },
  });
};
