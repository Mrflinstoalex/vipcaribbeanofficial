import { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";


export interface Evento {
  id?: number;
  slug?: string;
  titulo: string;
  contenido?: string;
  descripcion: string;
  fecha?: string;
  lugar?: string;
  seoImage?: string;
  images: string[];
  videos: string[];
}

interface EventoDetalleProps {
  evento: Evento | null;
  error?: string | null;
  slug: string;
}

const EventoDetalle: React.FC<EventoDetalleProps> = ({
  evento,
  error,
  slug,
}) => {
  const [imagenAbierta, setImagenAbierta] = useState<number | null>(null);
  const [videoAbierto, setVideoAbierto] = useState<string | null>(null);

  // Caso 1: Error grave al cargar los datos desde el servidor
  if (error) {
    return (
      <>
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <a
              href="/galeria"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la Galería
            </a>

            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-700 mb-4">
                  Error al cargar el evento
                </h1>
                <p className="text-muted-foreground mb-6">{error}</p>
                <Button onClick={() => window.location.reload()}>
                  Recargar página
                </Button>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Caso 2: Evento no encontrado o null (404 graceful)
  if (!evento) {
    return (
      <>
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            <a
              href="/galeria"
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a la Galería
            </a>

            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  Evento no encontrado
                </h1>
                <p className="text-lg text-muted-foreground mb-8">
                  Lo sentimos, el evento que buscas no está disponible o ha sido
                  eliminado.
                </p>
                <a href="/galeria">
                  <Button>Volver a la Galería de Eventos</Button>
                </a>
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  // Valores seguros por defecto
  const titulo = evento.titulo || "Evento sin título";
  const descripcion = evento.descripcion || "Sin descripción disponible.";
  const fecha = evento.fecha || null;
  const lugar = evento.lugar || null;
  const images = evento.images || [];
  const videos = evento.videos || [];

  const navegarImagen = (direccion: "prev" | "next") => {
    if (imagenAbierta === null || images.length === 0) return;
    if (direccion === "prev") {
      setImagenAbierta((imagenAbierta - 1 + images.length) % images.length);
    } else {
      setImagenAbierta((imagenAbierta + 1) % images.length);
    }
  };


  return (
    <>
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Navegación */}
          <a
            href="/galeria"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a la Galería
          </a>

          {/* Header del Evento */}
          <div className="mb-8">
            <h1   className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              {titulo}
            </h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground mb-4">
              {fecha && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                      {format(parseISO(fecha), "d 'de' MMMM 'de' yyyy", { locale: es })}

                </div>
              )}
              {lugar && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {lugar}
                </div>
              )}
            </div>
            <p   className="text-lg text-muted-foreground max-w-3xl">
              {descripcion}
            </p>
          </div>

          {/* Galería de Imágenes */}
          {images.length > 0 ? (
            <section className="mb-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                Fotos del Evento ({images.length})
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((imagen, index) => (
                  <div
                    key={index}
                    className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setImagenAbierta(index)}
                  >
                   
                    <img
                      src={imagen}
                      alt={`${titulo} - Foto ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    /> 
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="mb-12">
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                Fotos del Evento
              </h2>
              <p className="text-muted-foreground text-center py-8">
                No hay fotos disponibles para este evento.
              </p>
            </section>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold text-foreground mb-6">
                Videos ({videos.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((videoUrl, index) => (
                  <div
                    key={index}
                    className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                    onClick={() => setVideoAbierto(videoUrl)}
                  >
                    <video
                      src={videoUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      muted
                      playsInline
                      preload="metadata"
                    >
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <Play className="w-16 h-16 text-white/60" />
                      </div>
                    </video>

                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                      <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-primary ml-1" />
                      </div>
                    </div>

                    <div className="absolute bottom-4 left-4 text-white font-medium">
                      Video {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Modal de Imagen */}
      <Dialog
        open={imagenAbierta !== null}
        onOpenChange={() => setImagenAbierta(null)}
      >
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <button
            onClick={() => setImagenAbierta(null)}
            className="absolute top-4 right-4 z-10 text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
          {imagenAbierta !== null && images.length > 0 && (
            <>
              <img
                src={images[imagenAbierta]}
                alt={`${titulo} - Foto ${imagenAbierta + 1}`}
                className="w-full h-auto"
              />
              <button
                onClick={() => navegarImagen("prev")}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => navegarImagen("next")}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 rounded-full p-2 text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
                {imagenAbierta + 1} / {images.length}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Video */}
      <Dialog
        open={videoAbierto !== null}
        onOpenChange={() => setVideoAbierto(null)}
      >
        <DialogContent className="max-w-4xl p-0 bg-black border-0">
          <button
            onClick={() => setVideoAbierto(null)}
            className="absolute -top-10 right-0 z-10 text-white hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
          {videoAbierto && (
            <div className="aspect-video">
              <iframe
                src={videoAbierto}
                title={`Video del evento ${titulo}`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventoDetalle;
