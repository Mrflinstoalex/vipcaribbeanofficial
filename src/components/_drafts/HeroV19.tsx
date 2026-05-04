// Variante 19: Panoramic Desk — imagen superior, contenido denso y stats ejecutivos
import { Button } from "@/components/ui/button";
import { Anchor, ArrowRight, CalendarClock, Globe2, Star, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const isFilled = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const HeroV19 = ({ data }: { data: HeroProps }) => {
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
    <section id="hero" className="bg-warm-white pt-20 text-foreground">
      <div className="mx-auto max-w-[1440px] px-5 py-6 sm:px-8 lg:px-16 lg:py-10 xl:px-24">
        <div className="relative min-h-[340px] overflow-hidden bg-black lg:min-h-[430px]">
          {showVideo ? (
            <video autoPlay playsInline muted loop preload="metadata" controls={false} className="absolute inset-0 h-full w-full object-cover">
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : imageSrc ? (
            <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#0e7490_100%)]" />
          )}
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.7)_0%,rgba(0,0,0,0.25)_48%,rgba(0,0,0,0.05)_100%)]" />
          <div className="absolute left-5 top-5 flex items-center gap-2 bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-black sm:left-7 sm:top-7">
            <Globe2 className="h-4 w-4 text-ocean" />
            Desde RD hacia el mundo
          </div>
          <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:left-7 sm:right-auto sm:grid-cols-2">
            <div className="bg-black/65 px-4 py-3 text-white backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.16em] text-white/55">Proxima linea</p>
              <p className="mt-1 text-lg font-extrabold">{nextLine}</p>
            </div>
            <div className="bg-white px-4 py-3 text-black">
              <p className="text-xs uppercase tracking-[0.16em] text-black/45">Fecha</p>
              <p className="mt-1 text-lg font-extrabold">{nextDate}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 bg-white px-5 py-8 sm:px-7 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-9 lg:py-10">
          <div className="max-w-4xl">
            <h1 className="font-display text-[clamp(3rem,7vw,6.4rem)] font-extrabold leading-[0.9] tracking-normal">
              {data.titulo}
            </h1>
            {isFilled(data.subtitle) && (
              <p className="mt-6 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                {data.subtitle}
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="xl" className="group rounded-lg bg-black text-white hover:bg-black/85">
                <a href="/aplicar">
                  Aplica Ahora
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>
              <Button asChild size="xl" variant="outline" className="rounded-lg border-2 border-black text-black hover:bg-black hover:text-white">
                <a href="/empleos">Ver Posiciones</a>
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="flex items-center justify-between border border-black/10 px-5 py-4">
              <div>
                <p className="text-3xl font-extrabold leading-none">{placed}+</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Empleados colocados
                </p>
              </div>
              <Users className="h-6 w-6 text-ocean" />
            </div>
            <div className="flex items-center justify-between border border-black/10 px-5 py-4">
              <div>
                <p className="text-3xl font-extrabold leading-none">{cruiseLines}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  Lineas asociadas
                </p>
              </div>
              <Anchor className="h-6 w-6 text-ocean" />
            </div>
            <div className="flex items-center justify-between border border-black/10 px-5 py-4">
              <div>
                <p className="text-3xl font-extrabold leading-none">{rating}</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  +{reviews} resenas
                </p>
              </div>
              <Star className="h-6 w-6 fill-ocean text-ocean" />
            </div>
            <div className="flex items-center justify-between border border-black/10 bg-black px-5 py-4 text-white">
              <div>
                <p className="text-lg font-extrabold leading-tight">Agenda tu evaluacion</p>
                <p className="mt-1 text-sm text-white/60">Pre-entrevista disponible</p>
              </div>
              <CalendarClock className="h-6 w-6 text-ocean-light" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV19;
