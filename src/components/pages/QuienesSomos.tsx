import { Users, Award, Globe, Heart, Target, Eye } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";


interface QuienesSomosProps {
  data: any;     // Datos completos de la página (puede ser null)
  error?: string | null; // Mensaje de error si falló la carga
}

const QuienesSomos: React.FC<QuienesSomosProps> = ({ data, error }) => {
  if (error) {
    return (
      <>
        <main className="pt-24 pb-16">
          <section className="relative py-16 bg-gradient-hero">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
                  Quiénes <span className="text-gradient-coral">Somos</span>
                </h1>
                <div className="mt-12 bg-red-50 border border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
                  <p className="text-xl text-red-700 mb-4">{error}</p>
                  <p className="text-muted-foreground">
                    Estamos trabajando para resolverlo. Puedes intentar recargar la página en unos minutos.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    );
  }
  
 // Valores por defecto seguros
  const acf = data?.acf || {};

  const QuienesSomosData = {
    titulo: acf.quienes_somos_titulo || "Quiénes Somos",
    descripcion: acf.quienes_somos_descripcion || "Somos una agencia dedicada a conectar talento con oportunidades en la industria de cruceros.",
  };

  const HistoriaData = {
    titulo: acf.nuestra_historia_titulo || "Nuestra Historia",
    descripcion: acf.nuestra_historia_descripcion || "<p>Contamos con años de experiencia ayudando a profesionales a cumplir su sueño de trabajar en cruceros alrededor del mundo.</p>",
    name: acf.name || "Fundador",
    position: acf.position || "CEO",
  };

  const historiaImage = 
    typeof acf.historia_image === "string" 
      ? acf.historia_image 
      : acf.historia_image?.url || "/placeholder-historia.jpg"; // Puedes poner una imagen fallback real

 const MisionVisionData = {
    items: [
      {
        titulo: acf.mision_titulo_1 || "Nuestra Misión",
        descripcion: acf.mision_descripcion_1 || "Conectar el mejor talento con las mejores oportunidades en cruceros.",
      },
      {
        titulo: acf.vision_titulo_2 || "Nuestra Visión",
        descripcion: acf.vision_descripcion_2 || "Ser la agencia líder en reclutamiento marítimo en el Caribe y Latinoamérica.",
      },
    ],
  };

  const ValoresData = {
    valores: [
      {
        icon: Heart,
        titulo: acf.valor_titulo_1_ || "Pasión",
        descripcion: acf.valor_descripcion_1 || "Amamos lo que hacemos y lo hacemos con dedicación.",
      },
      {
        icon: Award,
        titulo: acf.valor_titulo_2 || "Excelencia",
        descripcion: acf.valor_descripcion_2 || "Buscamos siempre los más altos estándares.",
      },
      {
        icon: Users,
        titulo: acf.valor_titulo_3 || "Equipo",
        descripcion: acf.valor_descripcion_3 || "Creemos en el trabajo colaborativo y el respeto.",
      },
      {
        icon: Globe,
        titulo: acf.valor_titulo_4 || "Globalidad",
        descripcion: acf.valor_descripcion_4 || "Conectamos personas de todo el mundo con oportunidades internacionales.",
      },
    ].filter(v => v.titulo && v.descripcion), // Solo mostrar si tienen contenido
  };

  const StatsData = {
    stats: [
      { label: "Candidatos Colocados", value: acf.candidatos_colocados ? `${acf.candidatos_colocados}+` : "500+" },
      { label: "Líneas de Cruceros", value: acf.lineas_de_cruceros || "15+" },
      { label: "Años de Experiencia", value: acf.anos_de_experiencia ? `${acf.anos_de_experiencia}+` : "10+" },
      { label: "Tasa de Satisfacción", value: acf.tasa_de_satisfaccion ? `${acf.tasa_de_satisfaccion}%` : "98%" },
    ],
  };

const EquipoData = {
    miembros: Object.keys(acf)
      .filter((key) => key.startsWith("equipo_name_"))
      .map((key) => {
        const index = key.split("_").pop();
        const imageField = acf[`equipo_image_${index}`];

        const imageUrl =
          typeof imageField === "string"
            ? imageField
            : imageField?.url || "/placeholder-equipo.jpg"; // Imagen fallback

        return {
          name: acf[`equipo_name_${index}`] || null,
          position: acf[`equipo_position_${index}`] || null,
          image: imageUrl,
        };
      })
      .filter((m) => m.name && m.position && m.image),
  };



  return (
    <>
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-hero">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
                {QuienesSomosData.titulo.split(" ").slice(0, -1).join(" ")}{" "}
                <span className="text-gradient-coral">Somos</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {QuienesSomosData.descripcion}
              </p>
            </div>
          </div>
        </section>

        {/* Historia */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-6">
                  {HistoriaData.titulo}
                </h2>
                <div 
                  className="space-y-4 text-muted-foreground [&_p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: HistoriaData.descripcion }}
                />
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={historiaImage}
                    alt="Nuestra historia"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gradient-coral text-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold">{HistoriaData.name}</div>
                  <div className="text-sm opacity-90">{HistoriaData.position}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {MisionVisionData.items.map((item, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-coral rounded-xl flex items-center justify-center mb-6">
                      {index === 0 ? <Target className="w-7 h-7 text-white" /> : <Eye className="w-7 h-7 text-white" />}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                      {item.titulo}
                    </h3>
                    <p className="text-muted-foreground">{item.descripcion}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              Nuestros Valores
            </h2>
            {ValoresData.valores.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {ValoresData.valores.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <IconComponent className="w-7 h-7 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.titulo}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.descripcion}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">Nuestros valores guían cada decisión que tomamos.</p>
            )}
          </div>
        </section>

        {/* Equipo */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-3xl font-display font-bold text-foreground text-center mb-12">
              Nuestro Equipo
            </h2>
            {EquipoData.miembros.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {EquipoData.miembros.map((miembro, index) => (
                  <div key={index} className="text-center group">
                    <div className="aspect-square rounded-full overflow-hidden mb-4 mx-auto w-40 border-4 border-white shadow-lg group-hover:border-primary transition-colors">
                      <img
                        src={miembro.image}
                        alt={miembro.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-foreground">{miembro.name}</h3>
                    <p className="text-sm text-primary">{miembro.position}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground text-lg">
                Un equipo comprometido y profesional trabaja día a día para ayudarte a alcanzar tus metas.
              </p>
            )}
          </div>
        </section>

        {/* Estadísticas */}
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {StatsData.stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-4xl lg:text-5xl font-display font-bold text-gradient-coral mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default QuienesSomos;
