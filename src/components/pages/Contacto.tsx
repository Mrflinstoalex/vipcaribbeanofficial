import { MapPin, Phone, Mail, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ContactData {
  contactos_titulo?: string;
  contactos_descripcion?: string;
  contactos_direccion?: string;
  contactos_phones?: string;
  contactos_horario_de_oficina?: string;
  contactos_email?: string;
}

interface ContactoProps {
  data: ContactData;
  error?: string | null;
}

const Contacto: React.FC<ContactoProps> = ({ data = {}, error }) => {
  // Valores por defecto seguros y realistas
  const defaults = {
    titulo: "Contáctanos",
    descripcion: "Estamos aquí para ayudarte en tu proceso de aplicación para trabajar en cruceros. ¡No dudes en comunicarte con nosotros!",
    direccion: "Costambar, Puerto Plata\nRepública Dominicana",
    phones: "+1 (809) 555-1234\n+1 (849) 555-5678",
    horario: "Lunes a Viernes: 9:00 AM - 5:00 PM\nSábados: 9:00 AM - 1:00 PM",
    email: "info@vipcaribbean.com",
  };

  const info = {
    contactos_titulo: data.contactos_titulo || defaults.titulo,
    contactos_descripcion: data.contactos_descripcion || defaults.descripcion,
    contactos_direccion: data.contactos_direccion || defaults.direccion,
    contactos_phones: data.contactos_phones || defaults.phones,
    contactos_horario_de_oficina: data.contactos_horario_de_oficina || defaults.horario,
    contactos_email: data.contactos_email || defaults.email,
  };

  // Si hay error grave de carga, mostramos mensaje prioritario
  if (error) {
    return (
      <>
        <section className="pt-24 lg:pt-32 pb-12 lg:pb-16 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
                Contacta con <span className="text-gradient-coral">Nosotros</span>
              </h1>
              <div className="mt-12 max-w-2xl mx-auto">
                <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
                  <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <p className="text-xl text-red-700 mb-4">{error}</p>
                  <p className="text-muted-foreground mb-6">
                    Mientras tanto, puedes contactarnos por WhatsApp o email directo:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a
                      href="https://wa.me/18095551234"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-coral text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                      Contactar por WhatsApp
                    </a>
                    <a
                      href="mailto:info@vipcaribbean.com"
                      className="inline-flex items-center justify-center gap-2 border border-border bg-background text-foreground px-6 py-3 rounded-lg font-medium hover:bg-secondary transition-colors"
                    >
                      Enviar Email
                    </a>
                  </div>
                  <Button 
                    variant="outline" 
                    className="mt-6"
                    onClick={() => window.location.reload()}
                  >
                    Recargar página
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-12 lg:pb-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              {info.contactos_titulo.includes("Nosotros") 
                ? <>Contacta con <span className="text-gradient-coral">Nosotros</span></>
                : info.contactos_titulo
              }
            </h1>
            <p className="text-lg text-muted-foreground">
              {info.contactos_descripcion}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info & Map */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Dirección
                      </h3>
                      <p className="text-muted-foreground whitespace-pre-line">
                        {info.contactos_direccion}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Phone className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Teléfonos
                      </h3>
                      <div className="space-y-1">
                        <span className="block whitespace-pre-line text-muted-foreground">
                          {info.contactos_phones}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Horario de Oficina
                      </h3>
                      <p className="block whitespace-pre-line text-muted-foreground">
                        {info.contactos_horario_de_oficina}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        Correo Electrónico
                      </h3>
                      <a
                        href={`mailto:${info.contactos_email}`}
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        {info.contactos_email}
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map */}
            <div className="h-[400px] lg:h-full min-h-[500px] rounded-2xl overflow-hidden shadow-xl border border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3765.123456789!2d-70.7058!3d19.7972!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8eb1c4f92c847e27%3A0x123456789!2sCostambar%2C%20Puerto%20Plata%2C%20Dominican%20Republic!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación VIP Caribbean"
                className="grayscale hover:grayscale-0 transition-all duration-500"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Contacto;