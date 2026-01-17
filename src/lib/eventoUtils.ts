// archivo: "@/lib/eventoUtils.ts"
import { getEventoBySlug } from "@/lib/wp";


const extractMedia = (html: string) => {
  const images = [...html.matchAll(/<img[^>]+src="([^">]+)"/g)].map(m => m[1]);
  const videos = [...html.matchAll(/<video[^>]+src="([^">]+)"/g)].map(m => m[1]);
  return { images, videos };
};

export async function getEventoMedia(slug: string) {
  const evento = await getEventoBySlug(slug);
  const { images, videos } = extractMedia(evento.contenido);
  return { ...evento, images, videos };
}
