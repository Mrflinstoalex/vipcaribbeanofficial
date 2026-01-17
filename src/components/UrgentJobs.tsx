import { Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const urgentJobs = [
  {
    id: 1,
    title: "Chef de Partida",
    cruiseLine: "Disney Cruise Line",
    location: "Internacional",
    type: "Tiempo Completo",
  },
  {
    id: 2,
    title: "Bartender",
    cruiseLine: "Virgin Voyages",
    location: "Internacional",
    type: "Tiempo Completo",
  },
  {
    id: 3,
    title: "Room Steward",
    cruiseLine: "Costa Crociere",
    location: "Internacional",
    type: "Tiempo Completo",
  },
  {
    id: 4,
    title: "Mesero/a",
    cruiseLine: "Oceania Cruises",
    location: "Internacional",
    type: "Tiempo Completo",
  },
];

interface CruiseLine {
  nombre: string;
  logo: string | null;
  enlace: string;
}

interface Job {
  id: number;
  slug: string;
  titulo: string;
  descripcion: string;
  logoEmpleo: string | null;
  cruiseLine: CruiseLine;
  categoria: string;
  duracion_del_contrato: string | null;
  urgente: boolean;
}

interface UrgentJobsProps {
  data: Job[];
}


const UrgentJobs: React.FC<UrgentJobsProps> = ({ data }) => {

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive mb-4">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="text-sm font-semibold">Vacantes Urgentes</span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
            Posiciones que Necesitamos <span className="text-gradient-coral">Ahora</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Estas posiciones tienen alta demanda y necesitamos candidatos calificados de inmediato.
          </p>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {data.map((job, index) => (
            <Card 
              key={job.id} 
              className="group hover:shadow-lg transition-all duration-300 border-destructive/20 hover:border-destructive/40 bg-card"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-destructive" />
                  <span className="text-xs font-semibold text-destructive uppercase tracking-wide">
                    Urgente
                  </span>
                </div>
                <h3  style={{
                              ["view-transition-name" as any]: `title-${job.slug}`,
                            }} className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {job.titulo}
                </h3>
                <p className="text-sm text-muted-foreground mb-1">{job.cruiseLine.nombre}</p>
                <p className="text-xs text-muted-foreground">Internacional • {job.duracion_del_contrato ?? "Tiempo Completo"}</p>
                <a href={`/empleos/${job.slug}`} className="mt-4 block">
                  <Button variant="outline" size="sm" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    Ver Detalles
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <a href="/empleos">
            <Button variant="hero" size="lg">
              Ver Todas las Vacantes
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default UrgentJobs;
