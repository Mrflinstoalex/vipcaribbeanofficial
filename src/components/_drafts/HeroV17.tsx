// Variante 17: Editorial Split — claro, premium y enfocado en conversion
import { Button } from "@/components/ui/button";
import { Anchor, ArrowRight, CalendarDays, CheckCircle2, Star, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const isFilled = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const Stat = ({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Users;
  value: string;
  label: string;
}) => (
  <div className="flex items-center gap-3 border-l border-black/10 pl-4 first:border-l-0 first:pl-0">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-2xl font-extrabold leading-none text-foreground">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
    </div>
  </div>
);

const HeroV17 = ({ data }: { data: HeroProps }) => {
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
    <section id="hero" className="overflow-hidden bg-white pt-20 text-foreground">
      <div className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-[1440px] items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-16 lg:py-14 xl:px-24">
        <div className="max-w-3xl animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-soft-gray px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-ocean" />
            Reclutamiento oficial para cruceros
          </div>

          <h1 className="mt-7 font-display text-[clamp(3rem,7vw,6.7rem)] font-extrabold leading-[0.92] tracking-normal">
            {data.titulo}
          </h1>

          {isFilled(data.subtitle) && (
            <p className="mt-7 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
              {data.subtitle}
            </p>
          )}

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
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

          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            <Stat icon={Users} value={`${placed}+`} label="Colocados" />
            <Stat icon={Anchor} value={cruiseLines} label="Lineas" />
            <Stat icon={Star} value={rating} label="Rating" />
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden bg-black lg:min-h-[620px]">
          {showVideo ? (
            <video
              autoPlay
              playsInline
              muted
              loop
              preload="metadata"
              controls={false}
              className="absolute inset-0 h-full w-full object-cover"
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : imageSrc ? (
            <img src={imageSrc} alt="" className="absolute inset-0 h-full w-full object-cover" loading="eager" />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#0f172a_0%,#164e63_100%)]" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 grid gap-3 p-4 sm:grid-cols-[1fr_auto] sm:p-6">
            <div className="bg-white p-4 text-black">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-black/50">
                <CalendarDays className="h-4 w-4" />
                Proxima contratacion
              </p>
              <p className="mt-2 text-xl font-extrabold leading-tight">{nextLine}</p>
              <p className="mt-1 text-sm text-black/55">{nextDate}</p>
            </div>
            <div className="flex items-center gap-3 bg-ocean px-5 py-4 text-white">
              <Star className="h-5 w-5 fill-white" />
              <div>
                <p className="text-2xl font-extrabold leading-none">+{reviews}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">
                  Resenas
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroV17;
