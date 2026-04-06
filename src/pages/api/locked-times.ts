import type { APIRoute } from "astro";
import { getLockedTimesForDate } from "@/lib/cms";

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const fecha = url.searchParams.get("date") ?? "";
  if (!fecha) {
    return new Response(JSON.stringify({ locked_times: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }
  const times = await getLockedTimesForDate(fecha);
  return new Response(JSON.stringify({ locked_times: times }), {
    headers: { "Content-Type": "application/json" },
  });
};
