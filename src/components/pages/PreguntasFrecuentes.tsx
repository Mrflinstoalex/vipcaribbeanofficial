import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqItem = {
  id: number;
  pregunta: string;
  respuestaHtml: string;
  order: number;
};

export type FaqCategoria = {
  key: string;
  categoria: string;
  preguntas: FaqItem[];
};

type PreguntasFrecuentesProps = {
  categorias: FaqCategoria[];
  error?: string | null;
};

const PreguntasFrecuentes = ({ categorias, error }: PreguntasFrecuentesProps) => {
  
  return (
    <>
      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-gradient-coral rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
            Preguntas <span className="text-gradient-coral">Frecuentes</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Encuentra respuestas a las preguntas más comunes sobre el proceso de trabajar en cruceros.
          </p>
        </div>

        {/* FAQs por Categoría */}
        <div className="max-w-3xl mx-auto space-y-8">
          {error ? (
            <div className="text-center py-12">
              <p className="text-xl text-red-600 mb-4">
                {error || "No se pudieron cargar las preguntas frecuentes."}
              </p>
              <p className="text-muted-foreground">
                Intenta recargar la página o contáctanos para más ayuda.
              </p>
            </div>
          ) : categorias?.length > 0 ? (
            categorias.map((categoria, catIndex) => (
              <div key={categoria.key ?? catIndex}>
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-sans text-primary">
                    {catIndex + 1}
                  </span>
                  {categoria.categoria}
                </h2>

                <Accordion type="single" collapsible className="space-y-3">
                  {categoria.preguntas.map((faq, faqIndex) => (
                    <AccordionItem
                      key={faq.id ?? faqIndex}
                      value={`${categoria.key}-${faq.id}`}
                      className="border border-border rounded-lg px-4 bg-card"
                    >
                      <AccordionTrigger className="text-left hover:no-underline py-4">
                        <span className="font-medium text-foreground">{faq.pregunta}</span>
                      </AccordionTrigger>

                      <AccordionContent className="text-muted-foreground pb-4">
                        {/* Respuesta viene como HTML desde WP */}
                        <div
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: faq.respuestaHtml }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-muted-foreground">
                No hay preguntas frecuentes disponibles en este momento.
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-hero rounded-2xl p-8 lg:p-12">
          <h3 className="text-2xl font-display font-bold text-foreground mb-4">
            ¿Tienes más preguntas?
          </h3>
          <p className="text-muted-foreground mb-6">
            Nuestro equipo está listo para ayudarte. Contáctanos y resolveremos todas tus dudas.
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
        </div>
      </div>
    </>
  );
};

export default PreguntasFrecuentes;
