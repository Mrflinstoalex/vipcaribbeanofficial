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

  const icons = [Heart, Award, Users, Globe, Heart];




  return (
    <>
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative py-16 bg-gradient-hero">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
                {data.hero.title.split(" ")[0]}{" "}
                <span className="text-gradient-coral">Somos</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {data.hero.description}
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
                  {data.historia.title}
                </h2>
                <div 
                  className="space-y-4 text-muted-foreground [&_p]:mb-4"
                  dangerouslySetInnerHTML={{ __html: data.historia.html }}
                />
              </div>
              <div className="relative">
                <div className="aspect-square rounded-2xl overflow-hidden">
                  <img
                    src={data.historia.image}
                    alt="Nuestra historia"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-gradient-coral text-white p-6 rounded-xl shadow-lg">
                  <div className="text-4xl font-bold">{data.historia.badge.name}</div>
                  <div className="text-sm opacity-90">{data.historia.badge.role}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Misión y Visión */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              {data.misionVision.items.map((item:any, index:number) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-8">
                    <div className="w-14 h-14 bg-gradient-coral rounded-xl flex items-center justify-center mb-6">
                      {index === 0 ? <Target className="w-7 h-7 text-white" /> : <Eye className="w-7 h-7 text-white" />}
                    </div>
                    <h3 className="text-2xl font-display font-bold text-foreground mb-4">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground">{item.description}</p>
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
            {data.valores.items.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {data.valores.items.map((item:any, index:number) => {
                  const Icon = icons[index % icons.length]; 

                  return (
                    <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                           <Icon className="w-7 h-7 text-primary" />

                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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
            {data.equipo.members.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {data.equipo.members.map((miembro:any, index:number) => (
                  <div key={index} className="text-center group">
                    <div className="aspect-square rounded-full overflow-hidden mb-4 mx-auto w-40 border-4 border-white shadow-lg group-hover:border-primary transition-colors">
                      <img
                        src={miembro.image}
                        alt={miembro.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-foreground">{miembro.name}</h3>
                    <p className="text-sm text-primary">{miembro.role}</p>
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
              {data.stats.items.map((stat:any, index:number) => (
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
