"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Politica = {
  _id: string;
  titulo: string;
  resumen: string;
  icono: string;
  contenidoHtml: string;
};

type Props = {
  politicas: Politica[];
};

export default function PoliticasGrid({ politicas }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const selected = politicas.find((p) => p._id === selectedId) ?? null;

  useEffect(() => {
    if (selectedId && detailRef.current) {
      detailRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedId]);

  if (politicas.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-16">
        No hay políticas disponibles en este momento.
      </p>
    );
  }

  return (
    <div>
      {/* Cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {politicas.map((p) => {
          const isActive = p._id === selectedId;
          return (
            <button
              key={p._id}
              onClick={() => setSelectedId(isActive ? null : p._id)}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
            >
              <Card
                className={`h-full transition-all duration-200 cursor-pointer border-2 ${
                  isActive
                    ? "border-primary shadow-lg scale-[1.02]"
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                <CardContent className="p-6 flex flex-col gap-3">
                  {p.icono && (
                    <span className="text-3xl leading-none">{p.icono}</span>
                  )}
                  <h3 className="font-semibold text-lg text-foreground leading-snug">
                    {p.titulo}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.resumen}
                  </p>
                  <span
                    className={`mt-auto text-xs font-medium transition-colors ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {isActive ? "▲ Cerrar" : "▼ Ver política completa"}
                  </span>
                </CardContent>
              </Card>
            </button>
          );
        })}
      </div>

      {/* Detail panel */}
      {selected && (
        <div
          ref={detailRef}
          className="mt-8 rounded-2xl border border-border bg-card p-8 shadow-sm scroll-mt-24 transition-all"
        >
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            {selected.icono && (
              <span className="text-4xl leading-none">{selected.icono}</span>
            )}
            <h2 className="text-2xl font-bold text-foreground">{selected.titulo}</h2>
          </div>
          <div
            className="prose prose-lg max-w-none prose-headings:text-foreground prose-a:text-inherit prose-a:no-underline"
            dangerouslySetInnerHTML={{ __html: selected.contenidoHtml }}
          />
        </div>
      )}
    </div>
  );
}
