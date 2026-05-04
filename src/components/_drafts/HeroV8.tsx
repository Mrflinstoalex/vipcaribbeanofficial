// Variante 8: Stacked Tilted — composición dinámica con cards inclinadas en capas
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Anchor } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV8 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative bg-warm-white pt-24 pb-20 overflow-hidden">

      {/* Patrón de puntos decorativo */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Blobs de color decorativos */}
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-ocean/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-ocean/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container mx-auto px-4 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Izquierda: contenido textual */}
          <div className="space-y-8 animate-slide-up order-2 lg:order-1">

            <div className="inline-flex items-center gap-2 bg-foreground text-background px-4 py-2 rounded-full text-sm font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-ocean animate-pulse" />
              Agencia #1 · República Dominicana
            </div>

            {/* Título con highlight */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-display font-bold text-foreground leading-[0.92] tracking-tight">
              {data.titulo.split(" ").map((word, i) =>
                word.toLowerCase() === "cruceros" ? (
                  <span key={i} className="relative inline-block">
                    <span className="absolute left-0 right-1 bottom-2 h-3 lg:h-4 bg-ocean/30" />
                    <span className="relative">{word}</span>{" "}
                  </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed max-w-md">
              {data.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="/aplicar">
                <Button variant="hero" size="xl" className="group">
                  Aplica Ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="/empleos">
                <Button variant="heroOutline" size="xl">
                  Ver Posiciones
                </Button>
              </a>
            </div>

            {/* Stats inline */}
            <div className="flex items-center gap-8 pt-6 border-t border-foreground/10">
              <div>
                <p className="text-3xl font-bold text-foreground">{data.numeroEmpleados}+</p>
                <p className="text-xs text-muted-foreground mt-1">Empleados</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground">{data.lineasCrucero}</p>
                <p className="text-xs text-muted-foreground mt-1">Líneas</p>
              </div>
              <div>
                <div className="flex items-end gap-1">
                  <p className="text-3xl font-bold text-foreground">{data.rating}</p>
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mb-1" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">+{data.reviews} reseñas</p>
              </div>
            </div>
          </div>

          {/* Derecha: composición de cards apiladas e inclinadas */}
          <div className="relative h-[480px] lg:h-[560px] flex items-center justify-center order-1 lg:order-2">

            {/* Ghost card 1 — atrás, ocean */}
            <div className="absolute inset-x-8 inset-y-12 bg-ocean rounded-3xl rotate-[-7deg] shadow-xl" />

            {/* Ghost card 2 — medio, navy */}
            <div className="absolute inset-x-4 inset-y-6 bg-navy rounded-3xl rotate-[-3deg] shadow-xl" />

            {/* Card principal con media */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden shadow-2xl rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              {showVideo ? (
                <video autoPlay playsInline muted loop className="w-full h-full object-cover">
                  <source src={videoSrc!} type="video/mp4" />
                </video>
              ) : (
                <img src={data.image} alt="Crucero en el Caribe" className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Floating chip — top left, próxima contratación */}
            <div className="absolute top-2 -left-2 lg:top-4 lg:-left-8 bg-white rounded-2xl shadow-2xl p-4 -rotate-[6deg] hover:rotate-0 transition-transform duration-300 z-10 max-w-[200px]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Próxima Contratación</p>
              <p className="text-base font-bold text-foreground leading-tight">{data.proximaLinea}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{data.proximaFecha}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-muted-foreground">Aplicaciones abiertas</span>
              </div>
            </div>

            {/* Floating chip — bottom right, rating */}
            <div className="absolute -bottom-4 -right-2 lg:-bottom-2 lg:-right-8 bg-white rounded-2xl shadow-2xl p-4 rotate-[5deg] hover:rotate-0 transition-transform duration-300 z-10">
              <div className="flex items-center gap-0.5 mb-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-2xl font-bold text-foreground leading-none">{data.rating}</p>
              <p className="text-[10px] text-muted-foreground mt-1">+{data.reviews} reseñas</p>
            </div>

            {/* Badge circular decorativo */}
            <div className="absolute top-1/3 -right-2 lg:-right-6 w-14 h-14 bg-ocean rounded-full flex items-center justify-center shadow-xl z-10 animate-float">
              <Anchor className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV8;
