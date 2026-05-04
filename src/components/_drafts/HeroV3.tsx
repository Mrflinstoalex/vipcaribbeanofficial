// Variante 3: Glassmorfismo — fondo difuminado, contenido centrado, tarjetas de vidrio
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Shield, TrendingUp, Anchor } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV3 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden pt-20">

      {/* Blurred background media */}
      <div className="absolute inset-0 z-0 scale-110">
        {showVideo ? (
          <video autoPlay playsInline muted loop className="w-full h-full object-cover">
            <source src={videoSrc!} type="video/mp4" />
          </video>
        ) : (
          <img src={data.image} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="absolute inset-0 z-0 bg-navy/75 backdrop-blur-[2px]" />

      {/* Glow orbs */}
      <div className="absolute top-1/3 -left-48 w-[500px] h-[500px] bg-ocean/20 rounded-full blur-3xl z-0 pointer-events-none" />
      <div className="absolute bottom-1/4 -right-48 w-[500px] h-[500px] bg-ocean/10 rounded-full blur-3xl z-0 pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 lg:px-8 flex flex-col items-center py-16 lg:py-20">

        {/* Social proof badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/15 px-5 py-2.5 rounded-full mb-10">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <span className="w-px h-4 bg-white/20" />
          <span className="text-white/70 text-sm">+{data.reviews} candidatos colocados</span>
        </div>

        {/* Headline — centered */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white text-center leading-[1.05] max-w-4xl">
          {data.titulo.split(" ").map((word, i) =>
            word.toLowerCase() === "cruceros" ? (
              <span
                key={i}
                className="text-transparent bg-clip-text bg-gradient-to-r from-ocean to-ocean-light"
              >
                {word}{" "}
              </span>
            ) : (
              <span key={i}>{word} </span>
            )
          )}
        </h1>

        <p className="text-white/55 text-lg text-center max-w-2xl mt-6 leading-relaxed">
          {data.subtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 mt-10">
          <a href="/aplicar">
            <Button
              size="xl"
              className="bg-ocean text-white hover:bg-ocean/90 font-bold group shadow-xl border-0"
            >
              Aplica Ahora
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
          <a href="/empleos">
            <Button
              size="xl"
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 font-semibold"
            >
              Ver Posiciones
            </Button>
          </a>
        </div>

        {/* Glass stat cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 w-full max-w-3xl">
          {[
            { icon: <TrendingUp className="w-5 h-5" />, value: `${data.numeroEmpleados}+`, label: "Empleados colocados" },
            { icon: <Anchor className="w-5 h-5" />, value: data.lineasCrucero, label: "Líneas de crucero" },
            { icon: <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />, value: data.rating, label: "Rating promedio" },
            { icon: <Shield className="w-5 h-5" />, value: "RD #1", label: "Agencia certificada" },
          ].map(({ icon, value, label }) => (
            <div
              key={label}
              className="bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-5 text-center hover:bg-white/15 transition-colors"
            >
              <div className="w-10 h-10 mx-auto rounded-xl bg-ocean/25 border border-ocean/25 flex items-center justify-center text-ocean-light mb-3">
                {icon}
              </div>
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-[11px] text-white/40 mt-1 leading-tight">{label}</p>
            </div>
          ))}
        </div>

        {/* Próxima contratación pill */}
        <div className="mt-8 bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl px-6 py-4 flex items-center gap-4 animate-float">
          <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
          <div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Próxima contratación</p>
            <p className="text-white font-bold text-sm mt-0.5">
              {data.proximaLinea}
              <span className="font-normal text-white/50"> · {data.proximaFecha}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Wave bottom divider */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        <svg
          viewBox="0 0 1440 72"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full fill-background"
          preserveAspectRatio="none"
        >
          <path d="M0,36 C360,72 1080,0 1440,36 L1440,72 L0,72 Z" />
        </svg>
      </div>
    </section>
  );
};

export default HeroV3;
