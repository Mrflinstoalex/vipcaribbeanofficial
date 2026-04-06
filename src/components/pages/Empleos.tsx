import { useState } from "react";
import {
  Utensils,
  ChefHat,
  ShoppingBag,
  Music,
  Wine,
  Sparkles,
  Camera,
  MapPin,
  Clock,
  Briefcase,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export interface CruiseLine {
  nombre: string;
  logo: string | null;
  enlace: string;
}

export interface Empleo {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string;
  logoEmpleo?: string | null;
  cruiseLine?: CruiseLine | null;
  categoria?: string | null;
}

export interface EmpleosPageProps {
  empleos: Empleo[];
  error?: string | null;
}

type CategoriaType =
  | "restaurantes"
  | "cocina"
  | "ventas"
  | "animacion"
  | "bares"
  | "housekeeping"
  | "fotografos"
  | "todos";

const iconMap: Record<string, any> = {
  restaurantes: Utensils,
  cocina: ChefHat,
  ventas: ShoppingBag,
  animacion: Music,
  bares: Wine,
  housekeeping: Sparkles,
  fotografos: Camera,
};

const EmpleosPage: React.FC<EmpleosPageProps> = ({ empleos = [], error }) => {
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");

  // Caso de error en la carga de datos
  if (error) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Vacantes <span className="text-gradient-coral">Disponibles</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora las oportunidades laborales disponibles en los mejores
              cruceros del mundo.
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
              <Button onClick={() => window.location.reload()}>
                Recargar página
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Transformar datos con valores seguros
  const vacantes = empleos.map((e) => ({
    id: e.id,
    slug: e.slug,
    titulo: e.titulo || "Vacante sin título",
    descripcion: e.descripcion || "Sin descripción disponible.",
    categoria: (e.categoria as CategoriaType) || "housekeeping",
    crucero: e.cruiseLine?.nombre || "Varias líneas de cruceros",
    ubicacion: "Internacional",
    tipo: "Tiempo completo",
  }));

  const vacantesFiltradas =
    categoriaActiva === "todos"
      ? vacantes
      : vacantes.filter((v) => v.categoria === categoriaActiva);

  // Categorías dinámicas + "todos"
  const categoriasUnicas = Array.from(
    new Set(vacantes.map((v) => v.categoria))
  );
  const categoriasDinamicas = [
    { value: "todos", label: "Todas las vacantes", icon: Briefcase },
    ...categoriasUnicas.map((cat) => ({
      value: cat,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      icon: iconMap[cat] || Sparkles,
    })),
  ];

  const getCategoriaIcon = (categoria: string) => {
    const found = categoriasDinamicas.find((c) => c.value === categoria);
    return found?.icon || Sparkles;
  };

  const hayVacantes = vacantes.length > 0;

  return (
    <main className="pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Vacantes <span className="text-gradient-coral">Disponibles</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora las oportunidades laborales disponibles en los mejores
            cruceros del mundo.
          </p>
        </div>

        {/* Filtros de Categoría */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categoriasDinamicas.map((categoria) => {
            const IconComponent = categoria.icon;
            const isActive = categoriaActiva === categoria.value;
            return (
              <Button
                key={categoria.value}
                variant={isActive ? "default" : "outline"}
                className={`flex items-center gap-2 ${
                  isActive ? "bg-gradient-coral text-white border-0" : ""
                }`}
                onClick={() => setCategoriaActiva(categoria.value)}
              >
                <IconComponent className="w-4 h-4" />
                {categoria.label}
              </Button>
            );
          })}
        </div>

        {/* Resultados */}
        {hayVacantes ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {vacantesFiltradas.length}
                </span>{" "}
                {vacantesFiltradas.length === 1 ? "vacante" : "vacantes"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vacantesFiltradas.map((vacante) => {
                const IconComponent = getCategoriaIcon(vacante.categoria);
                return (
                  <Card
                    key={vacante.id}
                    className="hover:shadow-lg transition-all hover:-translate-y-1 group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-coral rounded-xl flex items-center justify-center shrink-0">
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3
                            style={{
                              ["view-transition-name" as any]: `title-${vacante.slug}`,
                            }}
                            className="font-semibold text-foreground group-hover:text-primary transition-colors"
                          >
                            {vacante.titulo}
                          </h3>
                          <p className="text-sm text-primary font-medium">
                            {vacante.crucero}
                          </p>
                        </div>
                      </div>

                      <div
                        className="text-sm text-muted-foreground mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: vacante.descripcion,
                        }}
                      />

                      <div className="flex flex-wrap gap-3 mb-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {vacante.ubicacion}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {vacante.tipo}
                        </div>
                      </div>

                      <a href={`/empleos/${vacante.slug}`}>
                        <Button
                          variant="outline"
                          className="w-full group-hover:bg-primary group-hover:text-white transition-colors"
                        >
                          Ver Detalles
                        </Button>
                      </a>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </>
        ) : (
          /* Mensaje cuando no hay vacantes */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground mb-4">
                No hay vacantes disponibles en este momento
              </h3>
              <p className="text-lg text-muted-foreground">
                Estamos trabajando activamente con las líneas de cruceros para
                publicar nuevas oportunidades pronto.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                ¡Te recomendamos visitar esta página frecuentemente!
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default EmpleosPage;
