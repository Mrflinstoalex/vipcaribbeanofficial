import type { APIRoute } from "astro";
import { transporter } from "./_mailer";

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

function applyVars(template: string, vars: Record<string, string>) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}

function plainToHtml(text: string) {
  return text
    .split("\n")
    .map((line) => (line.trim() === "" ? "<br>" : `<p style="margin:0 0 8px">${line}</p>`))
    .join("");
}

export const OPTIONS: APIRoute = async ({ request }) => {
  return new Response(null, { status: 204, headers: corsHeaders(request) });
};

export const POST: APIRoute = async ({ request }) => {
  const headers = { "Content-Type": "application/json", ...corsHeaders(request) };

  const secret = request.headers.get("x-cancel-secret");
  if (!secret || secret !== import.meta.env.CANCEL_SECRET) {
    return new Response(JSON.stringify({ message: "No autorizado." }), { status: 401, headers });
  }

  let body: any;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ message: "Payload JSON inválido." }), { status: 400, headers });
  }

  const { recipients, asunto, cuerpo } = body;

  if (!Array.isArray(recipients) || recipients.length === 0) {
    return new Response(JSON.stringify({ message: "Sin destinatarios." }), { status: 400, headers });
  }
  if (!asunto?.trim() || !cuerpo?.trim()) {
    return new Response(JSON.stringify({ message: "Asunto y cuerpo son requeridos." }), { status: 400, headers });
  }

  let sent = 0;
  let errors = 0;

  for (const recipient of recipients) {
    if (!recipient?.email) { errors++; continue; }

    const vars: Record<string, string> = {
      nombre: recipient.nombre ?? "",
      posicion: recipient.posicion ?? "",
      estado: recipient.estado ?? "",
    };

    const finalSubject = applyVars(asunto.trim(), vars);
    const resolvedBody = applyVars(cuerpo.trim(), vars);
    const bodyHtml = plainToHtml(resolvedBody);

    try {
      await transporter.sendMail({
        from: `"VIP Caribbean" <${import.meta.env.EMAIL_USER}>`,
        to: recipient.email,
        subject: finalSubject,
        html: `
          <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222; line-height: 1.6; max-width: 600px; margin: 0 auto;">
            ${bodyHtml}
            <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">VIP Caribbean República Dominicana</p>
            </div>
          </div>
        `,
      });
      sent++;
    } catch {
      errors++;
    }
  }

  return new Response(JSON.stringify({ success: true, sent, errors }), { status: 200, headers });
};
