// Variante 4: Bento Wave — media contenida con ola inferior, widgets flotantes, contenido debajo
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Anchor } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV4 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="bg-background pt-20 pb-12 overflow-hidden">
      <div className="container mx-auto px-4 lg:px-8">

        {/* ── Tarjeta de media ── */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl">

          {/* Media */}
          {showVideo ? (
            <video
              autoPlay playsInline muted loop
              className="w-full h-[440px] lg:h-[580px] object-cover"
            >
              <source src={videoSrc!} type="video/mp4" />
            </video>
          ) : (
            <img
              src={data.image}
              alt="Crucero en el Caribe"
              className="w-full h-[440px] lg:h-[580px] object-cover"
            />
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/10 to-transparent pointer-events-none" />

          {/* Arcos decorativos (como los círculos orbitales de Mars Explorer) */}
          <div className="absolute bottom-8 right-[30%] w-72 h-72 pointer-events-none opacity-60">
            <svg viewBox="0 0 288 288" fill="none" className="w-full h-full text-white/12">
              <circle cx="144" cy="144" r="130" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 7" />
              <circle cx="144" cy="144" r="90"  stroke="currentColor" strokeWidth="1" />
              <circle cx="144" cy="14"  r="6"   fill="currentColor" />
              <circle cx="234" cy="180" r="4"   fill="currentColor" opacity="0.5" />
            </svg>
          </div>

          {/* Badge — arriba izquierda */}
          <div className="absolute top-6 left-6 lg:top-8 lg:left-8 flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 text-white px-4 py-2 rounded-full text-sm font-medium">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            Agencia Líder · República Dominicana
          </div>

          {/* Widget 1 — arriba derecha: próxima contratación (como "Spacewalks") */}
          <div className="absolute top-6 right-6 lg:top-8 lg:right-8 bg-black/35 backdrop-blur-md border border-white/12 text-white px-5 py-4 rounded-2xl animate-float min-w-[190px]">
            <p className="text-[10px] text-white/45 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
              <Anchor className="w-3 h-3" />
              Próxima Contratación
            </p>
            <p className="text-base font-bold leading-tight">{data.proximaLinea}</p>
            <p className="text-xs text-white/50 mt-0.5">{data.proximaFecha}</p>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1 mt-3 h-7">
              {[40, 65, 50, 85, 60, 90, 72].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-ocean/70"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Widget 2 — centro derecha: rating (como "Heart rate") */}
          <div className="absolute top-1/2 -translate-y-1/2 right-6 lg:right-8 bg-black/35 backdrop-blur-md border border-white/12 text-white px-5 py-4 rounded-2xl min-w-[190px]">
            <p className="text-[10px] text-white/45 uppercase tracking-widest font-semibold flex items-center gap-1.5 mb-2">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              Rating Candidatos
            </p>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold">{data.rating}</p>
              <p className="text-xs text-white/35 ml-0.5">/ 5.0</p>
            </div>
            {/* Sparkline */}
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
            <p className="text-[10px] text-white/35 mt-1">+{data.reviews} reseñas verificadas</p>
          </div>

          {/* Título dentro de la tarjeta — sobre el área de la ola */}
          <div className="absolute bottom-20 lg:bottom-24 left-6 lg:left-10 max-w-md lg:max-w-xl z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white leading-[0.92] tracking-tight">
              {data.titulo.split(" ").map((word, i) =>
                word.toLowerCase() === "cruceros" ? (
                  <span key={i} className="text-ocean">{word} </span>
                ) : (
                  <span key={i}>{word} </span>
                )
              )}
            </h1>
          </div>

          {/* Ola inferior con acento ocean */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <svg
              viewBox="0 0 1440 88"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full text-ocean"
              preserveAspectRatio="none"
              style={{ display: "block" }}
            >
              {/* Línea de acento ocean */}
              <path
                d="M0,30 C320,88 880,12 1440,55"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              {/* Relleno fondo (corta la imagen con la forma de ola) */}
              <path
                d="M0,35 C320,88 880,18 1440,60 L1440,88 L0,88 Z"
                className="fill-background"
              />
            </svg>
          </div>
        </div>

        {/* ── Contenido debajo de la ola ── */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 mt-7 lg:mt-8 items-center">

          {/* Izquierda: subtítulo + CTAs */}
          <div className="space-y-6">
            <p className="text-muted-foreground text-lg leading-relaxed max-w-lg">
              {data.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/aplicar">
                <Button variant="hero" size="xl" className="group">
                  Aplica Ahora
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <a href="/empleos">
                <Button variant="heroOutline" size="xl">
                  Ver Posiciones
                </Button>
              </a>
            </div>
          </div>

          {/* Derecha: stats */}
          <div className="flex flex-wrap gap-8 lg:justify-end">
            {[
              {
                value: `${data.numeroEmpleados}+`,
                label: "Empleados Colocados",
                icon: <Users className="w-5 h-5" />,
              },
              {
                value: data.lineasCrucero,
                label: "Líneas de Crucero",
                icon: <Anchor className="w-5 h-5" />,
              },
            ].map(({ value, label, icon }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {icon}
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default HeroV4;
