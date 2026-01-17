//api/email/cita.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const { nombre, email, telefono, fecha } = await request.json();

  if (!nombre || !email || !telefono || !fecha) {
    return new Response(
      JSON.stringify({ message: "Datos incompletos" }),
      { status: 400 }
    );
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

  /* 📧 Email al usuario */
  await transporter.sendMail({
    from: `"VIP Caribbean" <${import.meta.env.EMAIL_USER}>`,
    to: email,
    subject: "✅ Confirmación de cita",
    html: `
      <h2>Hola ${nombre},</h2>
      <p>Tu cita ha sido reservada exitosamente.</p>
      <p><b>Fecha:</b> ${fecha}</p>
      <p>📞 Recuerda llamar 24 horas antes al <b>809-912-4201</b>.</p>
      <br/>
      <p>VIP Caribbean</p>
    `,
  });

  return new Response(JSON.stringify({ success: true }));
};
