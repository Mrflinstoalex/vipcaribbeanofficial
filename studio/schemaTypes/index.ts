import { footer }              from "./footer";
import { paginaLanding }       from "./paginaLanding";
import { paginaContacto }      from "./paginaContacto";
import { paginaQuienesSomos }  from "./paginaQuienesSomos";
import { lineaCrucero }        from "./lineaCrucero";
import { empleo }              from "./empleo";
import { empleoCategoria }     from "./empleoCategoria";
import { evento }              from "./evento";
import { articulo }            from "./articulo";
import { articuloCategoria }   from "./articuloCategoria";
import { faq, faqCategoria }   from "./faq";
import { candidato }           from "./candidato";
import { cita }                from "./cita";
import { fechaBloqueada }      from "./fechaBloqueada";
import { emailTemplate }       from "./emailTemplate";

export const schemaTypes = [
  // Singletons de páginas
  footer,
  paginaLanding,
  paginaContacto,
  paginaQuienesSomos,
  // Contenido dinámico
  lineaCrucero,
  empleoCategoria,
  empleo,
  evento,
  articuloCategoria,
  articulo,
  faqCategoria,
  faq,
  candidato,
  // Citas
  cita,
  fechaBloqueada,
  // Email Templates
  emailTemplate,
];
