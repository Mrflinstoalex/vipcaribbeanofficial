import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";


const AppointmentSection = () => {
  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Agenda tu Cita
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Cita de <span className="text-gradient-coral">Pre-Entrevista</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
            Da el primer paso hacia tu carrera en cruceros. Reserva tu cita de pre-entrevista con nosotros.
          </p>

          <a href="/reservar-cita">
            <Button size="lg" className="bg-gradient-coral hover:opacity-90 text-primary-foreground shadow-coral px-8 py-6 text-lg">
              <CalendarDays className="mr-2 h-5 w-5" />
              Reservar Mi Cita
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
