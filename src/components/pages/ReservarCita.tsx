import { useEffect, useMemo, useRef, useState } from "react";
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
import { Toaster } from "@/components/ui/toaster";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Turnstile, type TurnstileHandle } from "@/components/Turnstile";

const TURNSTILE_SITE_KEY = import.meta.env.PUBLIC_TURNSTILE_SITE_KEY ?? "";

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

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

// Próximo miércoles (si hoy es miércoles, usa el de la próxima semana)
function getNextWednesday(from: Date) {
  const d = startOfDay(from);
  const weekday = 3; // 0=dom, 1=lun, 2=mar, 3=mié
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + (diff === 0 ? 7 : diff));
  return d;
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

  // ✅ Bloqueos de miércoles completos (cerrado) desde WordPress
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loadingBlockedDates, setLoadingBlockedDates] = useState(true);

  // ✅ Horas bloqueadas por 24h (si alguien reservó hoy esa hora)
  const [lockedTimes, setLockedTimes] = useState<string[]>([]);
  const [loadingLockedTimes, setLoadingLockedTimes] = useState(true);

  // ✅ Turnstile (captcha)
  const [turnstileToken, setTurnstileToken] = useState("");
  const turnstileRef = useRef<TurnstileHandle>(null);

  // ✅ Regla: solo permitir seleccionar 1 miércoles (el próximo miércoles)
  const allowedWednesday = useMemo(() => getNextWednesday(new Date()), []);
  const allowedWednesdayISO = useMemo(() => toISODate(allowedWednesday), [allowedWednesday]);

  useEffect(() => {
    const loadBlockedDates = async () => {
      try {
        const res = await fetch(
          `/api/blocked-dates?cb=${Date.now()}`,
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

  useEffect(() => {
    const loadLockedTimes = async () => {
      try {
        const res = await fetch(
          `/api/locked-times?date=${allowedWednesdayISO}&cb=${Date.now()}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("No se pudieron cargar locked times");

        const data = await res.json();
        setLockedTimes(Array.isArray(data?.locked_times) ? data.locked_times : []);
      } catch (err) {
        console.error("Error loading locked times:", err);
        setLockedTimes([]);
      } finally {
        setLoadingLockedTimes(false);
      }
    };

    loadLockedTimes();
  }, [allowedWednesdayISO]);

  // Si la fecha seleccionada se vuelve inválida, resetea
  useEffect(() => {
    if (!date) return;

    const iso = toISODate(date);

    // 1) Si WP bloqueó ese miércoles
    if (blockedDates.includes(iso)) {
      setDate(undefined);
      setSelectedTime(null);
      toast({
        title: "Fecha no disponible",
        description: "Ese miércoles fue marcado como cerrado. Selecciona otro.",
        variant: "destructive",
      });
      return;
    }

    // 2) Si no es el miércoles permitido (solo 1 por semana)
    if (iso !== allowedWednesdayISO) {
      setDate(undefined);
      setSelectedTime(null);
      toast({
        title: "Solo un miércoles disponible",
        description:
          `Por ahora solo puedes reservar para el miércoles ${format(
            allowedWednesday,
            "d 'de' MMMM, yyyy",
            { locale: es }
          )}.`,
        variant: "destructive",
      });
    }
  }, [blockedDates, allowedWednesdayISO]); // eslint-disable-line react-hooks/exhaustive-deps

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
    !loadingBlockedDates &&
    !loadingLockedTimes &&
    !lockedTimes.includes(selectedTime) &&
    (!TURNSTILE_SITE_KEY || !!turnstileToken);

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!isFormValid || isLoading) {
    toast({
      title: "Campos incompletos",
      description:
        loadingBlockedDates || loadingLockedTimes
          ? "Cargando disponibilidad... inténtalo en unos segundos."
          : lockedTimes.includes(selectedTime || "")
          ? "Ese horario ya no tiene cupos. Elige otro."
          : "Por favor complete todos los campos requeridos.",
      variant: "destructive",
    });
    return;
  }

  const iso = toISODate(date!);

  // ✅ Solo el miércoles permitido
  if (iso !== allowedWednesdayISO) {
    toast({
      title: "Fecha no permitida",
      description: `Solo puedes reservar para el miércoles ${format(
        allowedWednesday,
        "d 'de' MMMM, yyyy",
        { locale: es }
      )}.`,
      variant: "destructive",
    });
    return;
  }

  // ✅ Validar si ese miércoles está cerrado
  if (blockedDates.includes(iso)) {
    toast({
      title: "Fecha no disponible",
      description: "Ese miércoles está cerrado. Selecciona otro.",
      variant: "destructive",
    });
    return;
  }

  // ✅ Validar si la hora ya no tiene cupos
  if (lockedTimes.includes(selectedTime!)) {
    toast({
      title: "Hora no disponible",
      description: "Ese horario ya no tiene cupos. Elige otro.",
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
        dateISO: iso,
        time: selectedTime,
        turnstileToken,
      }),
    });

    // ✅ Parseo seguro (por si alguna vez no viene JSON)
    let data: any = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    // ✅ Manejo de errores esperados (ej: 429 límite semanal)
    if (!res.ok) {
      const code = data?.code;
      const msg =
        code === "EMAIL_WEEKLY_LIMIT"
          ? "Ya existe una cita registrada con este correo esta semana. Intenta la próxima semana o usa otro correo."
          : data?.message || "No se pudo reservar la cita.";

      toast({
        title: code === "EMAIL_WEEKLY_LIMIT" ? "Límite semanal" : "Error",
        description: msg,
        variant: "destructive",
      });

      // El token Turnstile es de un solo uso — resetear para que el user pueda reintentar
      setTurnstileToken("");
      turnstileRef.current?.reset();

      return; // 🔥 IMPORTANT: no seguir
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
      description: "No se pudo reservar la cita. Inténtalo más tarde.",
      variant: "destructive",
    });
    setTurnstileToken("");
    turnstileRef.current?.reset();
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
                        setSelectedTime(null);
                      }}
                      locale={es}
                      disabled={(d) => {
                        const today = startOfDay(new Date());
                        const iso = toISODate(d);

                        const isBlocked = blockedDates.includes(iso);
                        const isAllowedWednesday = iso === allowedWednesdayISO;

                        // ✅ Solo el próximo miércoles (uno) + futuro + NO bloqueado
                        return d <= today || d.getDay() !== 3 || isBlocked || !isAllowedWednesday;
                      }}
                      className="rounded-xl border border-border pointer-events-auto"
                    />
                  </div>

                  <div className="bg-secondary/50 rounded-lg p-3 mb-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">
                        📅 Las pre-entrevistas se realizan los miércoles y se habilitan semana a semana.
                      </span>
                      <br />
                      {format(allowedWednesday, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                      <br />
                      Horario: 9:00 AM - 12:00 PM
                      {loadingBlockedDates || loadingLockedTimes ? (
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
                        {horasDisponibles.map((hora) => {
                          const isLocked = lockedTimes.includes(hora);

                          return (
                            <button
                              key={hora}
                              type="button"
                              disabled={isLocked || loadingLockedTimes}
                              onClick={() => setSelectedTime(hora)}
                              className={cn(
                                "py-3 px-3 text-sm font-medium rounded-xl border-2 transition-all",
                                selectedTime === hora
                                  ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                  : "bg-background border-border text-foreground hover:border-primary hover:bg-primary/5",
                                (isLocked || loadingLockedTimes) &&
                                  "opacity-50 cursor-not-allowed hover:border-border hover:bg-background"
                              )}
                              title={isLocked ? "Este horario ya no tiene cupos disponibles" : ""}
                            >
                              {hora} {isLocked ? "🔒" : ""}
                            </button>
                          );
                        })}
                      </div>

                      {lockedTimes.length ? (
                        <p className="text-xs text-muted-foreground mt-3">
                          🔒 Horarios sin cupos disponibles (máx. 2 personas por horario).
                        </p>
                      ) : null}
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
                      <Label
                        htmlFor="nombre"
                        className="text-foreground font-medium flex items-center gap-2"
                      >
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
                      <Label
                        htmlFor="email"
                        className="text-foreground font-medium flex items-center gap-2"
                      >
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
                      <Label
                        htmlFor="telefono"
                        className="text-foreground font-medium flex items-center gap-2"
                      >
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
                          <span className="text-primary font-bold">
                            a las {selectedTime}
                          </span>
                        </p>
                      </div>
                    )}

                    

                    <div className="rounded-lg p-3">
                  
                    </div>

                  </div>
                </div>
              </div>



   {/* Terms and Conditions - Full Width Below Form */}
<div className="mt-8 bg-card rounded-2xl shadow-card border border-border p-6 md:p-8">
  <div className="flex items-center gap-3 mb-6">
    <span className="text-2xl">🌴</span>
    <h3 className="text-xl font-bold text-foreground">
      VIP Caribbean: Políticas para la Cita de Pre-Entrevista
    </h3>
  </div>

  <p className="text-muted-foreground mb-6">
    Al reservar su cita, el candidato acepta los siguientes términos y condiciones del proceso:
  </p>

  {/* Section 1 */}
  <div className="mb-6">
    <h4 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
      <span>📝</span> Descripción del Servicio de Pre-Entrevista
    </h4>

    <div className="space-y-3 text-sm text-muted-foreground pl-7">
      <p>
        Este es un proceso presencial diseñado para validar su perfil y preparar su postulación.
        El día de su cita se realizarán las siguientes acciones:
      </p>

      <ul className="list-disc pl-5 space-y-1">
        <li>Revisión de documentos: Se verificarán todos los requisitos solicitados previamente.</li>
        <li>Creación de archivo: Se le abrirá un expediente oficial en nuestra oficina.</li>
        <li>Evaluación de área: Se le realizará la evaluación correspondiente al área de su interés.</li>
        <li>Formas de aplicación: Se le entregarán los formularios oficiales que debe completar.</li>
        <li>Pre-entrevista: Se le realizará la entrevista de depuración ese mismo día.</li>
      </ul>
    </div>
  </div>

  {/* Section 2 */}
  <div className="mb-6">
    <h4 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
      <span>⚠️</span> Requisitos Indispensables (Sin excepción)
    </h4>

    <div className="space-y-3 text-sm text-muted-foreground pl-7">
      <p>
        <strong className="text-foreground">Currículum en Inglés:</strong> Este proceso es exclusivo
        para quienes ya enviaron su currículum en inglés. Si no lo ha enviado, no puede presentarse
        a esta cita.
      </p>

      <p>
        <strong className="text-foreground">Documentación Completa:</strong> El candidato debe
        presentarse con TODOS los requisitos que le pedimos cuando envió su currículum. De no
        tenerlos todos, no procederemos con la pre-entrevista y tendrá que re-agendar su cita.
      </p>
    </div>
  </div>

  {/* Section 3 */}
  <div className="mb-6">
    <h4 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
      <span>🗃️</span> Política de Formalización y Apertura de Registro
    </h4>

    <div className="space-y-3 text-sm text-muted-foreground pl-7">
      <p>
        <strong className="text-foreground">Activación de Expediente:</strong> La confirmación de
        esta cita implica que el candidato entiende que, para proceder con la evaluación, se
        requiere completar un trámite de gestión administrativa y apertura de registro oficial.
        Este paso es indispensable para la emisión de sus materiales de aplicación y la validación
        de su aplicacion en nuestro sistema.
      </p>

      <p>
        Este proceso administrativo es el que garantiza la custodia de su información, la gestión
        de los recursos y la formalización total de su candidatura en nuestro sistema de selección.
      </p>
    </div>
  </div>

  {/* Confirmation Call Notice */}
  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
    <div className="flex items-start gap-3">
      <span className="text-xl">📞</span>
      <div>
        <p className="font-bold text-primary mb-1">AVISO DE VITAL IMPORTANCIA</p>
        <p className="text-sm text-foreground mb-2">
          ES DE VITAL IMPORTANCIA LLAMAR 24 HORAS ANTES PARA CONFIRMAR SU ASISTENCIA.
        </p>
        <p className="text-sm font-semibold text-foreground">
          SIN ESTA CONFIRMACIÓN TELEFÓNICA, SU CITA NO SERÁ PROCESADA.
        </p>
      </div>
    </div>
  </div>

  {/* Section 4 */}
  <div className="mb-6">
    <h4 className="flex items-center gap-2 text-lg font-semibold text-foreground mb-3">
      <span>✅</span> Aceptación de Términos
    </h4>

    <div className="text-sm text-muted-foreground pl-7">
      <p className="mb-2">Al hacer clic en el botón confirmar reserva, el candidato declara que:</p>
      <ul className="list-disc pl-5 space-y-1">
        <li>
          Ha leído y entendido que la formalización administrativa es el paso final necesario tras
          la depuración del entrevistador para activar su expediente.
        </li>
        <li>Se compromete a presentarse con la documentación completa requerida.</li>
        <li>
          Reconoce que la confirmación telefónica previa es un requisito indispensable para
          mantener su turno.
        </li>
      </ul>
    </div>
  </div>

  {/* Captcha Turnstile */}
  {TURNSTILE_SITE_KEY ? (
    <div className="flex justify-center mb-4">
      <Turnstile
        ref={turnstileRef}
        siteKey={TURNSTILE_SITE_KEY}
        onVerify={setTurnstileToken}
        onExpire={() => setTurnstileToken("")}
        onError={() => setTurnstileToken("")}
      />
    </div>
  ) : null}

  {/* Submit Button */}
  <Button
    type="submit"
    size="lg"
    className="w-full h-14 text-base bg-gradient-coral hover:opacity-90 text-primary-foreground shadow-coral"
    disabled={!isFormValid || isLoading}
  >
    <CalendarDays className="mr-2 h-5 w-5" />
    {isLoading ? "Reservando..." : "Confirmar Reserva"}
  </Button>

  <div className="bg-secondary/30 rounded-lg p-3 mt-4">
    <p className="text-xs text-muted-foreground text-center">
      📞 Recuerda llamar al{" "}
      <span className="font-semibold text-foreground">809-912-4201</span>, 24 horas antes para
      confirmar tu asistencia.
    </p>
  </div>
</div>



              
            </form>
          </div>
        </div>
      </section>
      <Toaster />
    </main>
  );
}
