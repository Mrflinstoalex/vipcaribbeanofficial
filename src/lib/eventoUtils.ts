import { getEventoBySlug } from "@/lib/cms";

// getEventoBySlug from Sanity already returns images[] and videos[] directly
export async function getEventoMedia(slug: string) {
  return getEventoBySlug(slug);
}
