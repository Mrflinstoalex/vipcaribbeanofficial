import { Calendar, MapPin, Clock, ArrowRight, Newspaper } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface EventoItem {
  id: string;
  slug: string;
  titulo: string;
  descripcion: string;
  fecha: string | null;
  lugar: string | null;
  portada: string | null;
}

interface ArticuloItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string | null;
  categoryLabel: string;
  readTime: string;
  date: string;
}

interface LoUltimoProps {
  eventos: EventoItem[];
  articulos: ArticuloItem[];
}

const formatFecha = (fecha: string | null): string => {
  if (!fecha) return "";
  const d = new Date(fecha + "T00:00:00");
  return d.toLocaleDateString("es-DO", { day: "numeric", month: "long", year: "numeric" });
};

const LoUltimo: React.FC<LoUltimoProps> = ({ eventos, articulos }) => {
  if (eventos.length === 0 && articulos.length === 0) return null;

  return (
    <section className="py-16 lg:py-24 bg-muted/20">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
            <Newspaper className="w-5 h-5" />
            <span className="text-sm font-semibold">Novedades</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Lo Último de VIP Caribbean
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Mantente al día con nuestros eventos más recientes y artículos del blog.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {/* Eventos */}
          {eventos.map((evento) => (
            <Card key={evento.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative h-40 bg-muted overflow-hidden">
                {evento.portada ? (
                  <img
                    src={evento.portada}
                    alt={evento.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-coral" />
                )}
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-semibold bg-white/90 text-primary px-2 py-1 rounded-full uppercase tracking-wide">
                    Evento
                  </span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {evento.titulo}
                </h3>
                {evento.fecha && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatFecha(evento.fecha)}</span>
                  </div>
                )}
                {evento.lugar && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>{evento.lugar}</span>
                  </div>
                )}
                <a href={`/galeria/${evento.slug}`} className="mt-auto block">
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Ver Galería
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}

          {/* Artículos */}
          {articulos.map((articulo) => (
            <Card key={articulo.id} className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="relative h-40 bg-muted overflow-hidden">
                {articulo.image ? (
                  <img
                    src={articulo.image}
                    alt={articulo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
                )}
                <div className="absolute top-3 left-3">
                  <span className="text-xs font-semibold bg-white/90 text-primary px-2 py-1 rounded-full uppercase tracking-wide">
                    {articulo.categoryLabel}
                  </span>
                </div>
              </div>
              <CardContent className="p-5">
                <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {articulo.title}
                </h3>
                {articulo.readTime && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{articulo.readTime}</span>
                  </div>
                )}
                <a href={`/blog/${articulo.slug}`} className="mt-auto block">
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Leer Artículo
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-4">
          {eventos.length > 0 && (
            <a href="/galeria">
              <Button variant="outline" size="lg">
                Ver Todos los Eventos
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          )}
          {articulos.length > 0 && (
            <a href="/blog">
              <Button variant="hero" size="lg">
                Ir al Blog
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default LoUltimo;
