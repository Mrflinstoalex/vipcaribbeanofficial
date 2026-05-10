interface PaginaLegalProps {
  data: {
    titulo: string;
    ultimaActualizacion: string | null;
    contenidoHtml: string;
  } | null;
  error: string | null;
}

export default function PaginaLegal({ data, error }: PaginaLegalProps) {
  if (error || !data) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-2xl font-semibold text-foreground">Contenido próximamente</p>
        <p className="text-muted-foreground max-w-sm">
          Esta página está en preparación. Vuelve pronto para ver el contenido completo.
        </p>
      </main>
    );
  }

  const fechaFormateada = data.ultimaActualizacion
    ? new Date(data.ultimaActualizacion + "T00:00:00").toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-background pt-28 lg:pt-32 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-foreground mb-2">{data.titulo}</h1>

        {fechaFormateada && (
          <p className="text-sm text-muted-foreground mb-10">
            Última actualización: {fechaFormateada}
          </p>
        )}

        <div
          className="prose prose-lg max-w-none prose-headings:text-foreground prose-a:text-coral prose-a:no-underline hover:prose-a:underline"
          dangerouslySetInnerHTML={{ __html: data.contenidoHtml }}
        />
      </div>
    </main>
  );
}
