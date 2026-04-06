
const domain = import.meta.env.WP_DOMAIN
const apiUrl = `${domain}/wp-json/wp/v2`


export const getPageInfo = async (slug: string) => {
  const response = await fetch(`${apiUrl}/pages?slug=${slug}`);
  if (!response.ok) throw new Error("Failed to fetch page info");

  const [data] = await response.json();
  if (!data) throw new Error(`Page not found for slug "${slug}"`);

  const title =
    typeof data?.title === "string" ? data.title : (data?.title?.rendered ?? "");

  const contentHtml =
    typeof data?.content === "string" ? data.content : (data?.content?.rendered ?? "");

  const acf = data?.acf ?? null;

  return { title, contentHtml, acf, slug: data?.slug ?? slug };
};

/*
export const getPageInfo = async (slug: string) => {
  const response = await fetch(`${apiUrl}/pages?slug=${slug}`)

  if (!response.ok) throw new Error("Failed to fetch page info")


  const [data] = await response.json()
  const {title:{rendered:title}, content:{rendered:content},acf} = data
  return {title, content, acf}
}*/



export const getPostInfo = async (slug: string) => {
  const response = await fetch(`${apiUrl}/posts?slug=${slug}`)
  if (!response.ok) throw new Error("Failed to fetch page info")


  const [data] = await response.json()
  const {title:{rendered:title}, content:{rendered:content}} = data

  return {title, content}
}


export  const getLatestPosts = async ({perPage = 10} : {perPage?: number} = {}) => {
  const response = await fetch(`${apiUrl}/posts?per_page=${perPage}&_embed`)
  if (!response.ok) throw new Error("Failed to fetch latest posts")

  const results = await response.json()

  const posts = results.map((post:any) => { 
    const title = post.title.rendered
    const excerpt = post.excerpt.rendered
    const content = post.content.rendered
    const {slug, date} = post
    const featuredImage = post._embedded?.["wp:featuredmedia"]?.[0]?.source_url 

    return { title, excerpt, content, slug, date, featuredImage}
  })

  if (!results.length) throw new Error("No posts found")


  return posts
}


export const getAllPostsSlugs = async () => {
  const response = await fetch(`${apiUrl}/posts?per_page=100`)
  if (!response.ok) throw new Error("Failed to fetch posts slugs")
  const results = await response.json()
  if (!results.length) throw new Error("No posts found")
  const slugs = results.map((post:any) => post.slug)
  return slugs
}


export const getAllCandidatos = async () => {
  const perPage = 100;
  let page = 1;
  let allResults: any[] = [];

  while (true) {
    const response = await fetch(`${apiUrl}/candidatos?per_page=${perPage}&page=${page}&_embed`);
    if (!response.ok) break;

    const results = await response.json();
    if (!Array.isArray(results) || results.length === 0) break;

    allResults = allResults.concat(results);

    if (results.length < perPage) break;
    page++;
  }

  return allResults.map((candidato: any) => {
    const { id, title, acf } = candidato;

    return {
      id,
      nombre: title?.rendered ?? "",
      posicion: acf?.posicion ?? "",
      estado: acf?.estado ?? "",
      fechaRaw: acf?.fecha_de_entrevista ?? "",
    };
  });
};



export const getFilteredCandidatos = async ({
  mes,
  anio,
  estado
}: { mes?: string; anio?: string; estado?: string } = {}) => {
  const response = await fetch(`${apiUrl}/candidatos?per_page=100&_embed`)
  if (!response.ok) throw new Error("Failed to fetch candidates")

  const results = await response.json()

  const candidatos = results.map((c: any) => {
    const fechaParts = c.acf.fecha_de_entrevista.split('/') // ["13","12","2025"]
    const fecha = new Date(
      Number(fechaParts[2]),
      Number(fechaParts[1]) - 1,
      Number(fechaParts[0])
    )

    return {
      id: c.id,
      nombre: c.title.rendered,
      posicion: c.acf.posicion,
      estado: c.acf.estado,
      fecha,
      fechaRaw: c.acf.fecha_de_entrevista
    }
  })

  // Filtrado por mes, año y estado
  return candidatos.filter((c:any) => {
    let match = true
    if (mes && anio) {
      match = match && c.fecha.getMonth() + 1 === Number(mes) && c.fecha.getFullYear() === Number(anio)
    }
    if (estado) {
      match = match && c.estado.toLowerCase() === estado.toLowerCase()
    }
    return match
  })
}


export const getAllLineasCruceros = async () => {
  const lineasCrucerosUrl = `${apiUrl}/lineas_cruceros`
  const response = await fetch(`${lineasCrucerosUrl}?per_page=100&_embed`)
  if (!response.ok) throw new Error("Failed to fetch lineas de crucero")

  const results = await response.json()

  const lineas = results.map((linea: any) => ({
    id: linea.id,
    nombre: linea.title.rendered,
    logo: linea.acf?.logo || linea._embedded?.["wp:featuredmedia"]?.[0]?.source_url,
  }))

  return lineas
}



export const getAllEmpleos = async () => {
  const response = await fetch(`${apiUrl}/empleos?per_page=100&_embed`);
  if (!response.ok) throw new Error("Failed to fetch empleos");

  const results = await response.json();

  return results.map((empleo: any) => {
    // Obtener la categoría del _embedded si existe
    const categoria = empleo._embedded?.['wp:term']?.[0]?.[0]?.name || null;
    
    return {
      id: empleo.id,
      slug: empleo.slug,
      titulo: empleo.title.rendered,
      descripcion: empleo.content.rendered,
      logoEmpleo: empleo.acf.logo_del_empleo || null,
      cruiseLine: {
        nombre: empleo.acf.cruise_line?.post_title || null,
        logo: empleo.acf.cruise_line?.acf?.logo || null, // si tiene logo en ACF
        enlace: empleo.acf.cruise_line?.guid || null
      },
      categoria: categoria,
      duracion_del_contrato: empleo.acf.duracion_del_contrato || null,
    };
  });
};


export const getAllEmpleosSlugs = async (): Promise<string[]> => {
  const response = await fetch(`${apiUrl}/empleos?per_page=100`)
  if (!response.ok) throw new Error("Failed to fetch empleos slugs")

  const results = await response.json()
  return results.map((empleo: any) => empleo.slug)
}

export const getEmpleoBySlug = async (slug: string): Promise<any | null> => {
  const response = await fetch(`${apiUrl}/empleos?slug=${slug}&_embed`)
  if (!response.ok) throw new Error("Failed to fetch empleo")

  const [data] = await response.json()
  if (!data) return null
  const categoria = data._embedded?.['wp:term']?.[0]?.[0]?.name || null;

  return {
    id: data.id,
    titulo: data.title.rendered,
    descripcion: data.content.rendered,
    logoEmpleo: data.acf.logo_del_empleo || null,
    cruiseLine: {
      nombre: data.acf.cruise_line?.post_title || null,
      logo: data.acf.cruise_line?.acf?.logo || null,
      enlace: data.acf.cruise_line?.guid || null
    },
    categoria: categoria || [], // Si tienes taxonomías ACF
    duracion_del_contrato: data.acf.duracion_del_contrato || null,

  }
}




export const getUrgentEmpleos = async () => {
  const response = await fetch(`${apiUrl}/empleos?per_page=100&_embed`)
  if (!response.ok) throw new Error("Failed to fetch empleos")

  const results = await response.json()

  return results
    .filter((empleo: any) => empleo.acf?.urgente === true)
    .map((empleo: any) => {
      const categoria = empleo._embedded?.['wp:term']?.[0]?.[0]?.name || null

      return {
        id: empleo.id,
        slug: empleo.slug,
        titulo: empleo.title.rendered,
        descripcion: empleo.content.rendered,
        logoEmpleo: empleo.acf.logo_del_empleo || null,
        cruiseLine: {
          nombre: empleo.acf.cruise_line?.post_title || null,
          logo: empleo.acf.cruise_line?.acf?.logo || null,
          enlace: empleo.acf.cruise_line?.guid || null,
        },
        categoria,
        duracion_del_contrato: empleo.acf.duracion_del_contrato || null,
        urgente: empleo.acf.urgente,
      }
    })
}











const extractFirstImage = (html: string): string | null => {
  // Busca la primera etiqueta <img> y captura el valor de src
  const match = html.match(/<img[^>]+src="([^">]+)"/);
  return match ? match[1] : null; // devuelve la URL de la primera imagen o null si no hay
}


const extractMedia = (html: string) => {
  const images = [...html.matchAll(/<img[^>]+src="([^">]+)"/g)];
  const videos = [...html.matchAll(/<video[^>]+src="([^">]+)"/g)];

  return {
    imagesCount: images.length,
    videosCount: videos.length,
  };
};



export const getAllEventos = async () => {
  const response = await fetch(`${apiUrl}/eventos?per_page=100&_embed`)
  if (!response.ok) throw new Error("Failed to fetch eventos")

  const results = await response.json()

  return results.map((evento: any) => {
    const content = evento.content?.rendered || ""
    const { imagesCount, videosCount } = extractMedia(content)

    return {
      id: evento.id,
      slug: evento.slug,
      titulo: evento.title.rendered,
      descripcion: evento.acf?.descripcion_corta || "",
      fecha: evento.acf?.fecha_del_evento || null,
      lugar: evento.acf?.lugar_evento || null,
      portada: extractFirstImage(content) || null,
      fotosCount: imagesCount,
      videosCount: videosCount,
    }
  })
}


/*
export const getAllEventos = async () => {
  const response = await fetch(`${apiUrl}/eventos?per_page=100&_embed`)
  if (!response.ok) throw new Error("Failed to fetch eventos")

    const results = await response.json()
  //console.log("Eventos fetched:", results[0].)
  return results.map((evento: any) => ({
    id: evento.id,
    slug: evento.slug,
    titulo: evento.title.rendered,
    descripcion: evento.acf?.descripcion_corta || "",
    fecha: evento.acf?.fecha_del_evento || null,
    lugar: evento.acf?.lugar_evento || null,
    portada: extractFirstImage(evento.content.rendered) || null,
  }))
}*/


export const getEventoBySlug = async (slug: string) => {
  const response = await fetch(`${apiUrl}/eventos?slug=${slug}`)
  if (!response.ok) throw new Error("Failed to fetch evento")

  const [evento] = await response.json()
  if (!evento) throw new Error("Evento not found")

  return {
    id: evento.id,
    slug: evento.slug,
    titulo: evento.title.rendered,
    contenido: evento.content.rendered, // 👈 galería + videos
    descripcion: evento.acf?.descripcion_corta || "",
    fecha: evento.acf?.fecha_del_evento || null,
    lugar: evento.acf?.lugar_evento || null,
    seoImage: evento.yoast_head_json?.og_image?.[0]?.url || null,
  }
}


export const getAllEventosSlugs = async () => {
  const response = await fetch(`${apiUrl}/eventos?per_page=100`)
  if (!response.ok) throw new Error("Failed to fetch eventos slugs")

  const results = await response.json()
  if (!results.length) throw new Error("No eventos found")

  return results.map((evento: any) => evento.slug)
}






// Helper: encuentra un término en _embed por taxonomy slug
const getTaxonomyTerm = (post: any, taxonomy: string) => {
  const termsGroups = post._embedded?.["wp:term"] || [];
  for (const group of termsGroups) {
    for (const term of group) {
      if (term.taxonomy === taxonomy) return term;
    }
  }
  return null;
};


export const getAllBlogArticles = async () => {
  try {
    const response = await fetch(`${apiUrl}/articulo_blog?per_page=100&_embed`);
    if (!response.ok) throw new Error("Failed to fetch blog articles");

    const results = await response.json();

    return results.map((article: any) => {
      const featuredImage =
        article._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

      const categoriaTerm = getTaxonomyTerm(article, "categorias-blog");

      return {
        id: article.id,
        slug: article.slug,
        title: article.title.rendered,
        excerpt: article.acf?.descripcion_corta || "",
        content:
          article.acf?.descripcion_larga || article.content?.rendered || "",
        date: article.date,
        image: featuredImage,
        category: categoriaTerm?.slug || "sin-categoria",
        categoryLabel: categoriaTerm?.name || "Sin categoría",
        readTime: article.acf?.tiempo_lectura || "",
        popular: article.acf?.es_destacado || false,
        orden: Number(article.acf?.orden_popular || 0),
      };
    });
  } catch (err) {
    console.error("getAllBlogArticles ERROR:", err);
    return [];
  }
};




export const getBlogArticleBySlug = async (slug: string) => {
  try {
    const response = await fetch(`${apiUrl}/articulo_blog?slug=${slug}&_embed`);
    if (!response.ok) throw new Error("Failed to fetch blog article");

    const [article] = await response.json();
    if (!article) return null;

    const featuredImage =
      article._embedded?.["wp:featuredmedia"]?.[0]?.source_url || null;

    const categoriaTerm = getTaxonomyTerm(article, "categorias-blog");




    return {
      id: article.id,
      slug: article.slug,
      title: article.title.rendered,
      content:
        article.acf?.descripcion_larga || article.content?.rendered || "",
      excerpt: article.acf?.descripcion_corta || "",
      date: article.date,
      image: featuredImage,
      category: categoriaTerm?.slug || "sin-categoria",
      categoryLabel: categoriaTerm?.name || "Sin categoría",
      readTime: article.acf?.tiempo_lectura || "",
      popular: article.acf?.es_destacado || false,
    };
  } catch (err) {
    console.error("getBlogArticleBySlug ERROR:", err);
    return null;
  }
};


export const getAllBlogArticlesSlugs = async (): Promise<string[]> => {
  try {
    const response = await fetch(`${apiUrl}/articulo_blog?per_page=100`);
    if (!response.ok) throw new Error("Failed to fetch blog slugs");

    const results = await response.json();

    return results.map((article: any) => article.slug);
  } catch (err) {
    console.error("getAllBlogArticlesSlugs ERROR:", err);
    return [];
  }
};




export type FaqItem = {
  id: number;
  pregunta: string;
  respuestaHtml: string;
  order: number;
};

export type FaqCategoria = {
  key: string;       // slug de la sección
  categoria: string; // nombre visible
  preguntas: FaqItem[];
};






// --------------------------------------
// FETCH FAQs (CPT) + AGRUPAR POR SECCIÓN
// --------------------------------------
export const getFaqsGrouped = async (): Promise<FaqCategoria[]> => {
  // 1) Trae todas las FAQs (con _embed para traer taxonomías)
  const response = await fetch(`${apiUrl}/faqs?per_page=100&_embed`);
  if (!response.ok) throw new Error("Failed to fetch FAQs");

  const results = await response.json();
  if (!Array.isArray(results)) return [];

  // 2) Filtra activos + mapea
  const faqs = results
    .filter((p: any) => {
      // si no existe acf, asumimos true
      const active = p.acf?.faq_is_active;
      return active === undefined ? true : Boolean(active);
    })
    .map((p: any) => {
      const section = getTaxonomyTerm(p, "faq_section"); // taxonomy slug
      const order =
        Number(p.acf?.faq_order ?? 0) ||
        Number(p.menu_order ?? 0) ||
        0;

      return {
        id: p.id,
        pregunta: p.title?.rendered ?? "",
        respuestaHtml: p.content?.rendered ?? "",
        order,
        sectionSlug: section?.slug ?? "sin-seccion",
        sectionName: section?.name ?? "Sin sección",
      };
    });

  // 3) Agrupar por sección
  const grouped: Record<string, FaqCategoria> = {};

  for (const f of faqs) {
    const key = f.sectionSlug;
    grouped[key] ??= {
      key,
      categoria: f.sectionName,
      preguntas: [],
    };

    grouped[key].preguntas.push({
      id: f.id,
      pregunta: f.pregunta,
      respuestaHtml: f.respuestaHtml,
      order: f.order,
    });
  }

  // 4) Ordenar preguntas dentro de cada sección
  for (const cat of Object.values(grouped)) {
    cat.preguntas.sort((a, b) => a.order - b.order);
  }

  // 5) Ordenar secciones (por nombre). Si quieres un orden fijo 1,2,3,
  //    se puede forzar con un array (te lo dejo abajo en nota).
  return Object.values(grouped).sort((a, b) =>
    a.categoria.localeCompare(b.categoria, "es")
  );
};