import { Button } from "@/components/ui/button";
import { ArrowRight, Phone, Mail } from "lucide-react";

export interface CTAProps {
  titulo: string;
  descripcion: string;
  phone: string;
  email: string;
}


const CTA = ({ data }: { data: CTAProps }) => {
  
  return (
    <section
      id="contacto"
      className="py-20 lg:py-28 bg-foreground text-background relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-ocean rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            {data.titulo.split("Aventura").map((parte, index) =>
              index === 0 ? (
                parte
              ) : (
                <span key={index} className="text-gradient-coral">
                  Aventura
                  {parte}
                </span>
              )
            )}
          </h2>
          {/*  <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
            ¿Listo para Comenzar tu{" "}
            <span className="text-gradient-coral">Aventura?</span>
          </h2>*/}
          <p className="text-lg lg:text-xl text-background/70 mb-10 max-w-2xl mx-auto">
            {data.descripcion}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="/aplicar">
              <Button variant="hero" size="xl" className="group">
                Aplica Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="/empleos">
              <Button
                variant="outline"
                size="xl"
                className="border-background/30 text-foreground hover:bg-background hover:text-foreground"
              >
                Ver Posiciones Disponibles
              </Button>
            </a>
          </div>

          {/* Contact Info */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center text-background/80">
            <a
              href={`tel:${data.phone}`}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>{data.phone}</span>
            </a>
            <span className="hidden sm:block">•</span>
            <a
              href={`mailto:${data.email}`}
              className="flex items-center gap-2 hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
              <span>{data.email}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
