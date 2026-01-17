import { TituloConHighlight } from "./TituloConHighlight";

export interface AliadoItem {
  nombre: string;
  logo: string;
}

export interface AliadosProps {
  titulo: string;
  descripcion: string;
  aliados: AliadoItem[];
}

const Partners = ({ data }: { data: AliadosProps }) => {
  return (
    <section id="cruceros" className="py-20 lg:py-28 bg-secondary/50">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-primary font-medium mb-4">Nuestros Aliados</p>
          <TituloConHighlight texto={data.titulo} highlight="Asociadas" />
          <p className="text-lg text-muted-foreground">
            {data.descripcion}
          </p>
        </div>

        {/* Cruise Lines Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {data.aliados.map((cruise) => (
            <div
              key={cruise.nombre}
              className="group relative p-6 lg:p-8 rounded-2xl border bg-card border-border transition-all duration-300 hover:scale-[1.02] hover:border-primary hover:shadow-coral cursor-pointer"
            >
              <div className="flex flex-col items-center text-center gap-4">
                {/* Logo container */}
                <div className="w-20 h-20 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
  <img
    src={cruise.logo}
    alt={cruise.nombre}
    className="w-full h-full object-cover"
    loading="lazy"
  />
</div>

                <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {cruise.nombre}
                </h3>
              </div>

              {/* Optional badge */}
              <div className="absolute -top-2 -right-2 bg-gradient-coral text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
                ALIADO
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Partners;
