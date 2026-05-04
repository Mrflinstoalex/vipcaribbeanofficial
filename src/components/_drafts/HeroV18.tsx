// Variante 18: Boarding Pass — oscuro, compacto y con modulo de accion
import { Button } from "@/components/ui/button";
import { Anchor, ArrowRight, CalendarDays, FileCheck2, Ship, Star, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const isFilled = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const HeroV18 = ({ data }: { data: HeroProps }) => {
  const videoSrc = isFilled(data.video) ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;
  const imageSrc = isFilled(data.image) ? data.image : null;
  const rating = isFilled(data.rating) ? data.rating : "4.9";
  const reviews = isFilled(data.reviews) ? data.reviews : "200+";
  const placed = isFilled(data.numeroEmpleados) ? data.numeroEmpleados : "500";
  const cruiseLines = isFilled(data.lineasCrucero) ? data.lineasCrucero : "12";
  const nextLine = isFilled(data.proximaLinea) ? data.proximaLinea : "Vacantes abiertas";
  const nextDate = isFilled(data.proximaFecha) ? data.proximaFecha : "Entrevistas semanales";

  return (
    <section id="hero" className="relative isolate overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-y-0 right-0 -z-20 w-full lg:w-[58%]">
        {showVideo ? (
          <video autoPlay playsInline muted loop preload="metadata" controls={false} className="h-full w-full object-cover">
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : imageSrc ? (
          <img src={imageSrc} alt="" className="h-full w-full object-cover" loading="eager" />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#0f172a_0%,#155e75_100%)]" />
        )}
      </div>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#07111f_0%,rgba(7,17,31,0.96)_40%,rgba(7,17,31,0.62)_70%,rgba(7,17,31,0.25)_100%)]" />

      <div className="mx-auto grid min-h-[calc(100svh-4rem)] max-w-[1440px] items-end px-5 pb-6 pt-28 sm:px-8 lg:min-h-[calc(100svh-5rem)] lg:px-16 lg:pb-10 lg:pt-32 xl:px-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end">
          <div className="max-w-4xl animate-slide-up">
            <div className="inline-flex items-center gap-2 border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-white/75 backdrop-blur-md">
              <Ship className="h-4 w-4 text-ocean-light" />
              Carrera internacional en cruceros
            </div>

            <h1 className="mt-7 max-w-5xl font-display text-[clamp(3.2rem,8vw,7.2rem)] font-extrabold leading-[0.88] tracking-normal">
              {data.titulo}
            </h1>

            {isFilled(data.subtitle) && (
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
                {data.subtitle}
              </p>
            )}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" className="group rounded-lg bg-ocean-light text-black shadow-none hover:bg-white">
                <a href="/aplicar">
                  Aplica Ahora
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button asChild size="xl" variant="outline" className="rounded-lg border-white/35 bg-white/5 text-white backdrop-blur-md hover:bg-white hover:text-black">
                <a href="/reservar-cita">Reservar Cita</a>
              </Button>
            </div>
          </div>

          <div className="bg-white text-black shadow-lg">
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b border-black/10 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-black/45">
                  Boarding pass
                </p>
                <p className="mt-2 text-2xl font-extrabold leading-tight">Pre-entrevista VIP</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
                <FileCheck2 className="h-5 w-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 border-b border-black/10">
              <div className="p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/45">Linea</p>
                <p className="mt-2 text-lg font-extrabold leading-tight">{nextLine}</p>
              </div>
              <div className="border-l border-black/10 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/45">Fecha</p>
                <p className="mt-2 text-lg font-extrabold leading-tight">{nextDate}</p>
              </div>
            </div>

            <div className="grid grid-cols-3">
              <div className="p-5">
                <Users className="mb-3 h-5 w-5 text-ocean" />
                <p className="text-2xl font-extrabold leading-none">{placed}+</p>
                <p className="mt-1 text-xs text-black/50">Colocados</p>
              </div>
              <div className="border-l border-black/10 p-5">
                <Anchor className="mb-3 h-5 w-5 text-ocean" />
                <p className="text-2xl font-extrabold leading-none">{cruiseLines}</p>
                <p className="mt-1 text-xs text-black/50">Lineas</p>
              </div>
              <div className="border-l border-black/10 p-5">
                <Star className="mb-3 h-5 w-5 fill-ocean text-ocean" />
                <p className="text-2xl font-extrabold leading-none">{rating}</p>
                <p className="mt-1 text-xs text-black/50">+{reviews}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV18;
