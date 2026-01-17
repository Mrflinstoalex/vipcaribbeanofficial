import { useState } from "react";
import { Search, Clock, ArrowRight, Ship, Anchor } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";



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

interface BlogProps {
  articles: BlogArticle[];
  hasError?: boolean;
}

const Blog =  ({ articles, hasError = false }: BlogProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  
  // Manejo de error duro (cuando WP no respondió)
  if (hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500 text-lg">
          ⚠️ No se pudieron cargar los artículos. Intenta más tarde.
        </p>
      </div>
    );
  }

  // Generar categorías dinámicamente desde los artículos
  const categories = [
    { id: "all", label: "Todos" },
    ...Array.from(
      new Map(
        articles
          .filter((a) => a.category)
          .map((a) => [
            a.category,
            {
              id: a.category,
              label: a.category
                .replace(/-/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
            },
          ])
      ).values()
    ),
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;

    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <>
 
      
      <main className="pt-16 pb-16">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-primary/10 via-background to-ocean/10 py-16 md:py-24 overflow-hidden">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 animate-float">
              <Ship className="w-24 h-24 text-primary" />
            </div>
            <div className="absolute bottom-10 right-10 animate-float" style={{ animationDelay: "1s" }}>
              <Anchor className="w-20 h-20 text-primary" />
            </div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
                📚 Recursos para candidatos
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Guía para trabajar en{" "}
                <span className="text-gradient-coral">cruceros</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
                Todo lo que necesitas saber para pasar tu entrevista y conseguir trabajo a bordo
              </p>
            </div>
          </div>
        </section>

        {/* Search and Categories */}
        <section className="py-8 border-b border-border sticky top-20 bg-background/95 backdrop-blur-sm z-30">
          <div className="container mx-auto px-4">
            {/* Search */}
            <div className="max-w-md mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar artículos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.id
                      ? "bg-primary text-primary-foreground shadow-lg"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {filteredArticles.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg">No se encontraron artículos.</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {filteredArticles.map((article) => (
                  <article
                    key={article.id}
                    className="group bg-card rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={article.image ?? "/placeholder.jpg"}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-medium rounded-full">
                          {categories.find(c => c.id === article.category)?.label}
                        </span>
                      </div>
                      {article.popular && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-coral text-white text-xs font-medium rounded-full">
                            ⭐ Popular
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span>{new Date(article.date).toLocaleDateString('es-DO', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </span>
                      </div>
                      
                      <h2 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h2>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-3 flex-1">
                        {article.excerpt}
                      </p>
                      
                      <a href={`/blog/${article.slug}`}>
                        <Button variant="outline" className="w-full group/btn">
                          Leer más
                          <ArrowRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                ¿Listo para comenzar tu carrera en cruceros?
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8">
                Aplica ahora a nuestra pre-entrevista y da el primer paso hacia tu sueño
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/reservar-cita">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                    Agenda tu Pre-Entrevista
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <a href="/empleos">
                  <Button size="lg" variant="heroOutline" className="w-full sm:w-auto border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                    Ver Empleos Disponibles
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

    
    </>
  );
};

export default Blog;
