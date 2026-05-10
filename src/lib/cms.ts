/**
 * cms.ts — reemplaza wp.ts
 * Todas las funciones tienen la misma firma para no cambiar páginas ni componentes.
 *
 * Paquetes necesarios:
 *   pnpm add @sanity/client @portabletext/to-html
 *
 * Variables de entorno nuevas (.env):
 *   SANITY_PROJECT_ID=xxxxxxxx
 *   SANITY_DATASET=production
 */

import { createClient } from "@sanity/client";
import { toHTML } from "@portabletext/to-html";

const client = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? "production",
  useCdn: true,
  apiVersion: "2024-01-01",
});

/** Convierte Portable Text blocks → HTML string.
 *  Mantiene compatibilidad con los componentes que esperan HTML. */
const blocksToHtml = (blocks: any[]): string => {
  if (!blocks?.length) return "";
  return toHTML(blocks);
};

// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL SITIO (footer, datos de contacto)
// En Sanity: documento singleton de tipo "footer"
// Campos: footer_description, facebook_link, instagram_link,
//         footer_direccion, footer_phone, footer_email
// ─────────────────────────────────────────────────────────────────────────────

export const getPageInfo = async (slug: string) => {
  if (slug === "footer") {
    const data = await client.fetch(
      `*[_type == "footer"][0] {
        footer_description,
        facebook_link,
        instagram_link,
        footer_direccion,
        footer_phone,
        footer_email
      }`
    );
    // Mantiene la forma { acf: {...} } que espera Footer.tsx y Layout.astro
    return {
      title: "Footer",
      contentHtml: "",
      acf: data ?? null,
      slug: "footer",
    };
  }

  if (slug === "landing-page") {
    const data = await client.fetch(
      `*[_type == "paginaLanding"][0] {
        hero_title, hero_subtitle, hero_media_type,
        "hero_image": hero_image.asset->url,
        hero_video, hero_rating, hero_reviews,
        hero_numero_de_empleados, hero_lineas_de_crucero,
        hero_linea_de_cruceros_proxima_contratacion,
        hero_proxima_contratacion_fecha,
        nuestro_servicios_titulo, nuestro_servicios_descripcion,
        servicios[]{ titulo, descripcion },
        nuestros_aliados_titulo, nuestros_aliados_descripcion,
        aliados[]{ nombre, "logo": logo.asset->url },
        como_funciona_titulo, como_funciona_description,
        pasos[]{ titulo, descripcion },
        cta_titulo, cta_descripcion, cta_phone, cta_email
      }`
    );
    return { title: "Landing Page", contentHtml: "", acf: data ?? {}, slug: "landing-page" };
  }

  if (slug === "contactos") {
    const data = await client.fetch(
      `*[_type == "paginaContacto"][0] {
        contactos_titulo,
        contactos_descripcion,
        contactos_direccion,
        contactos_phones,
        contactos_horario_de_oficina,
        contactos_email
      }`
    );
    return { title: "Contacto", contentHtml: "", acf: data ?? {}, slug: "contactos" };
  }

  // Páginas genéricas (quienes-somos, contacto, etc.)
  const data = await client.fetch(
    `*[_type == "pagina" && slug.current == $slug][0] {
      titulo,
      contenido,
      acf,
      "slug": slug.current
    }`,
    { slug }
  );
  if (!data) throw new Error(`Page not found for slug "${slug}"`);
  return {
    title: data.titulo ?? "",
    contentHtml: blocksToHtml(data.contenido ?? []),
    acf: data.acf ?? null,
    slug: data.slug ?? slug,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// PÁGINAS LEGALES
// ─────────────────────────────────────────────────────────────────────────────

export const getTerminosData = async () => {
  const data = await client.fetch(
    `*[_type == "paginaTerminos"][0] {
      titulo,
      ultimaActualizacion,
      contenido
    }`
  );
  if (!data) return null;
  return {
    titulo: data.titulo ?? "Términos de Servicio",
    ultimaActualizacion: data.ultimaActualizacion ?? null,
    contenidoHtml: blocksToHtml(data.contenido ?? []),
  };
};

export const getPoliticasData = async () => {
  const data = await client.fetch(
    `*[_type == "paginaPoliticas"][0] {
      titulo,
      ultimaActualizacion,
      contenido
    }`
  );
  if (!data) return null;
  return {
    titulo: data.titulo ?? "Políticas de la Empresa",
    ultimaActualizacion: data.ultimaActualizacion ?? null,
    contenidoHtml: blocksToHtml(data.contenido ?? []),
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CANDIDATOS (resultados de pre-entrevista)
// ─────────────────────────────────────────────────────────────────────────────

export const getAllCandidatos = async () => {
  const results = await client.fetch(
    `*[_type == "candidato"] | order(fechaEntrevista desc) {
      _id,
      nombre,
      posicion,
      "estado": estado->nombre,
      fechaEntrevista
    }`
  );
  return results.map((c: any) => ({
    id: c._id,
    nombre: c.nombre ?? "",
    posicion: c.posicion ?? "",
    estado: c.estado ?? "",
    // Sanity devuelve fecha ISO "YYYY-MM-DD" — sin parseo manual
    fechaRaw: c.fechaEntrevista ?? "",
  }));
};

export const getFilteredCandidatos = async ({
  mes,
  anio,
  estado,
}: { mes?: string; anio?: string; estado?: string } = {}) => {
  const all = await getAllCandidatos();
  return all.filter((c: any) => {
    const fecha = c.fechaRaw ? new Date(c.fechaRaw) : null;
    let match = true;
    if (mes && anio && fecha) {
      match =
        match &&
        fecha.getMonth() + 1 === Number(mes) &&
        fecha.getFullYear() === Number(anio);
    }
    if (estado) {
      match = match && c.estado.toLowerCase() === estado.toLowerCase();
    }
    return match;
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// LÍNEAS DE CRUCERO
// ─────────────────────────────────────────────────────────────────────────────

export const getAllLineasCruceros = async () => {
  const results = await client.fetch(
    `*[_type == "lineaCrucero"] | order(nombre asc) {
      _id,
      nombre,
      "logo": logo.asset->url
    }`
  );
  return results.map((l: any) => ({
    id: l._id,
    nombre: l.nombre ?? "",
    logo: l.logo ?? null,
  }));
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPLEOS
// ─────────────────────────────────────────────────────────────────────────────

const EMPLEO_PROJECTION = `
  _id,
  "slug": slug.current,
  titulo,
  descripcion,
  "logoEmpleo": logoEmpleo.asset->url,
  cruiseLine-> {
    nombre,
    "logo": logo.asset->url
  },
  "categoria": categoria->nombre,
  "categoriaSlug": categoria->slug.current,
  duracionContrato,
  salario,
  urgente,
  bloqueado
`;

const mapEmpleo = (e: any) => ({
  id: e._id,
  slug: e.slug,
  titulo: e.titulo ?? "",
  descripcion: blocksToHtml(e.descripcion ?? []),
  logoEmpleo: e.logoEmpleo ?? null,
  cruiseLine: {
    nombre: e.cruiseLine?.nombre ?? null,
    logo: e.cruiseLine?.logo ?? null,
    enlace: null,
  },
  categoria: e.categoria ?? null,
  duracion_del_contrato: e.duracionContrato ?? null,
  salario: e.salario ?? null,
  urgente: e.urgente ?? false,
  bloqueado: e.bloqueado ?? false,
});

export const getAllEmpleos = async () => {
  const results = await client.fetch(
    `*[_type == "empleo"] | order(_createdAt desc) { ${EMPLEO_PROJECTION} }`
  );
  return results.map(mapEmpleo);
};

export const getAllEmpleosSlugs = async (): Promise<string[]> => {
  const results = await client.fetch(
    `*[_type == "empleo"] { "slug": slug.current }`
  );
  return results.map((e: any) => e.slug);
};

export const getEmpleoBySlug = async (slug: string) => {
  const data = await client.fetch(
    `*[_type == "empleo" && slug.current == $slug][0] { ${EMPLEO_PROJECTION} }`,
    { slug }
  );
  if (!data) return null;
  return mapEmpleo(data);
};

export const getUrgentEmpleos = async () => {
  const results = await client.fetch(
    `*[_type == "empleo" && urgente == true] | order(_createdAt desc) { ${EMPLEO_PROJECTION} }`
  );
  return results.map(mapEmpleo);
};

export const getEmpleosDisponibles = async () => {
  const results = await client.fetch(
    `*[_type == "empleo" && bloqueado != true] | order(_createdAt desc) { ${EMPLEO_PROJECTION} }`
  );
  return results.map(mapEmpleo);
};

// ─────────────────────────────────────────────────────────────────────────────
// EVENTOS / GALERÍA
// Las fotos y videos ya no se parsean de HTML — son campos nativos de Sanity.
// eventoUtils.ts puede simplificarse: getEventoBySlug ya devuelve images[] y videos[].
// ─────────────────────────────────────────────────────────────────────────────

export const getAllEventos = async () => {
  const results = await client.fetch(
    `*[_type == "evento"] | order(fecha desc) {
      _id,
      "slug": slug.current,
      titulo,
      descripcionCorta,
      fecha,
      lugar,
      "portada": galeria[0].asset->url,
      "fotosCount": count(galeria),
      "videosCount": count(videos)
    }`
  );
  return results.map((e: any) => ({
    id: e._id,
    slug: e.slug,
    titulo: e.titulo ?? "",
    descripcion: e.descripcionCorta ?? "",
    fecha: e.fecha ?? null,
    lugar: e.lugar ?? null,
    portada: e.portada ?? null,
    fotosCount: e.fotosCount ?? 0,
    videosCount: e.videosCount ?? 0,
  }));
};

export const getEventoBySlug = async (slug: string) => {
  const data = await client.fetch(
    `*[_type == "evento" && slug.current == $slug][0] {
      _id,
      "slug": slug.current,
      titulo,
      descripcionCorta,
      fecha,
      lugar,
      "images": galeria[].asset->url,
      videos
    }`,
    { slug }
  );
  if (!data) throw new Error("Evento not found");
  return {
    id: data._id,
    slug: data.slug,
    titulo: data.titulo ?? "",
    // images y videos como arrays directos — eventoUtils ya no necesita parsear HTML
    images: data.images ?? [],
    videos: data.videos ?? [],
    descripcion: data.descripcionCorta ?? "",
    fecha: data.fecha ?? null,
    lugar: data.lugar ?? null,
    seoImage: data.images?.[0] ?? null,
    // contenido vacío para no romper código que lo espere
    contenido: "",
  };
};

export const getLatestEventos = async (limit = 2) => {
  const results = await client.fetch(
    `*[_type == "evento"] | order(fecha desc) [0...${limit}] {
      _id,
      "slug": slug.current,
      titulo,
      descripcionCorta,
      fecha,
      lugar,
      "portada": galeria[0].asset->url
    }`
  );
  return results.map((e: any) => ({
    id: e._id,
    slug: e.slug,
    titulo: e.titulo ?? "",
    descripcion: e.descripcionCorta ?? "",
    fecha: e.fecha ?? null,
    lugar: e.lugar ?? null,
    portada: e.portada ?? null,
  }));
};

export const getAllEventosSlugs = async () => {
  const results = await client.fetch(
    `*[_type == "evento"] { "slug": slug.current }`
  );
  return results.map((e: any) => e.slug);
};

// ─────────────────────────────────────────────────────────────────────────────
// BLOG
// ─────────────────────────────────────────────────────────────────────────────

const ARTICULO_PROJECTION = `
  _id,
  "slug": slug.current,
  titulo,
  "imagen": imagen.asset->url,
  descripcionCorta,
  descripcionLarga,
  "categoria": categoria->nombre,
  "categoriaSlug": categoria->slug.current,
  tiempoLectura,
  destacado,
  ordenDestacado,
  fecha
`;

const mapArticulo = (a: any) => ({
  id: a._id,
  slug: a.slug,
  title: a.titulo ?? "",
  image: a.imagen ?? null,
  excerpt: a.descripcionCorta ?? "",
  content: blocksToHtml(a.descripcionLarga ?? []),
  category: a.categoria ?? "sin-categoria",
  categoryLabel: a.categoria ?? "Sin categoría",
  readTime: a.tiempoLectura ?? "",
  popular: a.destacado ?? false,
  orden: a.ordenDestacado ?? 0,
  date: a.fecha ?? "",
});

export const getAllBlogArticles = async () => {
  const results = await client.fetch(
    `*[_type == "articulo"] | order(fecha desc) { ${ARTICULO_PROJECTION} }`
  );
  return results.map(mapArticulo);
};

export const getBlogArticleBySlug = async (slug: string) => {
  const data = await client.fetch(
    `*[_type == "articulo" && slug.current == $slug][0] { ${ARTICULO_PROJECTION} }`,
    { slug }
  );
  if (!data) return null;
  return mapArticulo(data);
};

export const getLatestBlogArticles = async (limit = 2) => {
  const results = await client.fetch(
    `*[_type == "articulo"] | order(fecha desc) [0...${limit}] {
      _id,
      "slug": slug.current,
      titulo,
      "imagen": imagen.asset->url,
      descripcionCorta,
      "categoria": categoria->nombre,
      tiempoLectura,
      fecha
    }`
  );
  return results.map((a: any) => ({
    id: a._id,
    slug: a.slug,
    title: a.titulo ?? "",
    image: a.imagen ?? null,
    excerpt: a.descripcionCorta ?? "",
    categoryLabel: a.categoria ?? "Blog",
    readTime: a.tiempoLectura ?? "",
    date: a.fecha ?? "",
  }));
};

export const getAllBlogArticlesSlugs = async (): Promise<string[]> => {
  const results = await client.fetch(
    `*[_type == "articulo"] { "slug": slug.current }`
  );
  return results.map((a: any) => a.slug);
};

// ─────────────────────────────────────────────────────────────────────────────
// FAQs
// ─────────────────────────────────────────────────────────────────────────────

export type FaqItem = {
  id: string;
  pregunta: string;
  respuestaHtml: string;
  order: number;
};

export type FaqCategoria = {
  key: string;
  categoria: string;
  preguntas: FaqItem[];
};

// ─────────────────────────────────────────────────────────────────────────────
// WRITE CLIENT (server-side only — requires SANITY_API_TOKEN)
// ─────────────────────────────────────────────────────────────────────────────

export const writeClient = createClient({
  projectId: import.meta.env.SANITY_PROJECT_ID,
  dataset: import.meta.env.SANITY_DATASET ?? "production",
  useCdn: false,
  apiVersion: "2024-01-01",
  token: import.meta.env.SANITY_API_TOKEN,
});

// ─────────────────────────────────────────────────────────────────────────────
// APLICACIONES WEB (control de duplicados)
// ─────────────────────────────────────────────────────────────────────────────

/** Devuelve true si el correo ya tiene una aplicación en los últimos 6 meses. */
export const checkRecentApplication = async (email: string): Promise<boolean> => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const result = await writeClient.fetch(
    `*[_type == "aplicacionWeb" && email == $email && fechaAplicacion > $sixMonthsAgo][0]._id`,
    { email, sixMonthsAgo: sixMonthsAgo.toISOString() }
  );
  return !!result;
};

export const createAplicacionWeb = async (data: {
  email: string;
  telefono: string;
  nombre: string;
  posicion: string;
}) => {
  return writeClient.create({
    _type: "aplicacionWeb",
    ...data,
    fechaAplicacion: new Date().toISOString(),
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// CITAS
// ─────────────────────────────────────────────────────────────────────────────

export const getBlockedDates = async (): Promise<string[]> => {
  const results = await client.fetch(
    `*[_type == "fechaBloqueada"] { fecha }`
  );
  return (results ?? []).map((r: any) => r.fecha).filter(Boolean);
};

export const MAX_BOOKINGS_PER_SLOT = 2;

export const getLockedTimesForDate = async (fecha: string): Promise<string[]> => {
  const results = await client.fetch(
    `*[_type == "cita" && fecha == $fecha && estado == "activa"] { hora }`,
    { fecha }
  );

  // Count bookings per slot — lock the slot once it reaches MAX_BOOKINGS_PER_SLOT
  const counts: Record<string, number> = {};
  for (const r of results ?? []) {
    if (r.hora) counts[r.hora] = (counts[r.hora] ?? 0) + 1;
  }

  return Object.entries(counts)
    .filter(([, count]) => count >= MAX_BOOKINGS_PER_SLOT)
    .map(([hora]) => hora);
};

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────

export const getEmailTemplate = async (
  tipo: "aplicacion" | "cita" | "cancelacion"
): Promise<{ asunto: string; cuerpoHtml: string } | null> => {
  // Los documentos tienen _id fijo: "emailTemplate-aplicacion", "emailTemplate-cita", etc.
  const data = await client.fetch(
    `*[_type == "emailTemplate" && _id == $id][0] { asunto, cuerpoHtml }`,
    { id: `emailTemplate-${tipo}` }
  );
  if (!data) return null;
  return {
    asunto: data.asunto ?? "",
    cuerpoHtml: data.cuerpoHtml ?? "",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────

export const getLandingPageData = async () => {
  const data = await client.fetch(
    `*[_type == "paginaLanding"][0] {
      hero_title, hero_subtitle, hero_media_type,
      "hero_image": hero_image.asset->url,
      hero_video, hero_rating, hero_reviews,
      hero_numero_de_empleados, hero_lineas_de_crucero,
      hero_linea_de_cruceros_proxima_contratacion,
      hero_proxima_contratacion_fecha,
      nuestro_servicios_titulo, nuestro_servicios_descripcion,
      servicios[]{ titulo, descripcion },
      nuestros_aliados_titulo, nuestros_aliados_descripcion,
      aliados[]{ nombre, "logo": logo.asset->url },
      como_funciona_titulo, como_funciona_description,
      pasos[]{ titulo, descripcion },
      cta_titulo, cta_descripcion, cta_phone, cta_email
    }`
  );
  return data ?? {};
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTACTO PAGE
// ─────────────────────────────────────────────────────────────────────────────

export const getContactoData = async () => {
  const data = await client.fetch(
    `*[_type == "paginaContacto"][0] {
      contactos_titulo,
      contactos_descripcion,
      contactos_direccion,
      contactos_phones,
      contactos_horario_de_oficina,
      contactos_email
    }`
  );
  return data ?? {};
};

// ─────────────────────────────────────────────────────────────────────────────
// QUIÉNES SOMOS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export const getQuienesSomosData = async () => {
  const data = await client.fetch(
    `*[_type == "paginaQuienesSomos"][0] {
      hero_titulo, hero_descripcion,
      historia_contenido,
      "historia_imagen": historia_imagen.asset->url,
      historia_fundador_nombre, historia_fundador_rol,
      mision_vision[]{ titulo, descripcion },
      valores[]{ titulo, descripcion },
      equipo[]{ nombre, rol, "imagen": imagen.asset->url },
      stats[]{ valor, etiqueta }
    }`
  );
  if (!data) return null;

  return {
    hero: {
      title: data.hero_titulo ?? "Quiénes Somos",
      description: data.hero_descripcion ?? "",
    },
    historia: {
      title: "Nuestra Historia",
      html: blocksToHtml(data.historia_contenido ?? []),
      image: data.historia_imagen ?? undefined,
      badge: data.historia_fundador_nombre
        ? { name: data.historia_fundador_nombre, role: data.historia_fundador_rol ?? "" }
        : undefined,
    },
    misionVision: {
      items: (data.mision_vision ?? []).map((item: any) => ({
        title: item.titulo ?? "",
        description: item.descripcion ?? "",
      })),
    },
    valores: {
      items: (data.valores ?? []).map((item: any) => ({
        title: item.titulo ?? "",
        description: item.descripcion ?? "",
      })),
    },
    equipo: {
      members: (data.equipo ?? []).map((m: any) => ({
        name: m.nombre ?? "",
        role: m.rol ?? "",
        image: m.imagen ?? undefined,
      })),
    },
    stats: {
      items: (data.stats ?? []).map((s: any) => ({
        value: s.valor ?? "",
        label: s.etiqueta ?? "",
      })),
    },
  };
};

export const getFaqsGrouped = async (): Promise<FaqCategoria[]> => {
  const faqs = await client.fetch(
    `*[_type == "faq" && activa == true] | order(orden asc) {
      _id,
      pregunta,
      respuesta,
      orden,
      seccion-> {
        "slug": slug.current,
        nombre
      }
    }`
  );

  const grouped: Record<string, FaqCategoria> = {};

  for (const f of faqs) {
    const key = f.seccion?.slug ?? "sin-seccion";
    grouped[key] ??= {
      key,
      categoria: f.seccion?.nombre ?? "Sin sección",
      preguntas: [],
    };
    grouped[key].preguntas.push({
      id: f._id,
      pregunta: f.pregunta ?? "",
      respuestaHtml: blocksToHtml(f.respuesta ?? []),
      order: f.orden ?? 0,
    });
  }

  return Object.values(grouped).sort((a, b) =>
    a.categoria.localeCompare(b.categoria, "es")
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SEO GLOBAL
// ─────────────────────────────────────────────────────────────────────────────

export const getSeoGlobal = async (): Promise<{
  defaultTitle: string;
  defaultDescription: string;
  defaultOgImage: string | null;
  siteName: string;
  keywords: string;
} | null> => {
  const data = await client.fetch(
    `*[_type == "seoGlobal"][0] {
      defaultTitle,
      defaultDescription,
      "defaultOgImage": defaultOgImage.asset->url,
      siteName,
      keywords
    }`
  );
  return data ?? null;
};
