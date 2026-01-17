import {
  ArrowLeft,
  Clock,
  Calendar,
  ArrowRight,
  Share2,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface BlogCategory {
  id: number;
  slug: string;
  name: string;
}

export interface BlogArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  image: string | null;
  category: string;        // slug
  categoryLabel: string;   // nombre visible
  readTime: string;
  popular: boolean;
  orden?: number;
}

interface BlogDetalleProps {
  article: BlogArticle | null;
  popularArticles: BlogArticle[];
  relatedArticles: BlogArticle[];
  hasError: boolean;
}

const BlogDetalle = ({
  article,
  popularArticles,
  relatedArticles,
  hasError,
}: BlogDetalleProps) => {
  if (hasError || !article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">⚠️ Artículo no encontrado</p>
      </div>
    );
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: article.title,
        text: article.excerpt,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("Enlace copiado al portapapeles");
    }
  };

  return (
    <main className="pt-24 pb-16">
      {/* HERO */}
      <section className="relative">
        <div className="aspect-[21/9] md:aspect-[3/1] overflow-hidden">
          <img
            src={article.image || "/placeholder.jpg"}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto -mt-32 relative z-10">
            <div className="bg-card rounded-2xl shadow-xl border p-6 md:p-10">
              <a
                href="/blog"
                className="inline-flex items-center text-muted-foreground hover:text-primary mb-6 transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al blog
              </a>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {article.categoryLabel}
                </span>

                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.date).toLocaleDateString("es-DO", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>

                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {article.readTime} de lectura
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                {article.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {article.excerpt}
              </p>

              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="py-12">
        <div className="container mx-auto px-4 grid lg:grid-cols-3 gap-8">
          {/* MAIN */}
          <article className="lg:col-span-2 bg-card p-8 rounded-2xl border">
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* CTA */}
            <div className="mt-12 p-6 bg-primary/10 rounded-xl border">
              <div className="flex items-start gap-4">
                <BookOpen className="w-8 h-8 text-primary" />
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    ¿Listo para comenzar tu carrera en cruceros?
                  </h3>
                  <div className="flex gap-4">
                    <a href="/aplicar">
                      <Button>
                        Aplicar Ahora <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </a>
                    <a href="/empleos">
                      <Button variant="outline">Ver empleos</Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            {/* Apply CTA */}
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-primary-foreground">
                  <h3 className="text-xl font-bold mb-3">
                    ¿Quieres trabajar en cruceros?
                  </h3>
                  <p className="text-primary-foreground/90 mb-4 text-sm">
                    Únete a miles de dominicanos que ya viven su sueño a bordo.
                  </p>
                  <a href="/aplicar">
                    <Button variant="secondary" className="w-full">
                      Aplicar Ahora
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>

            {/* POPULARES */}
            {popularArticles.length > 0 && (
              <div className="bg-card p-6 rounded-xl border">
                <h3 className="font-bold mb-4">⭐ Artículos populares</h3>
                <div className="space-y-4">
                  {popularArticles.map((a) => (
                    <a
                      key={a.slug}
                      href={`/blog/${a.slug}`}
                      className="flex gap-3 group"
                    >
                      <img
                        src={a.image || "/placeholder.jpg"}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div>
                        <h4 className="text-sm font-medium group-hover:text-primary">
                          {a.title}
                        </h4>
                        <span className="text-xs text-muted-foreground">
                          {a.readTime}
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* RELACIONADOS */}
      {relatedArticles.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">
              Artículos Relacionados
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((a) => (
                <a
                  key={a.slug}
                  href={`/blog/${a.slug}`}
                  className="bg-card border rounded-xl overflow-hidden hover:shadow-lg transition"
                >
                  <img
                    src={a.image || "/placeholder.jpg"}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold">{a.title}</h3>
                    <span className="text-sm text-muted-foreground">
                      {a.readTime}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
};

export default BlogDetalle;
