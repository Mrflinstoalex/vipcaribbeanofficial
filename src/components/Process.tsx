import {
  ClipboardList,
  UserCheck,
  FileText,
  Plane,
  CheckCircle,
} from "lucide-react";
import { TituloConHighlight } from "./TituloConHighlight";

export interface ProcessStep {
  titulo: string;
  descripcion: string;
}

export interface ProcessProps {
  titulo: string;
  descripcion: string;
  pasos: ProcessStep[];
}

// Iconos por orden (ACF no maneja iconos)
const stepIcons = [ClipboardList, UserCheck, FileText, Plane];

const Process = ({ data }: { data: ProcessProps }) => {
  return (
    <section id="proceso" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-medium mb-4">Cómo Funciona</p>
          <TituloConHighlight texto={data.titulo} highlight="Éxito" />
          <p className="text-lg text-muted-foreground">
            {data.descripcion}
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {data.pasos.map((paso, index) => {
              const Icon = stepIcons[index];

              return (
                <div key={index} className="relative group">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-0 text-6xl font-display font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="relative pt-12 p-6 rounded-2xl bg-gradient-card border border-border group-hover:border-primary/30 group-hover:shadow-card transition-all duration-300">
                    {/* Icon */}
                    {Icon && (
                      <div className="w-14 h-14 rounded-xl bg-gradient-coral flex items-center justify-center mb-6 shadow-coral">
                        <Icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                    )}

                    <h3 className="text-xl font-bold text-foreground mb-3">
                      {paso.titulo}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {paso.descripcion}
                    </p>

                    {/* Check mark */}
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <CheckCircle className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
