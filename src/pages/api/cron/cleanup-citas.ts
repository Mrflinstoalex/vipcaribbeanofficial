import type { APIRoute } from "astro";
import { writeClient } from "@/lib/cms";

export const prerender = false;

// Corre cada jueves a las 12:00 AM hora dominicana (UTC-4 = 4:00 AM UTC).
// Borra todas las citas del miércoles anterior (ayer).
export const GET: APIRoute = async ({ request }) => {
  // Vercel envía este header automáticamente en cron jobs
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Jueves 12:00 AM RD → el miércoles que pasó = hoy - 1 día
  const now = new Date();
  const lastWednesday = new Date(now);
  lastWednesday.setDate(now.getDate() - 1);

  const fecha = lastWednesday.toISOString().split("T")[0]; // YYYY-MM-DD

  try {
    const result = await writeClient.delete({
      query: `*[_type == "cita" && fecha == $fecha]`,
      params: { fecha },
    });

    const deleted = (result as any)?.results?.length ?? "?";
    console.log(`[cleanup-citas] Borradas ${deleted} citas de ${fecha}`);

    return new Response(JSON.stringify({ success: true, fecha, deleted }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[cleanup-citas] Error:", err);
    return new Response(JSON.stringify({ success: false, error: err?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
