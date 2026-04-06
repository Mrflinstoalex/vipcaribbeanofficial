import { Button } from "@/components/ui/button";
import { ArrowRight, MapPin, Star, Users } from "lucide-react";

export interface HeroProps {
  titulo: string;
  subtitle: string;
  image: string;
  mediaType: "image" | "video";
  video: boolean | string;
  rating: string;
  reviews: string;
  numeroEmpleados: string;
  lineasCrucero: string;
  proximaLinea: string;
  proximaFecha: string;
}

const Hero = ({ data }: { data: HeroProps }) => {
  const videoSrc = typeof data.video === "string" ? data.video : null;
  const showVideo = data.mediaType === "video" && !!videoSrc;
  return (
    <section
      id="hero"
      className="relative min-h-screen bg-gradient-hero pt-20 overflow-hidden"
    >
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Star className="w-4 h-4 fill-current" />
              <span>Agencia Líder en República Dominicana</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-display font-bold text-foreground leading-tight">
              {data.titulo.split(" ").map((word, index) =>
                word.toLowerCase() === "cruceros" ? (
                  <span key={index} className="text-gradient-coral">
                    {word}{" "}
                  </span>
                ) : (
                  word + " "
                )
              )}
            </h1>

            <p className="text-lg lg:text-xl text-muted-foreground max-w-xl leading-relaxed">
              {data.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <a href="/aplicar">
              <Button variant="hero" size="xl" className="group">
                Aplica Ahora
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button></a>

              <a href="/empleos">
                <Button variant="heroOutline" size="xl">
                Ver Posiciones
              </Button>
              </a>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
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

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary" />
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

          {/* Right Content */}
          <div className="relative animate-slide-in-right">
            <div className="relative rounded-3xl overflow-hidden shadow-lg">
              {/* Video */}
              {data.mediaType === "video" && typeof data.video === "string" && (
                <video
                  autoPlay
                  playsInline
                  webkit-playsinline="true"
  preload="metadata"

                  muted
                  loop
                     controls={false}
      disablePictureInPicture
      controlsList="nofullscreen noremoteplayback nodownload"
                  className="w-full h-[400px] lg:h-[500px] object-cover pointer-events-none"
                >
                                    <source src={videoSrc!} type="video/mp4" />

                </video>
              )}

              {/* Image */}
              {data.mediaType === "image" && (
                <img
                  src={data.image}
                  alt="Crucero de lujo en el Caribe"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
              )}

              {/* Overlay Card */}
              <div className="absolute top-6 right-6 bg-gradient-coral text-primary-foreground p-4 rounded-2xl shadow-coral animate-float">
                <p className="text-sm font-medium opacity-90">
                  Próxima Contratación
                </p>
                <p className="text-xl font-bold">{data.proximaLinea}</p>
                <p className="text-sm opacity-80 mt-1">
                  {data.proximaFecha}
                </p>
              </div>
            </div>

            {/* Floating Rating */}
            <div className="absolute -bottom-4 -left-4 bg-card p-4 rounded-2xl shadow-card border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-coral flex items-center justify-center">
                  <Star className="w-5 h-5 text-primary-foreground fill-current" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {data.rating} Rating
                  </p>
                  <p className="text-xs text-muted-foreground">
                    +{data.reviews} Reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorations */}
      <div className="absolute top-1/4 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-ocean/5 rounded-full blur-3xl -z-10" />
    </section>
  );
};

export default Hero;
