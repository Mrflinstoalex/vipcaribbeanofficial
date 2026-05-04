// Variante 6: Bento Grid — multi-panel dashboard moderno (estilo Apple/Linear)
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Anchor, Calendar, Shield } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV6 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="bg-background pt-24 pb-12 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">

        {/* Header — badge + título centrado */}
        <div className="text-center mb-10 max-w-4xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-foreground/5 border border-foreground/10 text-foreground px-4 py-2 rounded-full text-sm mb-6">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            Agencia Líder · República Dominicana
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-foreground leading-[0.95] tracking-tight">
            {data.titulo.split(" ").map((word, i) =>
              word.toLowerCase() === "cruceros" ? (
                <span key={i} className="text-ocean">{word} </span>
              ) : (
                <span key={i}>{word} </span>
              )
            )}
          </h1>

          <p className="text-muted-foreground text-lg mt-6 max-w-2xl mx-auto leading-relaxed">
            {data.subtitle}
          </p>
        </div>

        {/* Bento Grid — 6 paneles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">

          {/* Media — gran panel principal (3 cols x 2 rows en desktop) */}
          <div className="col-span-2 lg:col-span-3 lg:row-span-2 relative rounded-3xl overflow-hidden shadow-xl h-[320px] lg:h-[484px]">
            {showVideo ? (
              <video autoPlay playsInline muted loop className="absolute inset-0 w-full h-full object-cover">
                <source src={videoSrc!} type="video/mp4" />
              </video>
            ) : (
              <img src={data.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-white/55 text-[11px] uppercase tracking-widest mb-2 font-bold">Tu próxima travesía</p>
                <p className="text-white text-2xl lg:text-3xl font-bold leading-tight max-w-md">
                  Cruceros premium en todo el mundo
                </p>
              </div>
              <a href="/aplicar">
                <Button variant="hero" size="xl" className="group shadow-2xl">
                  Aplica Ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
            </div>
          </div>

          {/* Próxima contratación — card oscura */}
          <div className="col-span-2 lg:col-span-1 relative rounded-3xl bg-foreground text-white p-5 overflow-hidden h-[180px] lg:h-[234px]">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-ocean" />
              </div>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">Próxima Contratación</p>
            <p className="text-lg font-bold leading-tight">{data.proximaLinea}</p>
            <p className="text-xs text-white/50 mt-1">{data.proximaFecha}</p>
          </div>

          {/* Rating — card gris */}
          <div className="col-span-1 lg:col-span-1 rounded-3xl bg-soft-gray p-5 flex flex-col justify-between h-[180px] lg:h-[234px]">
            <div>
              <div className="flex items-center gap-0.5 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-4xl lg:text-5xl font-bold text-foreground leading-none">{data.rating}</p>
              <p className="text-xs text-muted-foreground mt-2">de 5.0</p>
            </div>
            <p className="text-xs text-muted-foreground">+{data.reviews} reseñas</p>
          </div>

          {/* Stat - empleados */}
          <div className="col-span-1 lg:col-span-1 rounded-3xl border border-border p-5 flex flex-col justify-center hover:bg-soft-gray transition h-[160px]">
            <Users className="w-6 h-6 text-ocean mb-2" />
            <p className="text-3xl font-bold text-foreground leading-none">{data.numeroEmpleados}+</p>
            <p className="text-xs text-muted-foreground mt-2">Empleados Colocados</p>
          </div>

          {/* Stat - cruceros */}
          <div className="col-span-1 lg:col-span-1 rounded-3xl border border-border p-5 flex flex-col justify-center hover:bg-soft-gray transition h-[160px]">
            <Anchor className="w-6 h-6 text-ocean mb-2" />
            <p className="text-3xl font-bold text-foreground leading-none">{data.lineasCrucero}</p>
            <p className="text-xs text-muted-foreground mt-2">Líneas de Crucero</p>
          </div>

          {/* CTA secundario — card ocean */}
          <div className="col-span-2 lg:col-span-2 rounded-3xl bg-ocean text-white p-5 flex items-center justify-between gap-4 h-[160px]">
            <div className="flex-1 min-w-0">
              <Shield className="w-6 h-6 mb-2" />
              <p className="text-lg font-bold leading-tight">¿Listo para zarpar?</p>
              <p className="text-white/70 text-xs mt-1 line-clamp-2">+10 años conectando talento dominicano con el mundo.</p>
            </div>
            <a href="/empleos" className="flex-shrink-0">
              <Button size="lg" className="bg-white text-foreground hover:bg-white/90 font-bold border-0">
                Ver Posiciones
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV6;
