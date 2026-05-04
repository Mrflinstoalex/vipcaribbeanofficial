// Variante 7: Editorial Magazine — tipografía masiva, layout asimétrico estilo revista
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV7 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="bg-warm-white text-foreground pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Barra superior — metadata estilo revista */}
        <div className="flex items-center justify-between border-y border-foreground/15 py-3 mb-8 lg:mb-12">
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold">Vol. 12 · República Dominicana</p>
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold hidden md:block">Edición Especial</p>
          <p className="text-[11px] uppercase tracking-[0.25em] font-bold">Est. 2014</p>
        </div>

        {/* Grid asimétrico: título izquierda / imagen derecha */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 items-start mb-6 lg:mb-8">

          {/* Título — masivo display, palabras escalonadas */}
          <div className="lg:col-span-7 animate-slide-up">
            <h1 className="font-display font-bold text-foreground leading-[0.9] tracking-tighter">
              {(() => {
                const words = data.titulo.split(" ");
                const pairs: string[][] = [];
                for (let i = 0; i < words.length; i += 2) pairs.push(words.slice(i, i + 2));
                return pairs.map((pair, lineIndex) => (
                  <span
                    key={lineIndex}
                    className={`block text-5xl md:text-6xl lg:text-7xl xl:text-8xl ${
                      lineIndex === 1 ? "pl-6 lg:pl-16" : lineIndex === 2 ? "pl-3 lg:pl-8" : ""
                    }`}
                  >
                    {pair.map((word, wi) => {
                      const isCruceros = word.toLowerCase() === "cruceros";
                      return (
                        <span key={wi} className={isCruceros ? "italic text-ocean" : ""}>
                          {word}{wi < pair.length - 1 ? " " : ""}
                        </span>
                      );
                    })}
                  </span>
                ));
              })()}
            </h1>
          </div>

          {/* Imagen — orientación retrato */}
          <div className="lg:col-span-5 relative overflow-hidden shadow-xl">
            <div className="absolute top-4 left-4 z-10 bg-warm-white text-foreground px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold">
              Edición '26
            </div>
            <div className="absolute top-4 right-4 z-10 bg-foreground text-warm-white px-3 py-1.5 text-[10px] uppercase tracking-widest font-bold">
              Pág. 01
            </div>
            {showVideo ? (
              <video autoPlay playsInline muted loop className="w-full h-[280px] lg:h-[400px] object-cover">
                <source src={videoSrc!} type="video/mp4" />
              </video>
            ) : (
              <img src={data.image} alt="" className="w-full h-[280px] lg:h-[400px] object-cover" />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-5">
              <p className="text-white/55 text-[10px] uppercase tracking-widest font-bold mb-1">Próxima Contratación</p>
              <p className="text-white font-bold text-lg leading-tight">{data.proximaLinea}</p>
              <p className="text-white/70 text-xs mt-0.5">{data.proximaFecha}</p>
            </div>
          </div>
        </div>

        {/* Pull quote / subtítulo con drop cap */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10 mb-6 lg:mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-start gap-2">
              <span className="block w-12 h-px bg-foreground mt-3 flex-shrink-0" />
              <p className="text-[11px] uppercase tracking-[0.2em] font-bold">La Carta</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <p className="text-2xl lg:text-3xl font-display font-medium text-foreground leading-snug">
              <span className="text-ocean text-6xl float-left mr-2 leading-[0.75] font-bold font-display">"</span>
              {data.subtitle}
            </p>
          </div>
          <div className="lg:col-span-3 flex flex-col justify-end">
            <div className="flex items-center gap-1.5 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-base font-bold">{data.rating}</span>
            </div>
            <p className="text-xs text-muted-foreground">+{data.reviews} reseñas verificadas</p>
          </div>
        </div>

        {/* Footer: stats columnas + CTAs */}
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 border-t border-foreground/15 pt-8">

          <div className="lg:col-span-2">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground mb-2">N° 01</p>
            <p className="text-3xl lg:text-4xl font-display font-bold leading-none">{data.numeroEmpleados}+</p>
            <p className="text-xs text-muted-foreground mt-2">Empleados<br />colocados</p>
          </div>
          <div className="lg:col-span-2 lg:border-l border-foreground/10 lg:pl-6">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground mb-2">N° 02</p>
            <p className="text-3xl lg:text-4xl font-display font-bold leading-none">{data.lineasCrucero}</p>
            <p className="text-xs text-muted-foreground mt-2">Líneas de<br />crucero</p>
          </div>
          <div className="lg:col-span-2 lg:border-l border-foreground/10 lg:pl-6">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-muted-foreground mb-2">N° 03</p>
            <p className="text-3xl lg:text-4xl font-display font-bold leading-none">12+</p>
            <p className="text-xs text-muted-foreground mt-2">Años de<br />experiencia</p>
          </div>

          <div className="lg:col-span-6 flex flex-col sm:flex-row gap-3 lg:justify-end items-start lg:items-center">
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
        </div>
      </div>
    </section>
  );
};

export default HeroV7;
