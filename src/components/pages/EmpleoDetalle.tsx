import { 
  Utensils, ChefHat, ShoppingBag, Music, Wine, Sparkles, Camera, 
  MapPin, Clock, ArrowLeft, Ship, Calendar, AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type CategoriaType = "restaurantes" | "cocina" | "ventas" | "animacion" | "bares" | "housekeeping" | "fotografos";

export interface CruiseLine {
  nombre: string | null;
  logo: string | null;
  enlace: string | null;
}

export interface Empleo {
  id?: number;
  titulo?: string;
  slug?: string;
  descripcion?: string;
  logoEmpleo?: string | null;
  cruiseLine?: CruiseLine | null;
  categoria?: string;
  lugar?: string;
  duracion_del_contrato?: string | null;
}

interface EmpleoDetalleProps {
  empleo: Empleo | null;
  error?: string | null;
  slug:string
}

const categoriaIcons: Record<CategoriaType, any> = {
  restaurantes: Utensils,
  cocina: ChefHat,
  ventas: ShoppingBag,
  animacion: Music,
  bares: Wine,
  housekeeping: Sparkles,
  fotografos: Camera,
};

const EmpleoDetalle: React.FC<EmpleoDetalleProps> = ({ empleo, error,slug }) => {
  // Caso 1: Error de servidor al cargar los datos
  if (error) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <a
            href="/empleos"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Empleos
          </a>

          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-700 mb-4">
                Error al cargar la vacante
              </h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Recargar página
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Caso 2: Vacante no encontrada (null)
  if (!empleo) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <a
            href="/empleos"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Empleos
          </a>

          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Ship className="w-12 h-12 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-4">
                Vacante no encontrada
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Lo sentimos, la vacante que buscas no está disponible en este momento o ha sido removida.
              </p>
              <a href="/empleos">
                <Button>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Ver Otras Vacantes
                </Button>
              </a>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Valores seguros con fallbacks
  const titulo = empleo.titulo || "Vacante sin título";
  const descripcion = empleo.descripcion || "No hay descripción disponible para esta vacante.";
  const cruiseLineNombre = empleo.cruiseLine?.nombre || "Línea de cruceros no especificada";
  const categoria = (empleo.categoria as CategoriaType) || "bares";
  const duracionContrato = empleo.duracion_del_contrato || "No especificada";

  const IconComponent = categoriaIcons[categoria] || Sparkles;

  return (
    <>
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Back Button */}
          <a
            href="/empleos"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a Empleos
          </a>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-coral rounded-2xl flex items-center justify-center shrink-0">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 style={{
                              ["view-transition-name" as any]: `title-${slug}`,
                            }} className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
                    {titulo}
                  </h1>
                  <p className="text-xl text-primary font-semibold">{cruiseLineNombre}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Internacional</span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">
                    {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Tiempo Completo</span>
                </div>
              </div>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-display font-semibold text-foreground mb-4">
                    Descripción del Puesto
                  </h2>
                  <div
                    className="text-muted-foreground leading-relaxed space-y-4 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-2"
                    dangerouslySetInnerHTML={{ __html: descripcion }}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-3">
                    <Ship className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Línea de Crucero</p>
                      <p className="font-semibold text-foreground">{cruiseLineNombre}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Duración del Contrato</p>
                      <p className="font-semibold text-foreground">{duracionContrato}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <a href="/aplicar" target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-gradient-coral hover:opacity-90 text-white border-0">
                        Aplicar Ahora
                      </Button>
                    </a>
                    <p className="text-xs text-muted-foreground text-center mt-3">
                      Te contactaremos rápidamente para coordinar tu proceso
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default EmpleoDetalle;