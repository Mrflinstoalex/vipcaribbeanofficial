import type { APIRoute } from "astro";
import { writeClient } from "@/lib/cms";

export const prerender = false;

// Corre cada lunes a las 4:00 AM UTC (= 12:00 AM hora dominicana).
// Borra registros de aplicacionWeb con más de 6 meses de antigüedad.
export const GET: APIRoute = async ({ request }) => {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${import.meta.env.CRON_SECRET}`) {
    return new Response(JSON.stringify({ message: "No autorizado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const cutoff = sixMonthsAgo.toISOString();

  try {
    const result = await writeClient.delete({
      query: `*[_type == "aplicacionWeb" && fechaAplicacion < $cutoff]`,
      params: { cutoff },
    });

    const deleted = (result as any)?.results?.length ?? "?";
    console.log(`[cleanup-aplicaciones] Borrados ${deleted} registros anteriores a ${cutoff}`);

    return new Response(JSON.stringify({ success: true, cutoff, deleted }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[cleanup-aplicaciones] Error:", err);
    return new Response(JSON.stringify({ success: false, error: err?.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
