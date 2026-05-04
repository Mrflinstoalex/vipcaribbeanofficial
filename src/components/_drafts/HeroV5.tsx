// Variante 5: GreenTrails — heading masivo 3 líneas, card de acción derecha, rating abajo
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Calendar, MapPin, Users } from "lucide-react";
import type { HeroProps } from "@/components/Hero";

const HeroV5 = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;

  // Partir el título en 3 líneas alrededor de "cruceros"
  const words = data.titulo.split(" ");
  const ci = words.findIndex((w) => w.toLowerCase() === "cruceros");
  const line1 = ci > 0 ? words.slice(0, ci).join(" ") : words[0] ?? "";
  const line2 = ci >= 0 ? words[ci] : "";
  const line3 = ci >= 0 ? words.slice(ci + 1).join(" ") : words.slice(1).join(" ");

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden">

      {/* Fondo media */}
      <div className="absolute inset-0 z-0">
        {showVideo ? (
          <video autoPlay playsInline muted loop className="w-full h-full object-cover">
            <source src={videoSrc!} type="video/mp4" />
          </video>
        ) : (
          <img src={data.image} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/45 to-black/55" />
      </div>

      {/* Grid: izquierda (heading + info) / derecha (card) */}
      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1fr_390px] xl:grid-cols-[1fr_430px] gap-6 lg:gap-10 px-6 lg:px-14 xl:px-20 pt-28 pb-10 items-stretch">

        {/* Columna izquierda */}
        <div className="flex flex-col justify-between gap-10">

          {/* Heading de 3 líneas */}
          <div className="pt-2 animate-slide-up">
            <h1 className="font-display font-bold leading-[0.88] tracking-tight">
              {line1 && (
                <span className="block text-white text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {line1}
                </span>
              )}
              {line2 && (
                <span className="block text-ocean-light text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {line2}
                </span>
              )}
              {line3 && (
                <span className="block text-white text-5xl md:text-6xl lg:text-7xl xl:text-8xl">
                  {line3}
                </span>
              )}
            </h1>
          </div>

          {/* Abajo-izquierda: subtítulo + rating */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-6">
            <p className="text-white/58 text-sm lg:text-base leading-relaxed max-w-[300px]">
              {data.subtitle}
            </p>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-white font-bold text-lg">{data.rating}</span>
              <span className="text-white/40 text-sm">+{data.reviews} candidatos</span>
            </div>
          </div>
        </div>

        {/* Columna derecha: card de acción */}
        <div className="self-end mt-8 lg:mt-0">
          <div className="bg-white rounded-3xl p-6 shadow-2xl">

            {/* Cabecera */}
            <div className="mb-5">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">
                Próxima Contratación
              </p>
              <p className="text-xl font-bold text-foreground leading-tight">
                {data.proximaLinea}
              </p>
            </div>

            {/* Fila de fecha + ubicación */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5">
                <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Fecha</p>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    {data.proximaFecha}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 border border-border rounded-xl px-3 py-2.5">
                <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-muted-foreground leading-none mb-0.5">Ubicación</p>
                  <p className="text-sm font-semibold text-foreground leading-tight">
                    Internacional
                  </p>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-3 bg-soft-gray rounded-xl px-4 py-3 mb-5">
              <Users className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">
                  {data.numeroEmpleados}+ empleados colocados
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {data.lineasCrucero} líneas de crucero · Agencia líder RD
                </p>
              </div>
            </div>

            {/* Rating en card */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm font-semibold text-foreground">
                {data.rating}{" "}
                <span className="font-normal text-muted-foreground text-xs">/ 5.0</span>
              </p>
            </div>

            {/* CTAs */}
            <a href="/aplicar" className="block">
              <Button variant="hero" size="default" className="w-full group">
                Aplica Ahora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </a>
            <a href="/empleos" className="block mt-3">
              <Button variant="heroOutline" size="default" className="w-full">
                Ver todas las posiciones
              </Button>
            </a>

          </div>
        </div>

      </div>
    </section>
  );
};

export default HeroV5;
