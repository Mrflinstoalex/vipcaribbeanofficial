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
  HelpCircle,
  Search,
  X,
  Ship,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  bloqueado?: boolean;
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
  | "otros"
  | "todos";

const iconMap: Record<string, any> = {
  restaurantes: Utensils,
  cocina: ChefHat,
  ventas: ShoppingBag,
  animacion: Music,
  bares: Wine,
  housekeeping: Sparkles,
  fotografos: Camera,
  otros: HelpCircle,
};

const EmpleosPage: React.FC<EmpleosPageProps> = ({ empleos = [], error }) => {
  const [categoriaActiva, setCategoriaActiva] = useState<string>("todos");
  const [cruceroActivo, setCruceroActivo] = useState<string>("todos");
  const [soloDisponibles, setSoloDisponibles] = useState<boolean>(false);
  const [busqueda, setBusqueda] = useState<string>("");

  if (error) {
    return (
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Vacantes <span className="text-gradient-coral">Disponibles</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explora las oportunidades laborales disponibles en los mejores
              cruceros del mundo.
            </p>
          </div>
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

  const vacantes = empleos.map((e) => ({
    id: e.id,
    slug: e.slug,
    titulo: e.titulo || "Vacante sin título",
    descripcion: e.descripcion || "Sin descripción disponible.",
    categoria: (e.categoria?.toLowerCase() as CategoriaType) || "otros",
    crucero: e.cruiseLine?.nombre || "Varias líneas de cruceros",
    ubicacion: "Internacional",
    tipo: "Tiempo completo",
    bloqueado: e.bloqueado ?? false,
  }));

  const vacantesFiltradas = vacantes.filter((v) => {
    if (categoriaActiva !== "todos" && v.categoria !== categoriaActiva)
      return false;
    if (cruceroActivo !== "todos" && v.crucero !== cruceroActivo) return false;
    if (soloDisponibles && v.bloqueado) return false;
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      const textoDesc = v.descripcion.replace(/<[^>]+>/g, "");
      if (
        !v.titulo.toLowerCase().includes(q) &&
        !textoDesc.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

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

  const crucerosUnicos = Array.from(
    new Set(vacantes.map((v) => v.crucero))
  ).sort();

  const getCategoriaIcon = (categoria: string) => {
    const found = categoriasDinamicas.find((c) => c.value === categoria);
    return found?.icon || Sparkles;
  };

  const hayFiltrosActivos =
    categoriaActiva !== "todos" ||
    cruceroActivo !== "todos" ||
    soloDisponibles ||
    busqueda.trim() !== "";

  const limpiarFiltros = () => {
    setCategoriaActiva("todos");
    setCruceroActivo("todos");
    setSoloDisponibles(false);
    setBusqueda("");
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

        {hayVacantes && (
          <>
            {/* Barra de búsqueda */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  placeholder="Buscar por título o descripción..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10 pr-10 h-11"
                />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtros de Categoría */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
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

            {/* Filtros secundarios */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-10 p-4 bg-muted/40 rounded-2xl border border-border/50">
              {/* Línea de crucero */}
              <div className="flex items-center gap-2">
                <Ship className="w-4 h-4 text-muted-foreground shrink-0" />
                <Select value={cruceroActivo} onValueChange={setCruceroActivo}>
                  <SelectTrigger className="w-52 h-9 bg-background">
                    <SelectValue placeholder="Línea de crucero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas las líneas</SelectItem>
                    {crucerosUnicos.map((crucero) => (
                      <SelectItem key={crucero} value={crucero}>
                        {crucero}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="w-px h-6 bg-border hidden sm:block" />

              {/* Solo disponibles */}
              <div className="flex items-center gap-2">
                <Switch
                  id="solo-disponibles"
                  checked={soloDisponibles}
                  onCheckedChange={setSoloDisponibles}
                />
                <Label
                  htmlFor="solo-disponibles"
                  className="text-sm cursor-pointer select-none"
                >
                  Solo disponibles
                </Label>
              </div>

              {/* Limpiar filtros */}
              {hayFiltrosActivos && (
                <>
                  <div className="w-px h-6 bg-border hidden sm:block" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limpiarFiltros}
                    className="text-muted-foreground hover:text-foreground gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" />
                    Limpiar filtros
                  </Button>
                </>
              )}
            </div>

            {/* Contador de resultados */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Mostrando{" "}
                <span className="font-semibold text-foreground">
                  {vacantesFiltradas.length}
                </span>
                {hayFiltrosActivos && (
                  <>
                    {" "}de{" "}
                    <span className="font-semibold text-foreground">
                      {vacantes.length}
                    </span>
                  </>
                )}{" "}
                {vacantesFiltradas.length === 1 ? "vacante" : "vacantes"}
              </p>
            </div>

            {/* Grid de vacantes o empty state de filtros */}
            {vacantesFiltradas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vacantesFiltradas.map((vacante) => {
                  const IconComponent = getCategoriaIcon(vacante.categoria);
                  return (
                    <Card
                      key={vacante.id}
                      className={`transition-all group ${vacante.bloqueado ? "opacity-70" : "hover:shadow-lg hover:-translate-y-1"}`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${vacante.bloqueado ? "bg-muted" : "bg-gradient-coral"}`}
                          >
                            <IconComponent
                              className={`w-6 h-6 ${vacante.bloqueado ? "text-muted-foreground" : "text-white"}`}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                style={{
                                  ["view-transition-name" as any]: `title-${vacante.slug}`,
                                }}
                                className="font-semibold text-foreground group-hover:text-primary transition-colors"
                              >
                                {vacante.titulo}
                              </h3>
                              {vacante.bloqueado && (
                                <span className="text-xs font-medium bg-muted text-muted-foreground px-2 py-0.5 rounded-full shrink-0">
                                  Sin vacantes
                                </span>
                              )}
                            </div>
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
            ) : (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    No hay vacantes con estos filtros
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Intenta ajustar los filtros o{" "}
                    <button
                      onClick={limpiarFiltros}
                      className="text-primary underline underline-offset-2 hover:no-underline"
                    >
                      limpiar todos los filtros
                    </button>
                    .
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty state global — sin vacantes en el CMS */}
        {!hayVacantes && (
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
