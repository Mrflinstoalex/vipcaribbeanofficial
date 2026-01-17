import { useState, useMemo } from "react";
import { Calendar, Filter, User, CheckCircle, Clock, Info } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Candidato {
  id: number;
  nombre: string;
  posicion: string;
  estado: string;
  fechaRaw: string;
}

interface ResultadosPreEntrevistaProps {
  candidatos: Candidato[];
  error?: string | null; // Nuevo prop para mostrar error de carga
}

const ResultadosPreEntrevista: React.FC<ResultadosPreEntrevistaProps> = ({ candidatos, error}) => {
  const [filtroAno, setFiltroAno] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");


  if (error) {
    return (
      <>
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Resultados de <span className="text-gradient-coral">Pre-Entrevistas</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Consulta el estado de los candidatos que han pasado por nuestro proceso de pre-entrevista.
              </p>
            </div>

            {/* Mensaje de error */}
            <div className="max-w-2xl mx-auto text-center py-16">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                <Info className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-xl text-red-700 mb-4">
                  {error}
                </p>
                <p className="text-muted-foreground">
                  Nuestro equipo está trabajando para solucionarlo. Puedes intentar recargar la página en unos minutos.
                </p>
                <Button 
                  variant="outline" 
                  className="mt-6"
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

  const hayDatos = candidatos.length > 0;


  
  // Función segura para parsear fecha
  const parseFecha = (fechaRaw: string): Date | null => {
    const trimmed = fechaRaw.trim();
    
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) return d;
    }

    if (/^\d{2}[\/-]\d{2}[\/-]\d{4}$/.test(trimmed)) {
      const parts = trimmed.split(/[\/-]/);
      const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
      if (!isNaN(d.getTime())) return d;
    }

    const d = new Date(trimmed);
    if (!isNaN(d.getTime())) return d;

    return null;
  };

  // Extraemos años, meses y estados únicos
  const { anos, mesesUnicos, estadosUnicos } = useMemo(() => {
    const anosSet = new Set<string>();
    const mesesSet = new Set<string>(); // Guardamos como "01", "02", etc.
    const estadosSet = new Set<string>();

    candidatos.forEach((c) => {
      const fecha = parseFecha(c.fechaRaw);
      if (fecha) {
        anosSet.add(fecha.getFullYear().toString());
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        mesesSet.add(mes);
      }

      estadosSet.add(c.estado.trim());
    });

    // Ordenamos años descendente
    const anosOrdenados = ["todos", ...Array.from(anosSet).sort((a, b) => Number(b) - Number(a))];

    // Ordenamos meses cronológicamente (01 → 12)
    const mesesOrdenados = Array.from(mesesSet).sort();
    const mesesConTodos = ["todos", ...mesesOrdenados];

    // Estados ordenados alfabéticamente
    const estadosOrdenados = ["todos", ...Array.from(estadosSet).sort()];

    return {
      anos: anosOrdenados,
      mesesUnicos: mesesConTodos,
      estadosUnicos: estadosOrdenados,
    };
  }, [candidatos]);

  // Nombres de meses para mostrar bonito
  const nombreMes = (mes: string): string => {
    const nombres = {
      "01": "Enero",
      "02": "Febrero",
      "03": "Marzo",
      "04": "Abril",
      "05": "Mayo",
      "06": "Junio",
      "07": "Julio",
      "08": "Agosto",
      "09": "Septiembre",
      "10": "Octubre",
      "11": "Noviembre",
      "12": "Diciembre",
    };
    return nombres[mes as keyof typeof nombres] || mes;
  };

  // Filtrado
  const candidatosFiltrados = useMemo(() => {
    return candidatos.filter((candidato) => {
      const fecha = parseFecha(candidato.fechaRaw);
      const estadoNormalizado = candidato.estado.trim();

      if (filtroAno !== "todos") {
        if (!fecha || fecha.getFullYear().toString() !== filtroAno) return false;
      }

      if (filtroMes !== "todos") {
        if (!fecha || String(fecha.getMonth() + 1).padStart(2, "0") !== filtroMes) return false;
      }

      if (filtroEstado !== "todos") {
        if (estadoNormalizado.toLowerCase() !== filtroEstado.toLowerCase()) return false;
      }

      return true;
    });
  }, [candidatos, filtroAno, filtroMes, filtroEstado]);

  // Configuración visual del estado
  const getEstadoConfig = (estado: string) => {
    const lower = estado.toLowerCase().trim();
    if (lower.includes("aprovado") || lower.includes("aprobado")) {
      return { icon: CheckCircle, style: "bg-green-100 text-green-700 border-green-200" };
    }
    if (lower.includes("back in 1 month") || lower.includes("back in 3 month")) {
      return { icon: Clock, style: "bg-yellow-100 text-yellow-700 border-yellow-200" };
    }
    if (lower.includes("checking info") || lower === "pendiente") {
      return { icon: Info, style: "bg-blue-100 text-blue-700 border-blue-200" };
    }
    return { icon: Calendar, style: "bg-gray-100 text-gray-700 border-gray-200" };
  };

  return (
    <>
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Resultados de <span className="text-gradient-coral">Pre-Entrevistas</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Consulta el estado de los candidatos que han pasado por nuestro proceso de pre-entrevista.
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-card">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Filtros</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Año</label>
                <Select value={filtroAno} onValueChange={setFiltroAno}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar año" />
                  </SelectTrigger>
                  <SelectContent>
                    {anos.map((ano) => (
                      <SelectItem key={ano} value={ano}>
                        {ano === "todos" ? "Todos los años" : ano}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Mes</label>
                <Select value={filtroMes} onValueChange={setFiltroMes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar mes" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesesUnicos.map((mes) => (
                      <SelectItem key={mes} value={mes}>
                        {mes === "todos" ? "Todos los meses" : nombreMes(mes)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Estado</label>
                <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosUnicos.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado === "todos" ? "Todos los estados" : estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {hayDatos ? (
<>
          
          <div className="mb-4">
            <p className="text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{candidatosFiltrados.length}</span> resultados
            </p>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidatosFiltrados.map((candidato) => {
              const { icon: IconComponent, style } = getEstadoConfig(candidato.estado);

              return (
                <Card key={candidato.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{candidato.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{candidato.posicion}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>{candidato.fechaRaw}</span>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${style}`}>
                      <IconComponent className="w-4 h-4" />
                      {candidato.estado}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>


          {candidatosFiltrados.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">
                No se encontraron resultados con los filtros seleccionados.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setFiltroAno("todos");
                  setFiltroMes("todos");
                  setFiltroEstado("todos");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}

          </>
          ) : (
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-50" />
                <p className="text-xl text-muted-foreground mb-4">
                  Aún no hay resultados de pre-entrevistas disponibles.
                </p>
                <p className="text-muted-foreground">
                  Los resultados aparecerán aquí una vez que comencemos a procesar candidatos.
                </p>
              </div>
            </div>
          )}
          
        </div>
      </main>
    </>
  );
};

export default ResultadosPreEntrevista;