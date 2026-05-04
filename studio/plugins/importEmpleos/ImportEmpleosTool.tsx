import React, { useState, useCallback, useRef } from "react";
import { useClient } from "sanity";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface EmpleoRow {
  titulo: string;
  salario: string;
  duracionContrato: string;
  categoria: string;
  cruiseLine: string;
  urgente: boolean;
  bloqueado: boolean;
  descripcion: string;
  _error?: string;
}

// ── Zustand store ─────────────────────────────────────────────────────────────

interface ImportStore {
  running: boolean;
  progreso: number;
  total: number;
  ok: number;
  errores: number;
  done: boolean;
  iniciar: (total: number) => void;
  actualizar: (progreso: number, ok: number, errores: number) => void;
  finalizar: (ok: number, errores: number) => void;
  limpiar: () => void;
}

const useImportStore = create<ImportStore>()(
  persist(
    (set) => ({
      running: false,
      progreso: 0,
      total: 0,
      ok: 0,
      errores: 0,
      done: false,
      iniciar: (total) =>
        set({ running: true, progreso: 0, total, ok: 0, errores: 0, done: false }),
      actualizar: (progreso, ok, errores) => set({ progreso, ok, errores }),
      finalizar: (ok, errores) =>
        set({ running: false, progreso: 100, ok, errores, done: true }),
      limpiar: () =>
        set({ running: false, progreso: 0, total: 0, ok: 0, errores: 0, done: false }),
    }),
    {
      name: "vipc-import-empleos-progress",
      onRehydrateStorage: () => (state) => {
        if (state?.running) state.limpiar();
      },
    }
  )
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function parseBooleano(raw: string | undefined): boolean {
  const s = String(raw ?? "").toLowerCase().trim();
  return s === "si" || s === "sí" || s === "yes" || s === "true" || s === "1";
}

function buscarColumna(row: Record<string, any>, opciones: string[]): string {
  const keys = Object.keys(row);
  for (const opcion of opciones) {
    const encontrado = keys.find(
      (k) => k.toLowerCase().trim() === opcion.toLowerCase()
    );
    if (encontrado !== undefined) return row[encontrado] ?? "";
  }
  return "";
}

function mapearFila(row: Record<string, any>): EmpleoRow {
  const titulo = String(
    buscarColumna(row, ["titulo", "título", "puesto", "posicion", "posición", "job title"])
  ).trim();
  const salario = String(
    buscarColumna(row, ["salario", "salary", "sueldo", "pago"])
  ).trim();
  const duracionContrato = String(
    buscarColumna(row, ["duracion", "duración", "duracioncontrato", "contrato", "duration"])
  ).trim();
  const categoriaRaw = buscarColumna(row, ["categoria", "categoría", "category"]);
  const cruiseLineRaw = buscarColumna(row, [
    "cruiseline", "cruise line", "linea", "línea", "línea de crucero", "naviera",
  ]);
  const urgenteRaw = buscarColumna(row, ["urgente", "urgent"]);
  const bloqueadoRaw = buscarColumna(row, ["bloqueado", "bloqueada", "locked"]);
  const descripcionRaw = buscarColumna(row, [
    "descripcion", "descripción", "description", "detalle",
  ]);

  const _error = !titulo ? "Falta el título" : undefined;

  return {
    titulo,
    salario,
    duracionContrato,
    categoria: String(categoriaRaw).trim(),
    cruiseLine: String(cruiseLineRaw).trim(),
    urgente: parseBooleano(urgenteRaw),
    bloqueado: parseBooleano(bloqueadoRaw),
    descripcion: String(descripcionRaw).trim(),
    _error,
  };
}

async function parsearArchivo(file: File): Promise<EmpleoRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "csv") {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          resolve((result.data as Record<string, any>[]).map(mapearFila));
        },
      });
    });
  }
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: "" });
  return rows.map(mapearFila);
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ImportEmpleosTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const fileRef = useRef<HTMLInputElement>(null);

  const { running, progreso, total, ok, errores, done, iniciar, actualizar, finalizar, limpiar } =
    useImportStore();

  const [empleos, setEmpleos] = useState<EmpleoRow[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState<string>("");
  const [dragging, setDragging] = useState(false);

  const resultado = done && !running ? { ok, errores } : null;

  const procesarArchivo = useCallback(async (file: File) => {
    setNombreArchivo(file.name);
    const filas = await parsearArchivo(file);
    setEmpleos(filas);
  }, []);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) procesarArchivo(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) procesarArchivo(file);
  };

  const validos = empleos.filter((e) => !e._error);
  const conErrores = empleos.filter((e) => e._error);

  const importar = async () => {
    if (!validos.length) return;

    iniciar(validos.length);
    let okCount = 0;
    let errCount = 0;

    // Cargar categorías y líneas de crucero existentes
    const categoriasExistentes: { _id: string; nombre: string }[] =
      await client.fetch(`*[_type == "empleoCategoria"]{_id, nombre}`);
    const categoriaMap = new Map<string, string>(
      categoriasExistentes.map((c) => [c.nombre.toLowerCase().trim(), c._id])
    );

    const lineasExistentes: { _id: string; nombre: string }[] =
      await client.fetch(`*[_type == "lineaCrucero"]{_id, nombre}`);
    const lineaMap = new Map<string, string>(
      lineasExistentes.map((l) => [l.nombre.toLowerCase().trim(), l._id])
    );

    const resolverCategoria = async (nombre: string): Promise<string | null> => {
      if (!nombre) return null;
      const key = nombre.toLowerCase().trim();
      if (categoriaMap.has(key)) return categoriaMap.get(key)!;
      const slug = slugify(nombre);
      const doc = await client.create({
        _type: "empleoCategoria",
        nombre,
        slug: { _type: "slug", current: slug },
        orden: 0,
      });
      categoriaMap.set(key, doc._id);
      return doc._id;
    };

    const resolverLinea = async (nombre: string): Promise<string | null> => {
      if (!nombre) return null;
      const key = nombre.toLowerCase().trim();
      if (lineaMap.has(key)) return lineaMap.get(key)!;
      const slug = slugify(nombre);
      const doc = await client.create({
        _type: "lineaCrucero",
        nombre,
        slug: { _type: "slug", current: slug },
      });
      lineaMap.set(key, doc._id);
      return doc._id;
    };

    for (let i = 0; i < validos.length; i++) {
      const e = validos[i];
      try {
        const categoriaId = await resolverCategoria(e.categoria);
        const lineaId = await resolverLinea(e.cruiseLine);

        const descripcionPT = e.descripcion
          ? [
              {
                _type: "block",
                _key: `b${i}`,
                style: "normal",
                markDefs: [],
                children: [{ _type: "span", _key: `s${i}`, text: e.descripcion, marks: [] }],
              },
            ]
          : undefined;

        const slug = slugify(e.titulo);

        await client.create({
          _type: "empleo",
          titulo: e.titulo,
          slug: { _type: "slug", current: slug },
          ...(e.salario ? { salario: e.salario } : {}),
          ...(e.duracionContrato ? { duracionContrato: e.duracionContrato } : {}),
          ...(categoriaId ? { categoria: { _type: "reference", _ref: categoriaId } } : {}),
          ...(lineaId ? { cruiseLine: { _type: "reference", _ref: lineaId } } : {}),
          urgente: e.urgente,
          bloqueado: e.bloqueado,
          ...(descripcionPT ? { descripcion: descripcionPT } : {}),
        });
        okCount++;
      } catch {
        errCount++;
      }
      actualizar(Math.round(((i + 1) / validos.length) * 100), okCount, errCount);
    }

    finalizar(okCount, errCount);
    setEmpleos([]);
    setNombreArchivo("");
  };

  const handleLimpiar = () => {
    setEmpleos([]);
    setNombreArchivo("");
    limpiar();
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Importar Empleos
      </h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Sube un archivo <strong>.csv</strong> o <strong>.xlsx</strong> con los empleos. La única
        columna requerida es <code>titulo</code>. Las categorías y líneas de crucero se crean
        automáticamente si no existen.
      </p>

      {/* ── Progreso ─────────────────────────────────────────────────────── */}
      {running && (
        <div
          style={{
            background: "#fff7f5",
            border: "1px solid #fca89a",
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ fontWeight: 600, marginBottom: "0.75rem", color: "#c2410c" }}>
            ⏳ Importación en progreso — no cierres el Studio
          </p>
          <div style={{ background: "#e5e7eb", borderRadius: 999, height: 10, overflow: "hidden" }}>
            <div
              style={{
                background: "#e85d3c",
                height: "100%",
                width: `${progreso}%`,
                transition: "width 0.3s",
              }}
            />
          </div>
          <p style={{ textAlign: "center", marginTop: "0.5rem", color: "#666", fontSize: "0.875rem" }}>
            {progreso}% — {ok} importados{errores > 0 && `, ${errores} errores`} de {total} empleos
          </p>
        </div>
      )}

      {/* ── Resultado ────────────────────────────────────────────────────── */}
      {resultado && (
        <div
          style={{
            background: resultado.errores === 0 ? "#f0fdf4" : "#fffbeb",
            border: `1px solid ${resultado.errores === 0 ? "#86efac" : "#fcd34d"}`,
            borderRadius: 12,
            padding: "1.5rem",
            marginBottom: "1.5rem",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "2.5rem" }}>{resultado.errores === 0 ? "✅" : "⚠️"}</div>
          <p style={{ fontWeight: 700, fontSize: "1.2rem", margin: "0.5rem 0" }}>
            {resultado.ok} empleo{resultado.ok !== 1 ? "s" : ""} importado{resultado.ok !== 1 ? "s" : ""} correctamente
          </p>
          {resultado.errores > 0 && (
            <p style={{ color: "#b45309" }}>{resultado.errores} no se pudieron importar</p>
          )}
          <button
            onClick={handleLimpiar}
            style={{
              marginTop: "1rem",
              padding: "0.5rem 1.5rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              background: "white",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Importar otro archivo
          </button>
        </div>
      )}

      {/* ── Zona de carga ─────────────────────────────────────────────────── */}
      {!empleos.length && !resultado && !running && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragging ? "#e85d3c" : "#ccc"}`,
            borderRadius: 12,
            padding: "3rem",
            textAlign: "center",
            cursor: "pointer",
            background: dragging ? "#fff5f3" : "#fafafa",
            transition: "all 0.2s",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>💼</div>
          <p style={{ fontWeight: 600, fontSize: "1.1rem" }}>
            Arrastra tu archivo aquí o haz clic para seleccionar
          </p>
          <p style={{ color: "#999", fontSize: "0.875rem", marginTop: "0.25rem" }}>
            Formatos soportados: .csv, .xlsx, .xls
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={onFileChange}
            style={{ display: "none" }}
          />
        </div>
      )}

      {/* ── Preview ───────────────────────────────────────────────────────── */}
      {empleos.length > 0 && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div>
              <strong>{empleos.length}</strong> filas detectadas en <code>{nombreArchivo}</code>
              {conErrores.length > 0 && (
                <span style={{ color: "#dc2626", marginLeft: "0.5rem" }}>
                  · {conErrores.length} con errores (no se importarán)
                </span>
              )}
            </div>
            <button
              onClick={handleLimpiar}
              style={{
                padding: "0.3rem 0.8rem",
                borderRadius: 6,
                border: "1px solid #ccc",
                background: "white",
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
          </div>

          <div
            style={{
              overflowX: "auto",
              marginBottom: "1.5rem",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["#", "Título", "Categoría", "Línea de Crucero", "Salario", "Duración", "Urgente", ""].map(
                    (h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          textAlign: "left",
                          fontWeight: 600,
                          borderBottom: "1px solid #e5e7eb",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {empleos.map((e, i) => (
                  <tr
                    key={i}
                    style={{
                      background: e._error ? "#fef2f2" : "white",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <td style={{ padding: "0.6rem 1rem", color: "#9ca3af" }}>{i + 1}</td>
                    <td style={{ padding: "0.6rem 1rem", fontWeight: 500 }}>{e.titulo || "—"}</td>
                    <td style={{ padding: "0.6rem 1rem", color: "#6b7280" }}>{e.categoria || "—"}</td>
                    <td style={{ padding: "0.6rem 1rem", color: "#6b7280" }}>{e.cruiseLine || "—"}</td>
                    <td style={{ padding: "0.6rem 1rem" }}>{e.salario || "—"}</td>
                    <td style={{ padding: "0.6rem 1rem" }}>{e.duracionContrato || "—"}</td>
                    <td style={{ padding: "0.6rem 1rem" }}>
                      {e.urgente ? (
                        <span
                          style={{
                            padding: "0.15rem 0.6rem",
                            borderRadius: 999,
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            background: "#fef2f2",
                            color: "#dc2626",
                          }}
                        >
                          Urgente
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ padding: "0.6rem 1rem", color: "#dc2626", fontSize: "0.8rem" }}>
                      {e._error ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {running && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8, overflow: "hidden" }}>
                <div
                  style={{
                    background: "#e85d3c",
                    height: "100%",
                    width: `${progreso}%`,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <p style={{ textAlign: "center", marginTop: "0.5rem", color: "#666", fontSize: "0.875rem" }}>
                Importando… {progreso}%
              </p>
            </div>
          )}

          {validos.length > 0 && !running && (
            <button
              onClick={importar}
              style={{
                padding: "0.75rem 2rem",
                borderRadius: 8,
                border: "none",
                background: "#e85d3c",
                color: "white",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Importar {validos.length} empleo{validos.length !== 1 ? "s" : ""}
              {conErrores.length > 0 && ` (${conErrores.length} con errores serán omitidos)`}
            </button>
          )}
        </>
      )}

      {/* ── Guía de formato ───────────────────────────────────────────────── */}
      <details style={{ marginTop: "2rem", color: "#666" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, marginBottom: "0.5rem" }}>
          ¿Cómo debe estar organizado el archivo?
        </summary>
        <p style={{ marginTop: "0.75rem" }}>
          El archivo debe tener estas columnas (el orden no importa, los nombres son flexibles):
        </p>
        <table
          style={{ borderCollapse: "collapse", marginTop: "0.5rem", fontSize: "0.875rem", width: "100%" }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              {["Columna", "Requerida", "Descripción"].map((h) => (
                <th
                  key={h}
                  style={{ padding: "0.5rem 1rem", textAlign: "left", border: "1px solid #e5e7eb" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["titulo", "✅ Sí", "Nombre del puesto"],
              ["categoria", "No", "Nombre de la categoría. Se crea automáticamente si no existe."],
              ["cruiseLine / linea", "No", "Nombre de la línea de crucero. Se crea automáticamente si no existe."],
              ["salario", "No", 'Ej: "$1,500 USD/mes"'],
              ["duracion / contrato", "No", 'Ej: "6 meses", "4-6 meses"'],
              ["urgente", "No", '"si" o "no" (por defecto: no)'],
              ["bloqueado", "No", '"si" o "no" (por defecto: no)'],
              ["descripcion", "No", "Texto plano. Se puede enriquecer después en el Studio."],
            ].map(([col, req, desc]) => (
              <tr key={col}>
                <td style={{ padding: "0.5rem 1rem", border: "1px solid #e5e7eb", fontFamily: "monospace" }}>
                  {col}
                </td>
                <td style={{ padding: "0.5rem 1rem", border: "1px solid #e5e7eb" }}>{req}</td>
                <td style={{ padding: "0.5rem 1rem", border: "1px solid #e5e7eb", color: "#555" }}>
                  {desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
          <strong>Tip:</strong> Si varias filas tienen la misma categoría o línea de crucero,
          se reutiliza el mismo documento — no se crean duplicados.
        </p>
      </details>
    </div>
  );
}
