import { Calendar, MapPin, Play, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface Evento {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string;
  fecha: string | null;
  lugar: string | null;
  portada: string | null;
  fotosCount: number;
  videosCount: number;
}

interface GaleriaEventosProps {
  eventos: Evento[];
  error?: string | null;
}

const GaleriaEventos: React.FC<GaleriaEventosProps> = ({ eventos = [], error }) => {
  const hayEventos = eventos.length > 0;

  // Caso de error en la carga de datos
  if (error) {
    return (
      <>
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Galería de <span className="text-gradient-coral">Eventos</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Revive los mejores momentos de nuestros eventos, capacitaciones y celebraciones.
              </p>
            </div>

            {/* Mensaje de error */}
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-xl text-red-700 mb-4">{error}</p>
                <p className="text-muted-foreground mb-6">
                  Estamos trabajando para solucionarlo.
                </p>
                <Button 
                  variant="outline"
                  onClick={() => window.location.reload()}
                >
                  Recargar página
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Galería de <span className="text-gradient-coral">Eventos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Revive los mejores momentos de nuestros eventos, capacitaciones y celebraciones.
            </p>
          </div>

          {/* Grid de Eventos */}
          {hayEventos ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento,index) => (
                <a key={evento.id} href={`/galeria/${evento.slug}`}>
                  <Card  className="overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer">
                    <div className="relative aspect-video overflow-hidden">

                      <img
                        src={evento.portada || "/placeholder-image.png"}
                        alt={evento.titulo}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white/80 text-sm mb-2">
                          <span>{evento.fotosCount} fotos</span>
                          {evento.videosCount > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Play className="w-3 h-3" />{evento.videosCount} videos
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3  className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                        {evento.titulo}
                      </h3>
                      <p   className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {evento.descripcion}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        {evento.fecha && (
                          <div  className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {evento.fecha}
                          </div>
                        )}
                        {evento.lugar && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {evento.lugar}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          ) : (
            /* Mensaje cuando no hay eventos (normal o por datos vacíos) */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">
                  Aún no hay eventos en la galería
                </h3>
                <p className="text-muted-foreground text-lg">
                  Pronto compartiremos fotos y videos de nuestras próximas capacitaciones, ferias y celebraciones.
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  ¡Mantente atento!
                </p>
              </div>
            </div>
          )}
        </div>

    </>
  );
};

export default GaleriaEventos;