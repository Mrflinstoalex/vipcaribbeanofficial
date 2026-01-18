import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  User,
  Mail,
  Phone,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

function generarHorasCada5Minutos() {
  const horas: string[] = [];
  const inicio = new Date();
  inicio.setHours(9, 0, 0, 0); // 9:00 AM

  const fin = new Date();
  fin.setHours(12, 0, 0, 0); // 12:00 PM

  let current = new Date(inicio);
  while (current <= fin) {
    const horas12 = current.getHours() % 12 || 12;
    const minutos = current.getMinutes().toString().padStart(2, "0");
    const ampm = current.getHours() >= 12 ? "PM" : "AM";
    horas.push(`${horas12}:${minutos} ${ampm}`);
    current.setMinutes(current.getMinutes() + 5);
  }
  return horas;
}

function toISODate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function ReservarCita() {
  const { toast } = useToast();

  const horasDisponibles = useMemo(() => generarHorasCada5Minutos(), []);

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Bloqueos desde WordPress
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(true);

  useEffect(() => {
    const loadBlockedDates = async () => {
      try {
        // ✅ Debe ser público para frontend
        // Ejemplo: PUBLIC_WP_DOMAIN=https://wheat-rat-997991.hostingersite.com
        const wpDomain = import.meta.env.PUBLIC_WP_DOMAIN;

        if (!wpDomain) {
          console.warn("PUBLIC_WP_DOMAIN no está definido. No se cargarán bloqueos.");
          setBlockedDates([]);
          return;
        }

        const res = await fetch(
          `${wpDomain}/wp-json/vipc/v1/blocked-dates?cb=${Date.now()}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("No se pudieron cargar fechas bloqueadas");

        const data = await res.json();
        setBlockedDates(Array.isArray(data?.blocked_dates) ? data.blocked_dates : []);
      } catch (err) {
        console.error("Error loading blocked dates:", err);
        setBlockedDates([]);
      } finally {
        setLoadingBlockedDates(false);
      }
    };

    loadBlockedDates();
  }, []);

  // Si el usuario tenía seleccionada una fecha que luego se bloquea, resetea selección
  useEffect(() => {
    if (!date) return;
    const iso = toISODate(date);
    if (blockedDates.includes(iso)) {
      setDate(undefined);
      setSelectedTime(null);
      toast({
        title: "Fecha no disponible",
        description:
          "Ese miércoles fue marcado como cerrado. Por favor selecciona otro miércoles.",
        variant: "destructive",
      });
    }
  }, [blockedDates]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const isFormValid =
    !!date &&
    !!selectedTime &&
    formData.nombre.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.telefono.trim() !== "" &&
    !loadingBlockedDates; // opcional: no permitir submit hasta cargar bloqueos

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid || isLoading) {
      toast({
        title: "Campos incompletos",
        description: loadingBlockedDates
          ? "Cargando disponibilidad... inténtalo en unos segundos."
          : "Por favor complete todos los campos requeridos.",
        variant: "destructive",
      });
      return;
    }

    // ✅ Doble-validación: si por algún motivo eligieron una fecha bloqueada
    const iso = toISODate(date!);
    if (blockedDates.includes(iso)) {
      toast({
        title: "Fecha no disponible",
        description: "Ese miércoles está cerrado. Selecciona otro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const fechaFormateada = `${format(date!, "d 'de' MMMM, yyyy", {
      locale: es,
    })} a las ${selectedTime}`;

    try {
      const res = await fetch("/api/email/cita", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          email: formData.email.trim(),
          telefono: formData.telefono.trim(),
          fecha: fechaFormateada,
          dateISO: iso, // ✅ útil para validar del lado del server si luego lo agregas
          time: selectedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Error al reservar la cita");
      }

      setIsSubmitted(true);
      toast({
        title: "¡Cita Reservada!",
        description: "Te hemos enviado un email de confirmación.",
      });
    } catch (error: any) {
      console.error("Error reserva:", error);
      toast({
        title: "Error",
        description: error?.message || "No se pudo reservar la cita. Inténtalo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ------------------- PANTALLA DE CONFIRMACIÓN ------------------- */
  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background">
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto text-center">
              <div className="bg-card rounded-2xl shadow-card border border-border p-12">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-foreground mb-4">
                  ¡Cita Reservada Exitosamente!
                </h1>
                <p className="text-muted-foreground mb-6">
                  Tu cita ha sido agendada para el{" "}
                  <span className="font-semibold text-foreground">
                    {date && format(date, "d 'de' MMMM, yyyy", { locale: es })}
                  </span>{" "}
                  a las{" "}
                  <span className="font-semibold text-foreground">{selectedTime}</span>
                </p>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-8">
                  <p className="text-sm text-foreground font-medium">
                    📞 Recuerda llamar al{" "}
                    <a href="tel:8099124201" className="text-primary font-bold">
                      809-912-4201
                    </a>{" "}
                    24 horas antes para confirmar tu asistencia.
                  </p>
                </div>
                <a href="/">
                  <Button variant="outline" size="lg">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Volver al Inicio
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ------------------- FORMULARIO PRINCIPAL ------------------- */
  return (
    <main className="min-h-screen bg-background">
      <section className="py-12 bg-gradient-hero">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <a
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </a>

          {/* Header */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
              Reservar Cita
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Agenda tu <span className="text-gradient-coral">Pre-Entrevista</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Selecciona la fecha y hora que mejor te convenga para tu cita de pre-entrevista.
            </p>
          </div>

          {/* Booking Form */}
          <div className="max-w-5xl mx-auto">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 items-start">
                {/* Left Column - Calendar & Time */}
                <div className="bg-card rounded-2xl shadow-card border border-border p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    Selecciona Fecha y Hora
                  </h2>

                  <div className="mb-6 flex justify-center">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => {
                        setDate(d);
                        setSelectedTime(null); // reset time al cambiar fecha
                      }}
                      locale={es}
                      disabled={(d) => {
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);

                        const iso = toISODate(d);
                        const isBlocked = blockedDates.includes(iso);

                        // ✅ Solo miércoles + futuras + NO bloqueadas
                        return d <= today || d.getDay() !== 3 || isBlocked;
                      }}
                      className="rounded-xl border border-border pointer-events-auto"
                    />
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-3 mb-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">📅 Solo miércoles disponibles</span>
                      <br />
                      Horario: 9:00 AM - 12:00 PM
                      {loadingBlockedDates ? (
                        <>
                          <br />
                          <span className="text-xs">Cargando disponibilidad...</span>
                        </>
                      ) : null}
                    </p>
                  </div>

                  {date && (
                    <div className="animate-fade-in">
                      <Label className="text-foreground font-medium mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Horarios Disponibles
                      </Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                        {horasDisponibles.map((hora) => (
                          <button
                            key={hora}
                            type="button"
                            onClick={() => setSelectedTime(hora)}
                            className={cn(
                              "py-3 px-3 text-sm font-medium rounded-xl border-2 transition-all",
                              selectedTime === hora
                                ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                : "bg-background border-border text-foreground hover:border-primary hover:bg-primary/5"
                            )}
                          >
                            {hora}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Contact Form */}
                <div className="bg-card rounded-2xl shadow-card border border-border p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4 sm:mb-6 flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Información de Contacto
                  </h2>

                  <div className="space-y-4 sm:space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="nombre" className="text-foreground font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        Nombre Completo
                      </Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Tu nombre completo"
                        value={formData.nombre}
                        onChange={handleInputChange}
                        className="bg-background h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        Correo Electrónico
                      </Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="bg-background h-12"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="telefono" className="text-foreground font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        Número de Teléfono
                      </Label>
                      <Input
                        id="telefono"
                        name="telefono"
                        type="tel"
                        placeholder="809-000-0000"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="bg-background h-12"
                        required
                      />
                    </div>

                    {date && selectedTime && (
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 animate-fade-in">
                        <p className="text-sm text-foreground text-center">
                          <span className="font-semibold block mb-1">📅 Tu cita:</span>
                          <span className="text-primary font-bold">
                            {format(date, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                          </span>
                          <br />
                          <span className="text-primary font-bold">a las {selectedTime}</span>
                        </p>
                      </div>
                    )}

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full h-14 text-base bg-gradient-coral hover:opacity-90 text-primary-foreground shadow-coral"
                      disabled={!isFormValid || isLoading}
                    >
                      <CalendarDays className="mr-2 h-5 w-5" />
                      {isLoading ? "Reservando..." : "Confirmar Reserva"}
                    </Button>

                    <div className="bg-secondary/30 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground text-center">
                        📞 Recuerda llamar al <span className="font-semibold text-foreground">809-912-4201</span>, 24 horas antes para confirmar tu asistencia.
                      </p>
                    </div>

                    {!import.meta.env.PUBLIC_WP_DOMAIN ? (
                      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-3">
                        <p className="text-xs text-foreground">
                          ⚠️ Falta configurar <b>PUBLIC_WP_DOMAIN</b>. Los bloqueos desde WordPress no se aplicarán.
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
