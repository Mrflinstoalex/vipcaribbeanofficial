import type { APIRoute } from "astro";
import {
  getAllEmpleosSlugs,
  getAllBlogArticlesSlugs,
  getAllEventosSlugs,
} from "@/lib/cms";

export const prerender = false;

const SITE_URL = (
  import.meta.env.SITE_URL || "https://www.vipcaribbeanoffice.com"
).replace(/\/$/, "");

const STATIC_ROUTES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/empleos", priority: "0.9", changefreq: "daily" },
  { path: "/aplicar", priority: "0.9", changefreq: "monthly" },
  { path: "/reservar-cita", priority: "0.8", changefreq: "weekly" },
  { path: "/quienes-somos", priority: "0.7", changefreq: "monthly" },
  { path: "/contacto", priority: "0.7", changefreq: "monthly" },
  { path: "/galeria", priority: "0.6", changefreq: "monthly" },
  { path: "/blog", priority: "0.6", changefreq: "weekly" },
  { path: "/faq", priority: "0.5", changefreq: "monthly" },
  { path: "/resultados", priority: "0.4", changefreq: "weekly" },
];

function urlEntry(loc: string, opts: { priority?: string; changefreq?: string; lastmod?: string } = {}) {
  const { priority, changefreq, lastmod } = opts;
  return [
    "  <url>",
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : "",
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : "",
    priority ? `    <priority>${priority}</priority>` : "",
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export const GET: APIRoute = async () => {
  const today = new Date().toISOString().split("T")[0];

  const [empleoSlugs, articleSlugs, eventoSlugs] = await Promise.all([
    getAllEmpleosSlugs().catch(() => []),
    getAllBlogArticlesSlugs().catch(() => []),
    getAllEventosSlugs().catch(() => []),
  ]);

  const staticUrls = STATIC_ROUTES.map((r) =>
    urlEntry(`${SITE_URL}${r.path}`, {
      priority: r.priority,
      changefreq: r.changefreq,
      lastmod: today,
    })
  );

  const empleoUrls = empleoSlugs.map((slug) =>
    urlEntry(`${SITE_URL}/empleos/${slug}`, {
      priority: "0.7",
      changefreq: "weekly",
      lastmod: today,
    })
  );

  const articleUrls = articleSlugs.map((slug) =>
    urlEntry(`${SITE_URL}/blog/${slug}`, {
      priority: "0.6",
      changefreq: "monthly",
      lastmod: today,
    })
  );

  const eventoUrls = eventoSlugs.map((slug: string) =>
    urlEntry(`${SITE_URL}/galeria/${slug}`, {
      priority: "0.5",
      changefreq: "monthly",
      lastmod: today,
    })
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticUrls, ...empleoUrls, ...articleUrls, ...eventoUrls].join("\n")}
</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
