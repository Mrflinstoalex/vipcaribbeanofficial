import React, { useState, useCallback, useRef } from "react";
import { useClient } from "sanity";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface CandidatoRow {
  nombre: string;
  posicion: string;
  estadoNombre: string;
  fechaEntrevista: string;
  email?: string;
  _error?: string;
}

// ── Zustand store — persiste en localStorage ──────────────────────────────────

interface ImportStore {
  running: boolean;
  progreso: number; // 0–100
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

      actualizar: (progreso, ok, errores) =>
        set({ progreso, ok, errores }),

      finalizar: (ok, errores) =>
        set({ running: false, progreso: 100, ok, errores, done: true }),

      limpiar: () =>
        set({ running: false, progreso: 0, total: 0, ok: 0, errores: 0, done: false }),
    }),
    {
      name: "vipc-import-progress",
      // Al recargar la página no puede haber un import en curso — descartamos ese estado
      onRehydrateStorage: () => (state) => {
        if (state?.running) state.limpiar();
      },
    }
  )
);

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizarFecha(raw: string | number): string {
  if (typeof raw === "number") {
    const date = XLSX.SSF.parse_date_code(raw);
    if (!date) return "";
    const m = String(date.m).padStart(2, "0");
    const d = String(date.d).padStart(2, "0");
    return `${date.y}-${m}-${d}`;
  }
  const s = String(raw ?? "").trim();
  if (!s) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parts = s.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 31) {
      return `${c}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
    }
    return `${c}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
  }
  return s;
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

function mapearFila(row: Record<string, any>): CandidatoRow {
  const nombre = String(
    buscarColumna(row, ["nombre", "name", "candidato", "full name"])
  ).trim();
  const posicion = String(
    buscarColumna(row, ["posicion", "posición", "cargo", "position", "puesto"])
  ).trim();
  const estadoRaw = buscarColumna(row, ["estado", "status", "resultado"]);
  const fechaRaw = buscarColumna(row, [
    "fecha",
    "fechaentrevista",
    "fecha_entrevista",
    "fecha de entrevista",
    "date",
    "interview date",
  ]);
  const emailRaw = buscarColumna(row, [
    "email",
    "correo",
    "e-mail",
    "mail",
    "correo electrónico",
  ]);

  const estadoNombre = String(estadoRaw).trim() || "Pendiente";
  const fechaEntrevista = normalizarFecha(fechaRaw as string);
  const email = String(emailRaw).trim() || undefined;

  const _error = !nombre
    ? "Falta el nombre"
    : !posicion
    ? "Falta la posición"
    : !fechaEntrevista
    ? "Fecha inválida"
    : undefined;

  return { nombre, posicion, estadoNombre, fechaEntrevista, email, _error };
}

async function parsearArchivo(file: File): Promise<CandidatoRow[]> {
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
  const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
    defval: "",
  });
  return rows.map(mapearFila);
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ImportTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const fileRef = useRef<HTMLInputElement>(null);

  const { running, progreso, total, ok, errores, done, iniciar, actualizar, finalizar, limpiar } =
    useImportStore();

  const [candidatos, setCandidatos] = useState<CandidatoRow[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState<string>("");
  const [dragging, setDragging] = useState(false);

  const resultado = done && !running ? { ok, errores } : null;

  const procesarArchivo = useCallback(async (file: File) => {
    setNombreArchivo(file.name);
    const filas = await parsearArchivo(file);
    setCandidatos(filas);
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

  const validos = candidatos.filter((c) => !c._error);
  const conErrores = candidatos.filter((c) => c._error);

  const importar = async () => {
    if (!validos.length) return;

    iniciar(validos.length);
    let okCount = 0;
    let errCount = 0;

    const estadosExistentes: { _id: string; nombre: string }[] =
      await client.fetch(`*[_type == "estadoCandidato"]{_id, nombre}`);
    const estadoMap = new Map<string, string>(
      estadosExistentes.map((e) => [e.nombre.toLowerCase().trim(), e._id])
    );

    const resolverEstado = async (nombreEstado: string): Promise<string> => {
      const key = nombreEstado.toLowerCase().trim();
      if (estadoMap.has(key)) return estadoMap.get(key)!;
      const doc = await client.create({
        _type: "estadoCandidato",
        nombre: nombreEstado,
      });
      estadoMap.set(key, doc._id);
      return doc._id;
    };

    for (let i = 0; i < validos.length; i++) {
      const c = validos[i];
      try {
        const estadoId = await resolverEstado(c.estadoNombre);
        await client.create({
          _type: "candidato",
          nombre: c.nombre,
          posicion: c.posicion,
          estado: { _type: "reference", _ref: estadoId },
          fechaEntrevista: c.fechaEntrevista,
          ...(c.email ? { email: c.email } : {}),
        });
        okCount++;
      } catch {
        errCount++;
      }
      actualizar(Math.round(((i + 1) / validos.length) * 100), okCount, errCount);
    }

    finalizar(okCount, errCount);
    setCandidatos([]);
    setNombreArchivo("");
  };

  const handleLimpiar = () => {
    setCandidatos([]);
    setNombreArchivo("");
    limpiar();
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Importar Candidatos
      </h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Sube un archivo <strong>.csv</strong> o <strong>.xlsx</strong> con los
        candidatos. Las columnas requeridas son: <code>nombre</code>,{" "}
        <code>posicion</code>, <code>fechaEntrevista</code>. La columna{" "}
        <code>estado</code> es opcional (se crea automáticamente si no existe).
      </p>

      {/* ── Banner de progreso (visible aunque el usuario navegue y vuelva) ── */}
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
          <div
            style={{
              background: "#e5e7eb",
              borderRadius: 999,
              height: 10,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                background: "#e85d3c",
                height: "100%",
                width: `${progreso}%`,
                transition: "width 0.3s",
              }}
            />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "0.5rem",
              color: "#666",
              fontSize: "0.875rem",
            }}
          >
            {progreso}% — {ok} importados
            {errores > 0 && `, ${errores} errores`} de {total} candidatos
          </p>
        </div>
      )}

      {/* ── Resultado (persiste aunque el usuario navegue y vuelva) ─────────── */}
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
          <div style={{ fontSize: "2.5rem" }}>
            {resultado.errores === 0 ? "✅" : "⚠️"}
          </div>
          <p style={{ fontWeight: 700, fontSize: "1.2rem", margin: "0.5rem 0" }}>
            {resultado.ok} candidatos importados correctamente
          </p>
          {resultado.errores > 0 && (
            <p style={{ color: "#b45309" }}>
              {resultado.errores} no se pudieron importar
            </p>
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
      {!candidatos.length && !resultado && !running && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
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
          <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>📂</div>
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

      {/* ── Preview de datos ──────────────────────────────────────────────── */}
      {candidatos.length > 0 && (
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
              <strong>{candidatos.length}</strong> filas detectadas en{" "}
              <code>{nombreArchivo}</code>
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
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {[
                    "#",
                    "Nombre",
                    "Email",
                    "Posición",
                    "Estado",
                    "Fecha de entrevista",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "left",
                        fontWeight: 600,
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidatos.map((c, i) => (
                  <tr
                    key={i}
                    style={{
                      background: c._error ? "#fef2f2" : "white",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <td style={{ padding: "0.6rem 1rem", color: "#9ca3af" }}>
                      {i + 1}
                    </td>
                    <td style={{ padding: "0.6rem 1rem", fontWeight: 500 }}>
                      {c.nombre || "—"}
                    </td>
                    <td style={{ padding: "0.6rem 1rem", color: "#6b7280" }}>
                      {c.email || "—"}
                    </td>
                    <td style={{ padding: "0.6rem 1rem" }}>
                      {c.posicion || "—"}
                    </td>
                    <td style={{ padding: "0.6rem 1rem" }}>
                      <span
                        style={{
                          padding: "0.15rem 0.6rem",
                          borderRadius: 999,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          background: "#f3f4f6",
                          color: "#374151",
                        }}
                      >
                        {c.estadoNombre}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem 1rem" }}>
                      {c.fechaEntrevista || "—"}
                    </td>
                    <td
                      style={{
                        padding: "0.6rem 1rem",
                        color: "#dc2626",
                        fontSize: "0.8rem",
                      }}
                    >
                      {c._error ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {running && (
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  background: "#e5e7eb",
                  borderRadius: 999,
                  height: 8,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#e85d3c",
                    height: "100%",
                    width: `${progreso}%`,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <p
                style={{
                  textAlign: "center",
                  marginTop: "0.5rem",
                  color: "#666",
                  fontSize: "0.875rem",
                }}
              >
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
              Importar {validos.length} candidato
              {validos.length !== 1 ? "s" : ""}
              {conErrores.length > 0 &&
                ` (${conErrores.length} con errores serán omitidos)`}
            </button>
          )}
        </>
      )}

      {/* ── Guía de formato ───────────────────────────────────────────────── */}
      <details style={{ marginTop: "2rem", color: "#666" }}>
        <summary
          style={{ cursor: "pointer", fontWeight: 600, marginBottom: "0.5rem" }}
        >
          ¿Cómo debe estar organizado el archivo?
        </summary>
        <p style={{ marginTop: "0.75rem" }}>
          El archivo debe tener estas columnas (el orden no importa):
        </p>
        <table
          style={{
            borderCollapse: "collapse",
            marginTop: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              {["Columna", "Requerida", "Valores aceptados"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "0.5rem 1rem",
                    textAlign: "left",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["nombre", "✅ Sí", "Texto libre"],
              ["posicion", "✅ Sí", "Texto libre"],
              ["fechaEntrevista", "✅ Sí", "DD/MM/YYYY o YYYY-MM-DD"],
              [
                "estado",
                "No (defecto: Pendiente)",
                "Cualquier texto — se crea automáticamente si no existe",
              ],
              ["email", "No", "Correo electrónico del candidato"],
            ].map(([col, req, val]) => (
              <tr key={col}>
                <td
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #e5e7eb",
                    fontFamily: "monospace",
                  }}
                >
                  {col}
                </td>
                <td
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  {req}
                </td>
                <td
                  style={{
                    padding: "0.5rem 1rem",
                    border: "1px solid #e5e7eb",
                    color: "#555",
                  }}
                >
                  {val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: "1rem", fontSize: "0.85rem" }}>
          <strong>Tip:</strong> Puedes definir tus propios estados desde{" "}
          <em>Candidatos → Estados de candidatos</em> antes de importar, o
          simplemente escríbelos en el Excel y se crearán solos.
        </p>
      </details>
    </div>
  );
}
