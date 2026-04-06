import type { APIRoute } from "astro";
import { getBlockedDates } from "@/lib/cms";

export const prerender = false;

export const GET: APIRoute = async () => {
  const dates = await getBlockedDates();
  return new Response(JSON.stringify({ blocked_dates: dates }), {
    headers: { "Content-Type": "application/json" },
  });
};
