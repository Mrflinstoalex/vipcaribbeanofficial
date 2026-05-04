// Variante 16: Executive Cruise — hero full-bleed, datos CMS y CTA de alto contraste
import { Button } from "@/components/ui/button";
import { Anchor, ArrowRight, CalendarDays, Star, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const isFilled = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const HighlightTitle = ({ title }: { title: string }) => {
  const words = title.trim().split(/\s+/);
  const highlightIndex = words.findIndex((word) =>
    word
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes("crucero"),
  );
  const fallbackIndex = words.length > 1 ? words.length - 1 : -1;
  const activeIndex = highlightIndex >= 0 ? highlightIndex : fallbackIndex;

  return (
    <>
      {words.map((word, index) => (
        <span
          key={`${word}-${index}`}
          className={index === activeIndex ? "text-ocean-light" : undefined}
        >
          {word}
          {index < words.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  );
};

const HeroV16 = ({ data }: { data: HeroProps }) => {
  const videoSrc = isFilled(data.video) ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;
  const imageSrc = isFilled(data.image) ? data.image : null;
  const rating = isFilled(data.rating) ? data.rating : "4.9";
  const reviews = isFilled(data.reviews) ? data.reviews : "200+";
  const placed = isFilled(data.numeroEmpleados) ? data.numeroEmpleados : "500";
  const cruiseLines = isFilled(data.lineasCrucero) ? data.lineasCrucero : "12";
  const nextLine = isFilled(data.proximaLinea)
    ? data.proximaLinea
    : "Nuevas vacantes abiertas";
  const nextDate = isFilled(data.proximaFecha)
    ? data.proximaFecha
    : "Entrevistas cada semana";

  return (
    <section id="hero" className="relative isolate overflow-hidden bg-black text-white">
      <div className="absolute inset-0 -z-20">
        {showVideo ? (
          <video
            autoPlay
            playsInline
            muted
            loop
            preload="metadata"
            controls={false}
            disablePictureInPicture
            controlsList="nofullscreen noremoteplayback nodownload"
            className="h-full w-full object-cover"
          >
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : imageSrc ? (
          <img
            src={imageSrc}
            alt=""
            className="h-full w-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#07111f_0%,#0f172a_45%,#083344_100%)]" />
        )}
      </div>

      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(0,0,0,0.88)_0%,rgba(0,0,0,0.62)_42%,rgba(0,0,0,0.2)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-56 bg-gradient-to-t from-black via-black/65 to-transparent" />

      <div className="mx-auto grid min-h-[calc(100svh-3.5rem)] max-w-[1440px] grid-rows-[1fr_auto] px-5 pb-6 pt-24 sm:px-8 lg:min-h-[calc(100svh-4.5rem)] lg:px-16 lg:pb-8 lg:pt-32 xl:px-24">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="max-w-4xl animate-slide-up">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80 backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-ocean-light text-ocean-light" />
              Agencia lider en Republica Dominicana
            </div>

            <h1 className="mt-7 max-w-5xl font-display text-[clamp(3rem,8vw,7.5rem)] font-extrabold leading-[0.9] tracking-normal text-white">
              <HighlightTitle title={data.titulo} />
            </h1>

            {isFilled(data.subtitle) && (
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/80 sm:text-lg lg:text-xl">
                {data.subtitle}
              </p>
            )}

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="xl"
                className="group h-14 rounded-lg bg-white px-7 text-base font-bold text-black shadow-none hover:bg-white/90"
              >
                <a href="/aplicar">
                  Aplica Ahora
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </a>
              </Button>

              <Button
                asChild
                size="xl"
                variant="outline"
                className="h-14 rounded-lg border-white/40 bg-white/5 px-7 text-base font-bold text-white backdrop-blur-md hover:bg-white hover:text-black"
              >
                <a href="/empleos">Ver Posiciones</a>
              </Button>
            </div>
          </div>

          <aside className="hidden animate-slide-in-right lg:block">
            <div className="border border-white/15 bg-black/40 p-5 text-white backdrop-blur-xl">
              <div className="flex items-start justify-between gap-5">
                <div>
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">
                    <Anchor className="h-4 w-4 text-ocean-light" />
                    Proxima contratacion
                  </p>
                  <p className="mt-4 text-2xl font-bold leading-tight">
                    {nextLine}
                  </p>
                  <p className="mt-2 text-sm text-white/60">{nextDate}</p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ocean-light text-black">
                  <CalendarDays className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 border-t border-white/10 pt-5">
                <div>
                  <p className="text-3xl font-extrabold leading-none">{rating}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">
                    Rating
                  </p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold leading-none">+{reviews}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/50">
                    Resenas
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-10 grid gap-3 border-t border-white/10 pt-5 sm:grid-cols-3 lg:mt-12">
          <div className="flex items-center gap-4 bg-white/10 px-4 py-4 backdrop-blur-md">
            <Users className="h-5 w-5 text-ocean-light" />
            <div>
              <p className="text-2xl font-extrabold leading-none">{placed}+</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                Empleados colocados
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 px-4 py-4 backdrop-blur-md">
            <Anchor className="h-5 w-5 text-ocean-light" />
            <div>
              <p className="text-2xl font-extrabold leading-none">
                {cruiseLines}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                Lineas de crucero
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-white/10 px-4 py-4 backdrop-blur-md sm:hidden xl:flex">
            <Star className="h-5 w-5 fill-ocean-light text-ocean-light" />
            <div>
              <p className="text-2xl font-extrabold leading-none">{rating}</p>
              <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-white/60">
                Valoracion candidata
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV16;
