// Variante 1: Cinemático — media ocupa pantalla completa, texto abajo-izquierda
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV1 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">
      {/* Full-screen background */}
      <div className="absolute inset-0 z-0">
        {showVideo ? (
          <video autoPlay playsInline muted loop className="w-full h-full object-cover">
            <source src={videoSrc!} type="video/mp4" />
          </video>
        ) : (
          <img src={data.image} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      </div>

      {/* Próxima contratación — top right chip */}
      <div className="absolute top-24 right-6 lg:right-12 z-20 bg-white/95 backdrop-blur-sm text-foreground px-5 py-3 rounded-2xl shadow-xl animate-float">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Próxima contratación</p>
        <p className="text-lg font-bold mt-0.5">{data.proximaLinea}</p>
        <p className="text-sm text-muted-foreground">{data.proximaFecha}</p>
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-muted-foreground">Inscripciones abiertas</span>
        </div>
      </div>

      {/* Content — bottom left */}
      <div className="relative z-10 flex flex-col justify-end min-h-screen pb-16 lg:pb-20 px-6 lg:px-16 pt-20">
        <div className="max-w-3xl space-y-7 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-1.5 rounded-full text-sm">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span>Agencia Líder · República Dominicana</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] font-display font-bold text-white leading-[0.9] tracking-tight">
            {data.titulo.split(" ").map((word, i) =>
              word.toLowerCase() === "cruceros" ? (
                <em key={i} className="not-italic text-ocean">{word} </em>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          <p className="text-base lg:text-lg text-white/65 max-w-xl leading-relaxed">
            {data.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <a href="/aplicar">
              <Button
                size="xl"
                className="bg-white text-foreground hover:bg-white/90 font-bold group shadow-xl"
              >
                Aplica Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="/empleos">
              <Button
                size="xl"
                className="bg-transparent border-2 border-white/35 text-white hover:bg-white/10 hover:border-white/60 font-semibold backdrop-blur-sm"
              >
                Ver Posiciones
              </Button>
            </a>
          </div>

          <div className="flex flex-wrap gap-10 pt-6 border-t border-white/15">
            <div>
              <p className="text-3xl font-bold text-white">{data.numeroEmpleados}+</p>
              <p className="text-[10px] text-white/45 uppercase tracking-wider mt-1">Empleados Colocados</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">{data.lineasCrucero}</p>
              <p className="text-[10px] text-white/45 uppercase tracking-wider mt-1">Líneas de Crucero</p>
            </div>
            <div>
              <div className="flex items-end gap-1">
                <p className="text-3xl font-bold text-yellow-400">{data.rating}</p>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mb-1.5" />
              </div>
              <p className="text-[10px] text-white/45 uppercase tracking-wider mt-1">+{data.reviews} Reseñas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 right-6 lg:right-12 z-10 flex flex-col items-center gap-1 text-white/25 animate-bounce">
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
  );
};

export default HeroV1;
