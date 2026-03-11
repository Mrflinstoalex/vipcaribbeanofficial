// /api/email/cancelar-cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";
import { escHtml } from "@/lib/email/templates";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return new Response(JSON.stringify({ message: "Payload JSON inválido." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const { name, email, appointment_date, appointment_time } = body as Record<string, string>;

    if (!name || !email || !appointment_date || !appointment_time) {
        return new Response(JSON.stringify({ message: "Datos incompletos." }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Email al admin
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
    
    // Email de confirmación al usuario
    await transporter.sendMail({
        from: `"VIP Caribbean" <${import.meta.env.EMAIL_USER}>`,
        to: email,
        subject: "Tu cita ha sido cancelada – VIP Caribbean",
        html: `
      <h2>Hola ${escHtml(name)},</h2>
      <p>Tu cita ha sido cancelada exitosamente.</p>
      <p><b>Fecha:</b> ${escHtml(appointment_date)}</p>
      <p><b>Hora:</b> ${escHtml(appointment_time)}</p>
      <p>Si deseas reagendar, visita nuestro sitio web.</p>
      <br/>
      <p>VIP Caribbean</p>
    `,
    });

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
    });
};
