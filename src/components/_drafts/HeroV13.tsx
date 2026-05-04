// Variante 13: Frost Aurora — glassmorphism en capas, paneles flotantes, resplandor ambiental
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Ship, Star, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV13 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-navy">

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
        {/* Base overlay — not too dark so the glass depth shows */}
        <div className="absolute inset-0 bg-navy/55" />
      </div>

      {/* ── Ambient glow orbs — aurora effect ────────────────────────── */}
      <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full
                      bg-ocean/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] rounded-full
                      bg-blue-400/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-[300px] h-[300px] rounded-full
                      bg-ocean/10 blur-[80px] pointer-events-none" />

      {/* ── Main layout ──────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center min-h-screen
                      px-6 sm:px-10 lg:px-14 xl:px-20 pt-28 pb-10">
        <div className="w-full max-w-[1280px] mx-auto
                        grid lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_320px] gap-5 xl:gap-8 items-center">

          {/* ── Left: Main frosted glass content panel ─────────────────── */}
          <div>
            {/* Badge above the panel */}
            <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-xl
                            border border-white/25 text-white/90 px-5 py-2 rounded-full
                            text-xs font-bold uppercase tracking-widest mb-6">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>Agencia Líder · República Dominicana</span>
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            </div>

            {/* Glass card */}
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20
                            rounded-3xl p-8 sm:p-10 xl:p-12 shadow-2xl">

              <h1 className="font-display font-bold text-white leading-[1.04]
                             text-[2.4rem] sm:text-5xl lg:text-5xl xl:text-[3.5rem] 2xl:text-6xl mb-5">
                {data.titulo}
              </h1>

              {/* Ocean accent bar */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-1 bg-ocean rounded-full" />
                <div className="w-6 h-1 bg-ocean/40 rounded-full" />
              </div>

              <p className="text-white/60 text-base lg:text-lg leading-relaxed mb-8 max-w-2xl">
                {data.subtitle}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <a href="/aplicar">
                  <Button
                    size="xl"
                    className="bg-ocean hover:bg-ocean/90 text-white font-bold group
                               shadow-[0_8px_32px_rgba(0,150,200,0.4)] w-full sm:w-auto"
                  >
                    Aplica Ahora
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </a>
                <a href="/empleos">
                  <Button
                    size="xl"
                    className="bg-white/10 backdrop-blur-sm border border-white/25 text-white
                               hover:bg-white/20 hover:border-white/40 font-semibold w-full sm:w-auto"
                  >
                    <MapPin className="w-4 h-4" />
                    Ver Posiciones
                  </Button>
                </a>
              </div>

              {/* Inner glass divider — mobile stats */}
              <div className="grid grid-cols-3 gap-px bg-white/10 rounded-2xl overflow-hidden lg:hidden">
                <div className="bg-white/5 backdrop-blur-sm p-4 text-center">
                  <p className="text-xl font-bold text-white">{data.numeroEmpleados}+</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Empleados</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-4 text-center">
                  <p className="text-xl font-bold text-white">{data.lineasCrucero}</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Líneas</p>
                </div>
                <div className="bg-white/5 backdrop-blur-sm p-4 text-center">
                  <p className="text-xl font-bold text-yellow-400">{data.rating}</p>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest mt-1">Rating</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Stacked glass stat cards (desktop only) ─────────── */}
          <div className="hidden lg:flex flex-col gap-4">

            {/* Empleados */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20
                            rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-ocean/20 flex items-center justify-center shrink-0">
                  <Users className="w-4 h-4 text-ocean" />
                </div>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">
                  Empleados colocados
                </p>
              </div>
              <p className="text-4xl font-bold text-white">{data.numeroEmpleados}+</p>
            </div>

            {/* Líneas de crucero */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20
                            rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-ocean/20 flex items-center justify-center shrink-0">
                  <Ship className="w-4 h-4 text-ocean" />
                </div>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">
                  Líneas de crucero
                </p>
              </div>
              <p className="text-4xl font-bold text-white">{data.lineasCrucero}</p>
            </div>

            {/* Rating */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20
                            rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-yellow-400/15 flex items-center justify-center shrink-0">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">
                  Valoración promedio
                </p>
              </div>
              <div className="flex items-baseline gap-2">
                <p className="text-4xl font-bold text-yellow-400">{data.rating}</p>
                <p className="text-xs text-white/35">+{data.reviews} reseñas</p>
              </div>
            </div>

            {/* Próxima contratación */}
            <div className="bg-white/10 backdrop-blur-xl border border-white/20
                            rounded-2xl p-5 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest">
                  Próxima Contratación
                </p>
              </div>
              <p className="text-base font-bold text-white leading-tight mb-2">{data.proximaLinea}</p>
              <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>{data.proximaFecha}</span>
              </div>
              <a
                href="/empleos"
                className="flex items-center gap-1.5 text-sm font-semibold
                           text-ocean hover:text-white transition-colors"
              >
                Ver convocatoria
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile: próxima contratación ─────────────────────────────── */}
      <div className="lg:hidden relative z-10 px-6 sm:px-10 pb-10">
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-4
                        flex items-center gap-4">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shrink-0" />
          <div>
            <p className="text-[10px] text-white/40 font-semibold uppercase tracking-widest mb-0.5">
              Próxima Contratación
            </p>
            <p className="font-bold text-white">{data.proximaLinea}</p>
            <p className="text-sm text-white/45 mt-0.5">{data.proximaFecha}</p>
          </div>
          <a href="/empleos" className="ml-auto">
            <ArrowRight className="w-5 h-5 text-ocean" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HeroV13;
