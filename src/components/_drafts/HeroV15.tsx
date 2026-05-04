// Variante 15: Full-width Banner — imagen edge-to-edge, sin bordes ni sombras
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Users, Anchor } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV15 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  return (
    <section id="hero" className="bg-background">
      {/* HERO IMAGE FULL WIDTH */}
      <div className="relative w-full h-[520px] lg:h-[575px] xl:h-[590px] overflow-hidden">
        {showVideo ? (
          <video
            autoPlay
            playsInline
            muted
            loop
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoSrc!} type="video/mp4" />
          </video>
        ) : (
          <img
            src={data.image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}

        {/* Overlay oscuro similar a la imagen */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/35 to-black/5 pointer-events-none" />
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Contenido limitado al ancho del layout */}
        <div className="relative z-10 mx-auto h-full max-w-[1440px] px-6 lg:px-20 xl:px-28">
          {/* Badge */}
          <div className="absolute top-10 left-6 lg:left-20 xl:left-28 flex items-center gap-2 bg-black/45 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            Agencia Líder · República Dominicana
          </div>

          {/* Título */}
          <div className="absolute left-6 lg:left-20 xl:left-28 top-[47%] -translate-y-1/2">
            <h1 className="font-display font-bold text-white leading-[0.95] tracking-tight text-[52px] sm:text-[64px] lg:text-[72px] xl:text-[78px]">
              <span className="block">Tu Carrera</span>
              <span className="block">en</span>
              <span className="block text-ocean">Cruceros</span>
              <span className="block">Aquí</span>
            </h1>
          </div>

          {/* Widgets derecha */}
          <div className="absolute right-6 lg:right-20 xl:right-28 top-[16%] hidden lg:flex flex-col gap-12">
            {/* Widget: Próxima Contratación */}
            <div className="w-[250px] rounded-xl bg-black/45 backdrop-blur-md px-5 py-4 text-white">
              <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/55">
                <Anchor className="h-3 w-3" />
                Próxima Contratación
              </p>

              <p className="text-base font-bold leading-tight">
                {data.proximaLinea}
              </p>

              <p className="mt-1 text-xs text-white/60">
                {data.proximaFecha}
              </p>

              <div className="mt-5 flex items-end gap-2">
                {[10, 14, 10, 16, 14, 22, 16, 24].map((h, i) => (
                  <div
                    key={i}
                    className="w-[18px] rounded-full bg-ocean"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Widget: Rating */}
            <div className="w-[250px] rounded-xl bg-black/45 backdrop-blur-md px-5 py-4 text-white">
              <p className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/55">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                Rating Candidatos
              </p>

              <div className="flex items-baseline gap-1">
                <p className="text-3xl font-bold leading-none">
                  {data.rating}
                </p>
                <p className="ml-1 text-xs text-white/45">/ 5.0</p>
              </div>

              <svg
                className="mt-4 w-full text-yellow-400"
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

              <p className="mt-2 text-[10px] text-white/45">
                +{data.reviews} reseñas verificadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO DEBAJO */}
      <div className="mx-auto max-w-[1440px] px-6 py-10 lg:px-20 lg:py-12 xl:px-28">
        <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
          {/* Subtítulo + botones */}
          <div>
            <p className="max-w-[560px] text-base leading-relaxed text-muted-foreground lg:text-lg">
              {data.subtitle}
            </p>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row">
              <a href="/aplicar">
                <Button
                  size="xl"
                  className="group min-w-[220px] rounded-xl border-0 bg-black text-white hover:bg-gray-800"
                >
                  Aplica Ahora
                  <ArrowRight className="ml-1 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>

              <a href="/empleos">
                <Button
                  size="xl"
                  variant="outline"
                  className="min-w-[220px] rounded-xl border-2 border-black text-foreground hover:bg-gray-50"
                >
                  Ver Posiciones
                </Button>
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center gap-10 lg:justify-end xl:gap-14">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-black">
                <Users className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-bold text-foreground">
                  {data.numeroEmpleados}+
                </p>
                <p className="text-sm text-muted-foreground">
                  Empleados Colocados
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-black">
                <Anchor className="h-5 w-5" />
              </div>

              <div>
                <p className="text-2xl font-bold text-foreground">
                  {data.lineasCrucero}
                </p>
                <p className="text-sm text-muted-foreground">
                  Líneas de Crucero
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV15;