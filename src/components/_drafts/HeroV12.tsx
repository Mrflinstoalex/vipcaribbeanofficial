// Variante 12: Cinematic Center — heading colosal centrado, barra frosted inferior, marquee de cruceros
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Star, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV12 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  const cruiseLines = [
    "Royal Caribbean", "Carnival Cruise Line", "Norwegian Cruise Line",
    "MSC Cruceros", "Celebrity Cruises", "Princess Cruises",
    "Holland America", "Costa Cruceros",
  ];

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-navy flex flex-col">

      {/* ── Full-bleed background ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {showVideo ? (
          <video
            autoPlay playsInline webkit-playsinline="true" preload="metadata"
            muted loop controls={false} disablePictureInPicture
            controlsList="nofullscreen noremoteplayback nodownload"
            className="w-full h-full object-cover pointer-events-none"
          >
            <source src={videoSrc!} type="video/mp4" />
          </video>
        ) : (
          <img src={data.image} alt="" className="w-full h-full object-cover" />
        )}
        {/* Cinematic layered overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />
      </div>

      {/* ── Center content — grows to fill viewport ───────────────────── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center
                      flex-1 px-6 pt-24 pb-8">

        {/* Badge */}
        <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-sm
                        border border-white/20 text-white/90 px-5 py-2.5 rounded-full
                        text-sm font-semibold mb-8">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span>Agencia Líder · República Dominicana</span>
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
        </div>

        {/* Massive heading */}
        <h1 className="font-display font-bold text-white leading-[1.03]
                       text-[2.8rem] sm:text-6xl lg:text-7xl xl:text-8xl 2xl:text-[5.5rem]
                       max-w-5xl mb-7">
          {data.titulo}
        </h1>

        {/* Decorative divider */}
        <div className="flex items-center gap-5 mb-7">
          <div className="w-20 sm:w-32 h-px bg-white/25" />
          <Star className="w-4 h-4 fill-ocean text-ocean shrink-0" />
          <div className="w-20 sm:w-32 h-px bg-white/25" />
        </div>

        {/* Subtitle */}
        <p className="text-white/55 text-base lg:text-lg max-w-lg leading-relaxed mb-10">
          {data.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <a href="/aplicar">
            <Button
              size="xl"
              className="bg-white text-navy hover:bg-white/95 font-bold group shadow-2xl w-full sm:w-auto"
            >
              Aplica Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <a href="/empleos">
            <Button
              size="xl"
              className="bg-transparent border-2 border-white/30 text-white
                         hover:bg-white/10 hover:border-white/55 font-semibold
                         backdrop-blur-sm w-full sm:w-auto"
            >
              <MapPin className="w-4 h-4" />
              Ver Posiciones
            </Button>
          </a>
        </div>
      </div>

      {/* ── Bottom frosted bar ───────────────────────────────────────── */}
      <div className="relative z-10 border-t border-white/10 bg-black/45 backdrop-blur-md">
        <div className="container mx-auto px-6 py-4
                        flex flex-wrap items-center justify-between gap-4">

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-none">{data.numeroEmpleados}+</p>
                <p className="text-[9px] text-white/35 uppercase tracking-widest mt-0.5">Empleados</p>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-none">{data.lineasCrucero}</p>
                <p className="text-[9px] text-white/35 uppercase tracking-widest mt-0.5">Líneas Crucero</p>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              </div>
              <div>
                <p className="text-base font-bold text-white leading-none">{data.rating}</p>
                <p className="text-[9px] text-white/35 uppercase tracking-widest mt-0.5">+{data.reviews} Reseñas</p>
              </div>
            </div>
          </div>

          {/* Próxima contratación pill */}
          <div className="flex items-center gap-3 bg-white/10 border border-white/15
                          rounded-xl px-4 py-2.5 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <div>
              <p className="text-[9px] text-white/45 font-semibold uppercase tracking-widest leading-none mb-0.5">
                Próxima Contratación
              </p>
              <p className="text-sm font-bold text-white leading-none">{data.proximaLinea}</p>
            </div>
            <div className="w-px h-6 bg-white/15" />
            <p className="text-xs text-white/55">{data.proximaFecha}</p>
            <a href="/empleos">
              <ArrowRight className="w-4 h-4 text-white/55 hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Marquee de líneas de crucero */}
        <div className="border-t border-white/10 py-2.5 overflow-hidden">
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...cruiseLines, ...cruiseLines].map((name, i) => (
              <span
                key={i}
                className="text-[9px] font-bold text-white/20 uppercase tracking-[0.25em] shrink-0"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV12;
