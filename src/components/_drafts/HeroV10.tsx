// Variante 10: Panoramic Frost — imagen full-screen, gradiente izquierda-derecha, panel glassmorphism, card flotante
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, ChevronDown, MapPin, Star, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV10 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden bg-navy">

      {/* ── Full-bleed background ────────────────────────────────────── */}
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
        {/* Left-heavy gradient: content readable left, image revealed right */}
        <div className="absolute inset-0 bg-gradient-to-r from-navy/90 via-navy/65 to-navy/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy/60 via-transparent to-navy/30" />
      </div>

      {/* ── Content — left-anchored ──────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center min-h-screen
                      px-8 sm:px-12 lg:px-16 xl:px-24 pt-28 pb-16 max-w-[680px]">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm
                        border border-white/20 text-white/90 px-4 py-2 rounded-full
                        text-sm font-semibold w-fit mb-7">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span>Agencia #1 · República Dominicana</span>
        </div>

        {/* Heading */}
        <h1 className="font-display font-bold text-white leading-[1.04]
                       text-[2.8rem] sm:text-5xl lg:text-6xl xl:text-[4.25rem] mb-6">
          {data.titulo}
        </h1>

        {/* Subtitle */}
        <p className="text-white/55 text-base lg:text-lg max-w-[480px] leading-relaxed mb-8">
          {data.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
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
                         hover:bg-white/10 hover:border-white/55 font-semibold w-full sm:w-auto"
            >
              <MapPin className="w-4 h-4" />
              Ver Posiciones
            </Button>
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-start gap-8 pt-8 border-t border-white/10">
          <div>
            <p className="text-3xl lg:text-4xl font-bold text-white">{data.numeroEmpleados}+</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Empleados Colocados</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block self-center" />
          <div>
            <p className="text-3xl lg:text-4xl font-bold text-white">{data.lineasCrucero}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Líneas de Crucero</p>
          </div>
          <div className="w-px h-12 bg-white/10 hidden sm:block self-center" />
          <div>
            <div className="flex items-end gap-1">
              <p className="text-3xl lg:text-4xl font-bold text-yellow-400">{data.rating}</p>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mb-1" />
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">+{data.reviews} Reseñas</p>
          </div>
        </div>
      </div>

      {/* ── Glassmorphism card — desktop top-right ───────────────────── */}
      <div className="absolute top-24 right-6 lg:right-10 z-20 hidden md:block">
        <div className="bg-white/10 backdrop-blur-xl border border-white/25
                        text-white rounded-2xl shadow-2xl p-5 w-64">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <p className="text-[10px] text-white/55 font-semibold uppercase tracking-widest">
              Próxima Contratación
            </p>
          </div>
          <p className="text-lg font-bold leading-tight mb-2">{data.proximaLinea}</p>
          <div className="flex items-center gap-2 text-sm text-white/55">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{data.proximaFecha}</span>
          </div>
          <a
            href="/empleos"
            className="flex items-center gap-1.5 text-sm font-semibold mt-4 pt-3
                       border-t border-white/15 text-white/75 hover:text-white transition-colors"
          >
            Ver convocatorias
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* ── Mobile: próxima contratación ─────────────────────────────── */}
      <div className="md:hidden relative z-10 px-8 sm:px-12 pb-10 -mt-4">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4
                        flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] text-white/45 font-semibold uppercase tracking-widest mb-0.5">
              Próxima Contratación
            </p>
            <p className="font-bold text-white">{data.proximaLinea}</p>
            <p className="text-sm text-white/55 mt-0.5">{data.proximaFecha}</p>
          </div>
        </div>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 right-8 z-10 flex-col items-center gap-2
                      text-white/25 hidden md:flex">
        <div className="w-px h-10 bg-white/15" />
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </div>
    </section>
  );
};

export default HeroV10;
