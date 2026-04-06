// /api/email/aplicar.ts
import type { APIRoute } from "astro";
import { transporter } from "./_mailer";
import { getEmailTemplate } from "@/lib/cms";

export const prerender = false;

type ApplyTemplate = {
  subject?: string;
  body_html?: string;
};

function applyVars(template: string, vars: Record<string, string>) {
  return template.replace(/{{\s*(\w+)\s*}}/g, (_, key) => vars[key] ?? "");
}

function escHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData();

  const nombre = formData.get("nombre")?.toString().trim();
  const email = formData.get("email")?.toString().trim();
  const telefono = formData.get("telefono")?.toString().trim();
  const posicion = formData.get("posicion")?.toString().trim() || "";
  const mensaje = formData.get("mensaje")?.toString().trim() || "";
  const cv = formData.get("cv") as File | null;

  // Validación básica
  if (!nombre || !email || !telefono || !cv) {
    return new Response(JSON.stringify({ message: "Datos incompletos" }), {
      status: 400,
    });
  }

  const buffer = Buffer.from(await cv.arrayBuffer());

  // Email al administrador (con el CV adjunto)
  await transporter.sendMail({
    from: `"Aplicaciones Web" <${import.meta.env.EMAIL_USER}>`,
    to: import.meta.env.EMAIL_USER,
    subject: "📄 Nueva aplicación recibida",
    html: `
      <h3>Nueva aplicación</h3>
      <p><strong>Nombre:</strong> ${escHtml(nombre)}</p>
      <p><strong>Email:</strong> ${escHtml(email)}</p>
      <p><strong>Teléfono:</strong> ${escHtml(telefono)}</p>
      <p><strong>Posición:</strong> ${posicion ? escHtml(posicion) : "—"}</p>
      <p><strong>Mensaje:</strong> ${mensaje ? escHtml(mensaje) : "—"}</p>
    `,
    attachments: [
      {
        filename: cv.name,
        content: buffer,
      },
    ],
  });

  // Buscar plantilla desde Sanity
  let template: ApplyTemplate | null = null;
  try {
    const tpl = await getEmailTemplate("aplicacion");
    if (tpl) {
      template = { subject: tpl.asunto, body_html: tpl.cuerpoHtml };
    }
  } catch (e) {
    console.error("Error cargando template desde Sanity:", e);
  }

  const vars = { nombre, email, telefono, posicion, mensaje };

  const defaultSubject =
    "🌴 Gracias por su interés en VIP Caribbean República Dominicana";

  const defaultBodyHtml = `
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #222;">
      <p><strong>Estimado/a ${escHtml(nombre)}:</strong></p>
      <p>Gracias por contactar a <strong>VIP Caribbean República Dominicana</strong>. Hemos recibido su currículum y le agradecemos su interés en formar parte de nuestro equipo.</p>
      <p>Para que podamos considerarle para un puesto, es imprescindible que cumpla con los requisitos esenciales y prepare los documentos para la pre-entrevista.</p>
      <h3>📝 Requisitos Esenciales</h3>
      <ul>
        <li>Ser ciudadano dominicano o poseer pasaporte dominicano.</li>
        <li>Tener al menos 21 años de edad.</li>
        <li>Dominio del idioma inglés (obligatorio).</li>
        <li>Experiencia previa en el sector (algunos puestos ofrecen capacitación).</li>
      </ul>
      <h3>📄 Documentos para la Pre-Entrevista</h3>
      <ul>
        <li>CV en inglés (PDF, máximo 150 KB, con usuario de Microsoft Teams).</li>
        <li>Dos cartas de referencia.</li>
        <li>Dos copias a color del pasaporte (vigencia mínima 1 año).</li>
        <li>Certificado de antecedentes penales.</li>
        <li>Dos fotos 2x2.</li>
      </ul>
      <h3>📞 Cómo programar su pre-entrevista</h3>
      <p>Una vez tenga todos los documentos listos, llámenos a:</p>
      <p>
        📞 809-970-7669<br>
        📞 809-912-4201
      </p>
      <p><strong>Horario:</strong> Lunes a viernes, 9:00 a.m. a 1:00 p.m.</p>
      <p>Puede ver más información en:<br>
      🌐 <a href="https://www.vipcaribbeanoffice.com">www.vipcaribbeanoffice.com</a></p>
      <br>
      <p>Atentamente,<br>
      <strong>VIP Caribbean República Dominicana</strong></p>
    </div>
  `;

  const subjectFromWP = template?.subject?.trim();
  const bodyFromWP = template?.body_html?.trim();

  const finalSubject = subjectFromWP
    ? applyVars(subjectFromWP, vars)
    : defaultSubject;

  const finalHtml = bodyFromWP
    ? applyVars(bodyFromWP, vars)
    : defaultBodyHtml;

  await transporter.sendMail({
    from: `"VIP Caribbean" <${import.meta.env.EMAIL_USER}>`,
    to: email,
    subject: finalSubject,
    html: finalHtml,
  });

  return new Response(JSON.stringify({ success: true }));
};
