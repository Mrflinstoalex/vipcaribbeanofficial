import { hr } from "date-fns/locale";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";

const Footer = ({ acf }: { acf: any }) => {

  return (
    <footer className="bg-secondary py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <a href="#" className="inline-block mb-4">
              <span className="text-2xl font-display font-bold text-foreground">
                VIP <span className="text-gradient-coral">Caribbean</span>
              </span>
            </a>
            <p className="text-muted-foreground mb-6">
              {acf.footer_description}
            </p>
            <div className="flex gap-4">
              <a
                href={acf.facebook_link}
                  target="_blank"
  rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href={acf.instagram_link}
                    target="_blank"
  rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
             {/* <a
                href="#"
                className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Linkedin className="w-5 h-5" />
              </a> */}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-3">
              {[{route:"Inicio", href:"/"}, {route:"Contacto", href:"contacto"}].map(
                (link, index) => (
                  <li key={index}>
                    <a
                      href={`${link.href}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.route}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Servicios</h4>
            <ul className="space-y-3">
              {[
                "Colocación Laboral",
                "Capacitación",
                "Documentación",
                "Entrevistas",
                "Asesoría",
              ].map((service) => (
                <li key={service}>
                  <a
                    href="#servicios"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-foreground mb-4">Contacto</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />

                <span className="text-muted-foreground text-sm line-clamp-2">
                  {acf.footer_direccion}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary" />
                <a
                  href={acf.footer_phone}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {acf.footer_phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary" />
                <a
                  href={`mailto:${acf.footer_email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {acf.footer_email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted-foreground text-sm">
            © 2025 VIP Caribbean. Todos los derechos reservados.
          </p>
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Política de Privacidad
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Términos de Servicio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
