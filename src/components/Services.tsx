
import { TituloConHighlight } from "./TituloConHighlight";

export interface ServiceItem {
  titulo: string;
  descripcion: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export interface ServicesProps {
  titulo: string;
  descripcion: string;
  servicios: ServiceItem[];
}




const Services = ({ data }: { data: ServicesProps }) => {

  return (
    <section id="servicios" className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-medium mb-4">Nuestros Servicios</p>
          <TituloConHighlight texto={data.titulo} highlight="Triunfar" />

          <p className="text-lg text-muted-foreground">
            {data.descripcion}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {data.servicios.map((service, index) => (
            <div
              key={service.titulo}
              className="group p-6 lg:p-8 rounded-2xl bg-gradient-card border border-border hover:border-primary/30 hover:shadow-card transition-all duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-gradient-coral group-hover:text-primary-foreground transition-all duration-300">
               <service.icon className="w-7 h-7 text-primary group-hover:text-primary-foreground transition-colors" /> 
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {service.titulo}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
