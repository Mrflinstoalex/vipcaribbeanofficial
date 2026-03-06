import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async () => {
  return new Response(
    JSON.stringify({ ok: true, message: "Ruta cancelar-cita funcionando" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
};
