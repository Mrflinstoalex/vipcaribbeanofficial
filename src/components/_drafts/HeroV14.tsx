// Variante 14: Full-bleed Immersive — imagen edge-to-edge, widgets flotantes, todo dentro del hero
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Anchor } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV14 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">

      {/* Full-bleed media */}
      {showVideo ? (
        <video autoPlay playsInline muted loop className="absolute inset-0 w-full h-full object-cover">
          <source src={videoSrc!} type="video/mp4" />
        </video>
      ) : (
        <img src={data.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
      )}

      {/* Gradiente lateral: oscurece la izquierda donde va el texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10 pointer-events-none" />
      {/* Gradiente vertical sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/65 pointer-events-none" />

      {/* Contenido — grid de 2 columnas, cada una con su propio flujo top→bottom */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-2 gap-x-10 px-6 lg:px-14 pt-24 pb-12">

        {/* ═══════════════════════ COLUMNA IZQUIERDA ═══════════════════════ */}
        <div className="flex flex-col">

          {/* Badge — top */}
          <div className="flex">
            <div className="flex items-center gap-2 bg-black/45 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              Agencia Líder · República Dominicana
            </div>
          </div>

          {/* Spacer empuja el resto al bottom */}
          <div className="flex-1" />

          {/* Título + subtítulo + CTAs — bottom */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-[0.95] tracking-tight">
              {data.titulo.split(" ").map((word, i) =>
                word.toLowerCase() === "cruceros" ? (
                  <span key={i} className="text-ocean">{word} </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h1>

            <p className="text-white/75 text-base lg:text-lg leading-relaxed max-w-md">
              {data.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a href="/aplicar">
                <Button
                  size="xl"
                  className="group bg-white text-gray-900 hover:bg-white/90 font-semibold border-0 rounded-xl"
                >
                  Aplica Ahora
                  <ArrowRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="/empleos">
                <Button
                  size="xl"
                  variant="outline"
                  className="border-white/70 text-white hover:bg-white/10 hover:text-white hover:border-white rounded-xl bg-transparent"
                >
                  Ver Posiciones
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* ═══════════════════════ COLUMNA DERECHA ═══════════════════════ */}
        <div className="hidden lg:flex flex-col items-end">

          {/* Widget: próxima contratación — top */}
          <div className="bg-black/45 backdrop-blur-md border border-white/10 text-white px-5 py-4 rounded-2xl w-64">
            <p className="text-[10px] text-white/55 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-3">
              <Anchor className="w-3 h-3" />
              Próxima Contratación
            </p>
            <p className="text-lg font-bold leading-tight">{data.proximaLinea}</p>
            <p className="text-xs text-white/55 mt-1">{data.proximaFecha}</p>
            {/* Dots/píldoras verticales */}
            <div className="flex items-center justify-between gap-1.5 mt-4 h-6">
              {[55, 75, 60, 100, 70, 90, 80, 65].map((h, i) => (
                <div
                  key={i}
                  className="w-2.5 rounded-full bg-ocean"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Spacer flexible — empuja Rating al medio */}
          <div className="flex-1 flex items-center">
            {/* Widget: rating — vertical center */}
            <div className="bg-black/45 backdrop-blur-md border border-white/10 text-white px-5 py-4 rounded-2xl w-64">
              <p className="text-[10px] text-white/55 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                Rating Candidatos
              </p>
              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold leading-none">{data.rating}</p>
                <p className="text-xs text-white/45 ml-1">/ 5.0</p>
              </div>
              <svg
                className="mt-2 w-full text-yellow-400"
                viewBox="0 0 160 36"
                fill="none"
                preserveAspectRatio="none"
                style={{ height: 36 }}
              >
                <polyline
                  points="0,32 22,24 44,27 66,14 88,20 110,7 132,14 160,8"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="160" cy="8" r="3.5" fill="currentColor" />
              </svg>
              <p className="text-[10px] text-white/45 mt-1.5">+{data.reviews} reseñas verificadas</p>
            </div>
          </div>

          {/* Stats — bottom */}
          <div className="flex gap-8">
            {[
              { value: `${data.numeroEmpleados}+`, label: "Empleados Colocados", icon: <Users className="w-5 h-5" /> },
              { value: String(data.lineasCrucero), label: "Líneas de Crucero", icon: <Anchor className="w-5 h-5" /> },
            ].map(({ value, label, icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white flex-shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-tight">{value}</p>
                  <p className="text-xs text-white/65 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroV14;
