// Variante 2: Split Screen Bold — panel oscuro izquierda / media derecha
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV2 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden flex flex-col lg:flex-row">

      {/* LEFT PANEL — dark */}
      <div className="relative z-10 flex flex-col justify-center lg:w-1/2 bg-foreground px-8 lg:px-14 xl:px-20 pt-28 pb-16 lg:py-24">
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, white 1.5px, transparent 1.5px)",
            backgroundSize: "28px 28px",
          }}
        />

        <div className="relative space-y-8 max-w-lg">
          <div className="inline-flex items-center gap-2 border border-white/15 text-white/55 px-4 py-1.5 rounded-full text-[11px] uppercase tracking-widest font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-ocean animate-pulse" />
            Reclutamiento · República Dominicana
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-display font-bold text-white leading-[0.88] tracking-tight">
            {data.titulo.split(" ").map((word, i) =>
              word.toLowerCase() === "cruceros" ? (
                <span key={i} className="block italic text-ocean">{word}</span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          <div className="flex items-center gap-4">
            <div className="w-12 h-0.5 bg-ocean rounded-full" />
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-white/30 text-xs font-medium">{data.rating} / 5.0</span>
          </div>

          <p className="text-white/50 text-base lg:text-lg leading-relaxed">
            {data.subtitle}
          </p>

          <div className="flex flex-wrap gap-3 pt-1">
            <a href="/aplicar">
              <Button
                size="xl"
                className="bg-ocean text-white hover:bg-ocean/90 font-bold group shadow-lg border-0"
              >
                Aplica Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="/empleos">
              <Button
                size="xl"
                className="bg-transparent border border-white/20 text-white/75 hover:bg-white/8 hover:border-white/40 hover:text-white font-semibold"
              >
                Ver Posiciones
              </Button>
            </a>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-6 border-t border-white/8">
            {[
              { value: `${data.numeroEmpleados}+`, label: "Empleados" },
              { value: data.lineasCrucero, label: "Cruceros" },
              { value: `${data.reviews}+`, label: "Reseñas" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-[10px] text-white/30 uppercase tracking-wider mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — media */}
      <div className="relative flex-1 min-h-[55vw] lg:min-h-full">
        {showVideo ? (
          <video autoPlay playsInline muted loop className="absolute inset-0 w-full h-full object-cover">
            <source src={videoSrc!} type="video/mp4" />
          </video>
        ) : (
          <img
            src={data.image}
            alt="Crucero en el Caribe"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Blend left edge into dark panel */}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/10 to-transparent pointer-events-none" />

        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-ocean" />

        {/* Rating chip — top left of image */}
        <div className="absolute top-8 left-8 bg-white/10 backdrop-blur-md border border-white/15 text-white px-4 py-3 rounded-xl">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-sm font-semibold mt-1.5">
            {data.rating}{" "}
            <span className="text-white/45 font-normal text-xs">· {data.reviews} reseñas</span>
          </p>
        </div>

        {/* Próxima contratación card — bottom right */}
        <div className="absolute bottom-8 right-6 lg:right-10 bg-white/95 backdrop-blur-sm text-foreground p-5 rounded-2xl shadow-xl max-w-xs animate-float">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Próxima Contratación</p>
          <p className="text-lg font-bold">{data.proximaLinea}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{data.proximaFecha}</p>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">Inscripciones abiertas</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV2;
