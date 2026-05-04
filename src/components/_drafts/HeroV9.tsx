// Variante 9: Split Elegance — fondo blanco, imagen full-bleed derecha, heading navy con subrayado decorativo
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Star, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV9 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative bg-white overflow-hidden min-h-screen">
      <div className="flex flex-col lg:flex-row min-h-screen">

        {/* ── Left: content ───────────────────────────────────────────── */}
        <div className="relative z-10 flex flex-col justify-center bg-white w-full lg:w-[42%] px-8 sm:px-12 lg:px-14 xl:px-20 pt-28 pb-12 lg:pt-0 lg:pb-0 space-y-6">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 border border-navy/20 bg-navy/5 text-navy px-4 py-2 rounded-full text-sm font-semibold w-fit">
            <Star className="w-3.5 h-3.5 fill-navy text-navy" />
            <span>Agencia Líder en República Dominicana</span>
          </div>

          {/* Heading — let font size create natural 3-line wrap */}
          <div>
            <h1 className="font-display font-bold text-navy leading-[1.08] text-[2.6rem] sm:text-5xl lg:text-5xl xl:text-6xl 2xl:text-7xl">
              {data.titulo}
            </h1>
            {/* Short decorative wave under heading */}
            <svg
              viewBox="0 0 200 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mt-3 w-40 sm:w-48"
              aria-hidden="true"
            >
              <path
                d="M2 6 C45 1, 100 10, 155 5 C170 3, 190 8, 198 5"
                stroke="hsl(var(--navy))"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Subtitle */}
          <p className="text-base lg:text-[0.95rem] xl:text-lg text-muted-foreground max-w-md leading-relaxed">
            {data.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="/aplicar">
              <Button
                size="xl"
                className="bg-navy hover:bg-navy/90 text-white font-bold group w-full sm:w-auto"
              >
                Aplica Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="/empleos">
              <Button
                size="xl"
                variant="outline"
                className="border-navy/25 text-navy hover:bg-navy/5 font-semibold gap-2 w-full sm:w-auto"
              >
                <MapPin className="w-4 h-4" />
                Ver Posiciones
              </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-6 xl:gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="text-xl font-bold text-navy">{data.numeroEmpleados}+</p>
                <p className="text-xs text-muted-foreground">Empleados Colocados</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-navy" />
              </div>
              <div>
                <p className="text-xl font-bold text-navy">{data.lineasCrucero}</p>
                <p className="text-xs text-muted-foreground">Líneas de Crucero</p>
              </div>
            </div>
          </div>

          {/* Trust bar */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-muted-foreground mb-3 font-medium">
              Con la confianza de las mejores líneas de cruceros
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
              {["Royal Caribbean", "Carnival", "Norwegian", "MSC"].map((name) => (
                <span key={name} className="text-xs font-bold text-gray-400 tracking-tight uppercase">
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right: full-bleed image ──────────────────────────────────── */}
        <div className="relative w-full lg:w-[58%] min-h-[55vw] lg:min-h-0">
          {showVideo ? (
            <video
              autoPlay
              playsInline
              webkit-playsinline="true"
              preload="metadata"
              muted
              loop
              controls={false}
              disablePictureInPicture
              controlsList="nofullscreen noremoteplayback nodownload"
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            >
              <source src={videoSrc!} type="video/mp4" />
            </video>
          ) : (
            <img
              src={data.image}
              alt="Crucero de lujo en el Caribe"
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          {/* Gradient fade: left edge blends into white panel */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent pointer-events-none hidden lg:block" />
          {/* Gradient fade: top on mobile */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none lg:hidden" />

          {/* Próxima Contratación card — desktop */}
          <div className="absolute top-8 right-6 hidden lg:block bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.15)] p-5 w-64">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-navy" />
              </div>
              <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest leading-tight">
                Próxima Contratación
              </p>
            </div>
            <p className="text-lg font-bold text-navy leading-tight mb-3">
              {data.proximaLinea}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span>{data.proximaFecha}</span>
            </div>
            <a
              href="/empleos"
              className="flex items-center gap-1.5 text-sm font-semibold text-navy hover:gap-2.5 transition-all duration-200"
            >
              Más información
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

      </div>

      {/* Próxima Contratación card — mobile (inside content area) */}
      <div className="lg:hidden mx-8 sm:mx-12 mb-10 -mt-2 bg-white rounded-2xl border border-navy/10 shadow-md p-4 flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-navy/10 flex items-center justify-center shrink-0">
          <Calendar className="w-5 h-5 text-navy" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mb-0.5">
            Próxima Contratación
          </p>
          <p className="font-bold text-navy">{data.proximaLinea}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{data.proximaFecha}</p>
        </div>
      </div>
    </section>
  );
};

export default HeroV9;
