import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Upload,
  FileText,
  CheckCircle,
  Send,
  User,
  Mail,
  Phone,
  MessageSquare,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Aplicar = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    mensaje: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Formato no válido",
        description: "Por favor sube un archivo PDF o Word (.doc, .docx)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño (máx 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Archivo muy grande",
        description: "El archivo debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setCvFile(file);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones finales
    if (!cvFile) {
      toast({
        title: "CV Requerido",
        description: "Por favor sube tu CV para continuar",
        variant: "destructive",
      });
      return;
    }

    if (!formData.nombre.trim() || !formData.email.trim() || !formData.telefono.trim()) {
      toast({
        title: "Campos Requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Crear FormData para enviar archivo + datos
    const data = new FormData();
    data.append("nombre", formData.nombre.trim());
    data.append("email", formData.email.trim());
    data.append("telefono", formData.telefono.trim());
    data.append("mensaje", formData.mensaje.trim());
    data.append("cv", cvFile);

    try {
      const res = await fetch("/api/email/aplicar", {
        method: "POST",
        body: data, // ¡Importante! No poner headers Content-Type, FormData lo maneja solo
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Error al enviar la aplicación");
      }

      // Éxito
      toast({
        title: "¡Aplicación Enviada Exitosamente!",
        description: "Hemos recibido tu CV. Te enviamos un email de confirmación.",
      });

      // Resetear formulario
      setFormData({ nombre: "", email: "", telefono: "", mensaje: "" });
      setCvFile(null);
      // Resetear el input file (necesario para permitir subir el mismo archivo de nuevo)
      const fileInput = document.getElementById("cv") as HTMLInputElement;
      if (fileInput) fileInput.value = "";

    } catch (error: any) {
      toast({
        title: "Error al enviar",
        description:
          error.message || "Hubo un problema al enviar tu aplicación. Inténtalo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Hero Section */}
      <section className="pt-24 lg:pt-32 pb-12 lg:pb-16 bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-foreground mb-4">
              Aplica para tu <span className="text-gradient-coral">Sueño</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Completa el formulario y sube tu CV para iniciar tu carrera en la industria de cruceros.
            </p>
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-12 lg:py-20">
        <div className="container mx-auto px-4 lg:px-8 max-w-2xl">
          <Card className="border-border/50 shadow-xl">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl font-display">Formulario de Aplicación</CardTitle>
              <CardDescription>
                Los campos marcados con * son obligatorios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nombre */}
                <div className="space-y-2">
                  <Label htmlFor="nombre" className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Nombre Completo *
                  </Label>
                  <Input
                    id="nombre"
                    name="nombre"
                    placeholder="Tu nombre completo"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Correo Electrónico *
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="telefono" className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    Número de Teléfono *
                  </Label>
                  <Input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    placeholder="+1 (809) 000-0000"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    required
                    className="h-12"
                  />
                </div>

                {/* CV Upload */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Curriculum Vitae (CV) *
                  </Label>
                  <div className="relative">
                    <input
                      type="file"
                      id="cv"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="cv"
                      className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        cvFile
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50 hover:bg-muted/50"
                      }`}
                    >
                      {cvFile ? (
                        <div className="flex items-center gap-3 text-primary">
                          <CheckCircle className="w-8 h-8" />
                          <div className="text-left">
                            <p className="font-medium">{cvFile.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground">
                          <Upload className="w-10 h-10 mb-2" />
                          <p className="font-medium">Haz clic para subir tu CV</p>
                          <p className="text-sm">PDF o Word (máx. 5MB)</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Mensaje */}
                <div className="space-y-2">
                  <Label htmlFor="mensaje" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    Mensaje (Opcional)
                  </Label>
                  <Textarea
                    id="mensaje"
                    name="mensaje"
                    placeholder="Cuéntanos sobre ti, tu experiencia, o cualquier información adicional..."
                    value={formData.mensaje}
                    onChange={handleInputChange}
                    rows={4}
                    className="resize-none"
                  />
                </div>

                {/* Botón Enviar */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-coral hover:opacity-90 text-primary-foreground shadow-coral"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                      Enviando Aplicación...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Enviar Aplicación
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
};

export default Aplicar;