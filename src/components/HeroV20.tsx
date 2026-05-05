// Variante 11: Command Dark — panel navy sólido, imagen con clip-path diagonal, acento ocean
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, MapPin, Shield, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV11 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative bg-navy overflow-hidden min-h-screen">

      {/* ── Mobile: imagen de fondo a baja opacidad ──────────────────── */}
      <div className="lg:hidden absolute inset-0 z-0">
        {showVideo ? (
          <video
            autoPlay playsInline webkit-playsinline="true" preload="metadata"
            muted loop controls={false} disablePictureInPicture
            controlsList="nofullscreen noremoteplayback nodownload"
            className="w-full h-full object-cover pointer-events-none opacity-20"
          >
            <source src={videoSrc!} type="video/mp4" />
          </video>
        ) : (
          <img src={data.image} alt="" className="w-full h-full object-cover opacity-20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/50 to-navy/80" />
      </div>

      {/* ── Desktop: panel de imagen con borde diagonal ──────────────── */}
      <div
        className="hidden lg:block absolute right-0 top-0 bottom-0"
        style={{ width: "58%", clipPath: "polygon(9% 0, 100% 0, 100% 100%, 0% 100%)" }}
      >
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
          <img
            src={data.image}
            alt="Crucero de lujo"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-navy/15" />

        {/* Próxima Contratación card — desktop */}
        <div className="absolute top-[96px] right-8 bg-white rounded-2xl
                        shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-5 w-64">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">
              Convocatoria Abierta con:
            </p>
          </div>
          <p className="text-lg font-bold text-navy leading-tight mb-2">{data.proximaLinea}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{data.proximaFecha}</span>
          </div>
          <a
            href="/empleos"
            className="flex items-center justify-between text-sm font-bold
                       text-ocean hover:text-ocean-light transition-colors
                       pt-3 border-t border-gray-100"
          >
            Ver convocatoria
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ── Left: content panel ──────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col justify-center w-full lg:w-[50%] xl:w-[47%]
                      min-h-screen px-8 sm:px-12 lg:px-14 xl:px-20
                      pt-28 pb-12 lg:pt-0 lg:pb-0">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 border border-white/15 bg-white/10
                        text-white/75 px-4 py-2 rounded-full text-sm font-medium w-fit mb-8">
          <Shield className="w-3.5 h-3.5 text-ocean" />
          <span>Agencia Certificada · Rep. Dominicana</span>
        </div>

        {/* Heading */}
        <h1 className="font-display font-bold text-white leading-[1.04]
                       text-[2.6rem] sm:text-5xl lg:text-5xl xl:text-[3.4rem] 2xl:text-6xl mb-5">
          {data.titulo}
        </h1>

        {/* Ocean accent rule */}
        <div className="w-14 h-1 bg-ocean rounded-full mb-6" />

        {/* Subtitle */}
        <p className="text-white/50 text-base lg:text-[0.95rem] xl:text-lg max-w-md leading-relaxed mb-8">
          {data.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <a href="/aplicar">
            <Button
              size="xl"
              className="bg-ocean hover:bg-ocean/90 text-white font-bold group
                         shadow-[0_8px_32px_rgba(0,150,200,0.35)] w-full sm:w-auto"
            >
              Aplica Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <a href="/#oportunidades">
            <Button
              size="xl"
              className="bg-transparent border-2 border-white/20 text-white
                         hover:bg-white/10 hover:border-white/40 font-semibold w-full sm:w-auto"
            >
              Ver Posiciones
            </Button>
          </a>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 max-w-[290px]">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <Users className="w-4 h-4 text-ocean mb-2" />
            <p className="text-2xl font-bold text-white">{data.numeroEmpleados}+</p>
            <p className="text-[10px] text-white/35 uppercase tracking-widest mt-1">Empleados</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <MapPin className="w-4 h-4 text-ocean mb-2" />
            <p className="text-2xl font-bold text-white">{data.lineasCrucero}</p>
            <p className="text-[10px] text-white/35 uppercase tracking-widest mt-1">Líneas</p>
          </div>
        </div>
      </div>

      {/* ── Mobile: próxima contratación ─────────────────────────────── */}
      <div className="lg:hidden relative z-10 px-8 sm:px-12 pb-10">
        <div className="bg-white/10 border border-white/15 backdrop-blur-sm rounded-2xl p-4
                        flex items-center gap-4">
          <div className="w-9 h-9 rounded-full bg-ocean/20 flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4 text-ocean" />
          </div>
          <div>
            <p className="text-[10px] text-white/45 font-semibold uppercase tracking-widest mb-0.5">
              Convocatoria Abierta con:
            </p>
            <p className="font-bold text-white">{data.proximaLinea}</p>
            <p className="text-sm text-white/55 mt-0.5">{data.proximaFecha}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV11;
