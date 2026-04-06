// src/lib/parsers/quienesSomos.ts
import * as cheerio from "cheerio";

export type QuienesSomosData = {
  hero: {
    title: string;
    description: string;
  };
  historia: {
    title: string;
    html: string; // HTML limpio (p, strong, etc.)
    image?: string; // URL si aparece
    badge?: { name: string; role: string }; // nombre + rol (ej: Alfio Musumeci / Fundador)
  };
  misionVision: {
    items: Array<{ title: string; description: string }>; // ✅ title + description (cards)
  };
  valores: {
    items: Array<{ title: string; description: string }>;
  };
  equipo: {
    members: Array<{ name: string; role: string; image?: string }>;
  };
  stats: {
    items: Array<{ value: string; label: string }>;
  };
};

// Helpers
function cleanText(s: string) {
  return (s ?? "").replace(/\u00A0/g, " ").replace(/\s+/g, " ").trim();
}

function pickFirstImgSrc($: cheerio.CheerioAPI, scope: cheerio.Cheerio<any>) {
  const img = scope.find("img").first();
  const src = img.attr("src") || "";
  return src.trim() || undefined;
}

function htmlOfParagraphs($: cheerio.CheerioAPI, scope: cheerio.Cheerio<any>) {
  // Mantén p/strong/em/br y limpia vacíos
  const parts: string[] = [];
  scope.find("p").each((_, el) => {
    const html = $(el).html() ?? "";
    const txt = cleanText($(el).text());
    if (!txt) return;
    parts.push(`<p>${html}</p>`);
  });
  return parts.join("\n");
}

function findHeading(
  $: cheerio.CheerioAPI,
  tag: "h2" | "h3",
  textIncludes: string
) {
  const needle = textIncludes.toLowerCase();
  const all = $(tag).toArray();
  for (const el of all) {
    const t = cleanText($(el).text()).toLowerCase();
    if (t.includes(needle)) return $(el);
  }
  return null;
}

function pickCardFromColumns(
  $: cheerio.CheerioAPI,
  columns: cheerio.Cheerio<any>
) {
  // Busca una columna que tenga: img + (h2|h3) + p
  const col = columns
    .find(".wp-block-column")
    .filter((_, el) => {
      const hasImg = $(el).find("img").length > 0;
      const hasHeading = $(el).find("h2, h3").length > 0;
      const hasP = cleanText($(el).find("p").first().text()).length > 0;
      return hasImg && hasHeading && hasP;
    })
    .first();

  if (!col.length) return null;

  const image = pickFirstImgSrc($, col);
  const name = cleanText(col.find("h2, h3").first().text());
  const role = cleanText(col.find("p").first().text());

  if (!name) return null;

  return { image, name, role };
}

export function parseQuienesSomos(
  contentHtml: string,
  pageTitle?: string
): QuienesSomosData {
  const $ = cheerio.load(contentHtml || "");

  // 1) HERO
  const heroTitle = cleanText(pageTitle || "") || "Quiénes Somos";
  const heroDescription = cleanText(
    $("p")
      .filter((_, el) => cleanText($(el).text()).length > 0)
      .first()
      .text()
  );

  // 2) HISTORIA
  const hHistoria = findHeading($, "h2", "Nuestra Historia");
  let historiaHtml = "";
  let historiaImage: string | undefined = undefined;
  let historiaBadge: { name: string; role: string } | undefined = undefined;

  if (hHistoria) {
    const group = hHistoria.closest(".wp-block-group").length
      ? hHistoria.closest(".wp-block-group")
      : hHistoria.parent();

    historiaHtml = htmlOfParagraphs($, group);

    // A: imagen dentro del group
    historiaImage = pickFirstImgSrc($, group);

    // B: luego puede venir un columns con tarjeta (img + nombre + rol)
    const nextColumns = group.nextAll(".wp-block-columns").first();
    if (nextColumns.length) {
      const card = pickCardFromColumns($, nextColumns);
      if (card) {
        historiaImage = historiaImage ?? card.image;
        historiaBadge = historiaBadge ?? { name: card.name, role: card.role };
      }
    }

    // C: fallback más agresivo (por si WP mete nodos vacíos entre medio)
    if (!historiaImage || !historiaBadge) {
      const nextColumnsAny = group
        .nextAll()
        .filter((_, el) => $(el).hasClass("wp-block-columns"))
        .first();

      if (nextColumnsAny.length) {
        const card = pickCardFromColumns($, nextColumnsAny);
        if (card) {
          historiaImage = historiaImage ?? card.image;
          historiaBadge = historiaBadge ?? { name: card.name, role: card.role };
        }
      }
    }
  }

  // 3) MISIÓN / VISIÓN (items con title + description)
  const hMision = findHeading($, "h3", "Nuestra Misión");
  const hVision = findHeading($, "h3", "Nuestra Visión");

  const misionVisionItems: Array<{ title: string; description: string }> = [];

  const misionTitle = hMision ? cleanText(hMision.text()) : "Nuestra Misión";
  const misionDesc = hMision ? cleanText(hMision.parent().find("p").first().text()) : "";
  if (misionDesc) misionVisionItems.push({ title: misionTitle, description: misionDesc });

  const visionTitle = hVision ? cleanText(hVision.text()) : "Nuestra Visión";
  const visionDesc = hVision ? cleanText(hVision.parent().find("p").first().text()) : "";
  if (visionDesc) misionVisionItems.push({ title: visionTitle, description: visionDesc });

  // 4) VALORES
  const hValores = findHeading($, "h2", "Nuestros Valores");
  const valoresItems: Array<{ title: string; description: string }> = [];

  if (hValores) {
    const container = hValores.nextAll(".wp-block-group").first().length
      ? hValores.nextAll(".wp-block-group").first()
      : hValores.parent();

    container.find(".wp-block-column").each((_, col) => {
      const title = cleanText($(col).find("h3").first().text());
      const description = cleanText($(col).find("p").first().text());
      if (!title || !description) return;
      valoresItems.push({ title, description });
    });
  }

  // 5) EQUIPO
  const hEquipo = findHeading($, "h2", "Nuestro Equipo");
  const members: Array<{ name: string; role: string; image?: string }> = [];

  if (hEquipo) {
    const columns = hEquipo.nextAll(".wp-block-columns").first();
    if (columns.length) {
      columns.find(".wp-block-column").each((_, col) => {
        const col$ = $(col);
        const name = cleanText(col$.find("h3").first().text());
        const role = cleanText(col$.find("p").first().text());
        const image = pickFirstImgSrc($, col$);

        if (!name) return; // ignora columnas vacías
        members.push({ name, role, image });
      });
    }
  }

  // 6) STATS (último bloque columns con 3+ pares h2+p)
  const statsItems: Array<{ value: string; label: string }> = [];
  const allColumns = $(".wp-block-columns").toArray().map((el) => $(el));

  const candidateStats = allColumns
    .map((col) => {
      const pairs: Array<{ value: string; label: string }> = [];
      col.find(".wp-block-column").each((_, c) => {
        const value = cleanText($(c).find("h2").first().text());
        const label = cleanText($(c).find("p").first().text());
        if (!value || !label) return;
        pairs.push({ value, label });
      });
      return pairs.length >= 3 ? pairs : null;
    })
    .filter(Boolean) as Array<Array<{ value: string; label: string }>>;

  const lastStats = candidateStats.length ? candidateStats[candidateStats.length - 1] : null;
  if (lastStats) statsItems.push(...lastStats);

  return {
    hero: { title: heroTitle, description: heroDescription },
    historia: {
      title: "Nuestra Historia",
      html: historiaHtml,
      image: historiaImage,
      badge: historiaBadge,
    },
    misionVision: { items: misionVisionItems },
    valores: { items: valoresItems },
    equipo: { members },
    stats: { items: statsItems },
  };
}
