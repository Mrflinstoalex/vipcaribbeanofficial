import React, { useState, useCallback, useRef } from "react";
import { useClient } from "sanity";
import Papa from "papaparse";
import * as XLSX from "xlsx";

// ── Tipos ─────────────────────────────────────────────────────────────────────

type EstadoValido = "pendiente" | "aprobado" | "rechazado";

interface CandidatoRow {
  nombre: string;
  posicion: string;
  estado: EstadoValido;
  fechaEntrevista: string; // YYYY-MM-DD
  _error?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Normaliza el estado a uno de los tres valores válidos del schema */
function normalizarEstado(raw: string): EstadoValido {
  const s = (raw ?? "").toLowerCase().trim();
  if (s.includes("aprobad") || s === "approved" || s === "ok") return "aprobado";
  if (s.includes("rechazad") || s === "rejected" || s === "no") return "rechazado";
  return "pendiente";
}

/**
 * Acepta varios formatos de fecha:
 *   DD/MM/YYYY  →  2025-12-31
 *   MM/DD/YYYY  →  detectado si día > 12
 *   YYYY-MM-DD  →  pasa directo
 *   número Excel serial  →  convertido
 */
function normalizarFecha(raw: string | number): string {
  if (typeof raw === "number") {
    // Fecha serial de Excel
    const date = XLSX.SSF.parse_date_code(raw);
    if (!date) return "";
    const m = String(date.m).padStart(2, "0");
    const d = String(date.d).padStart(2, "0");
    return `${date.y}-${m}-${d}`;
  }
  const s = String(raw ?? "").trim();
  if (!s) return "";

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // DD/MM/YYYY o MM/DD/YYYY
  const parts = s.split(/[\/\-\.]/);
  if (parts.length === 3) {
    const [a, b, c] = parts.map(Number);
    if (c > 31) {
      // MM/DD/YYYY
      return `${c}-${String(a).padStart(2, "0")}-${String(b).padStart(2, "0")}`;
    }
    // DD/MM/YYYY
    return `${c}-${String(b).padStart(2, "0")}-${String(a).padStart(2, "0")}`;
  }
  return s;
}

/** Busca la columna correcta sin importar mayúsculas o variaciones de nombre */
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

/** Convierte una fila del archivo al formato del schema de candidato */
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

  const estado = normalizarEstado(String(estadoRaw));
  const fechaEntrevista = normalizarFecha(fechaRaw as string);

  const _error = !nombre
    ? "Falta el nombre"
    : !posicion
    ? "Falta la posición"
    : !fechaEntrevista
    ? "Fecha inválida"
    : undefined;

  return { nombre, posicion, estado, fechaEntrevista, _error };
}

/** Parsea un archivo CSV o XLSX y devuelve filas mapeadas */
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

  // XLSX / XLS
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

  const [candidatos, setCandidatos] = useState<CandidatoRow[]>([]);
  const [nombreArchivo, setNombreArchivo] = useState<string>("");
  const [importando, setImportando] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [resultado, setResultado] = useState<{
    ok: number;
    errores: number;
  } | null>(null);
  const [dragging, setDragging] = useState(false);

  const procesarArchivo = useCallback(async (file: File) => {
    setResultado(null);
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
    setImportando(true);
    setProgreso(0);
    let ok = 0;
    let errores = 0;

    for (let i = 0; i < validos.length; i++) {
      const c = validos[i];
      try {
        await client.create({
          _type: "candidato",
          nombre: c.nombre,
          posicion: c.posicion,
          estado: c.estado,
          fechaEntrevista: c.fechaEntrevista,
        });
        ok++;
      } catch {
        errores++;
      }
      setProgreso(Math.round(((i + 1) / validos.length) * 100));
    }

    setImportando(false);
    setResultado({ ok, errores });
    setCandidatos([]);
    setNombreArchivo("");
  };

  const limpiar = () => {
    setCandidatos([]);
    setNombreArchivo("");
    setResultado(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
        Importar Candidatos
      </h2>
      <p style={{ color: "#666", marginBottom: "2rem" }}>
        Sube un archivo <strong>.csv</strong> o <strong>.xlsx</strong> con los candidatos.
        Las columnas requeridas son: <code>nombre</code>, <code>posicion</code>,{" "}
        <code>fechaEntrevista</code>. La columna <code>estado</code> es opcional
        (pendiente por defecto).
      </p>

      {/* Zona de carga */}
      {!candidatos.length && !resultado && (
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

      {/* Resultado de importación */}
      {resultado && (
        <div style={{
          background: resultado.errores === 0 ? "#f0fdf4" : "#fffbeb",
          border: `1px solid ${resultado.errores === 0 ? "#86efac" : "#fcd34d"}`,
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "1.5rem",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "2.5rem" }}>
            {resultado.errores === 0 ? "✅" : "⚠️"}
          </div>
          <p style={{ fontWeight: 700, fontSize: "1.2rem", margin: "0.5rem 0" }}>
            {resultado.ok} candidatos importados correctamente
          </p>
          {resultado.errores > 0 && (
            <p style={{ color: "#b45309" }}>{resultado.errores} no se pudieron importar</p>
          )}
          <button
            onClick={limpiar}
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

      {/* Preview de datos */}
      {candidatos.length > 0 && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
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
              onClick={limpiar}
              style={{ padding: "0.3rem 0.8rem", borderRadius: 6, border: "1px solid #ccc", background: "white", cursor: "pointer" }}
            >
              Cancelar
            </button>
          </div>

          {/* Tabla preview */}
          <div style={{ overflowX: "auto", marginBottom: "1.5rem", borderRadius: 8, border: "1px solid #e5e7eb" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["#", "Nombre", "Posición", "Estado", "Fecha de entrevista", ""].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 600, borderBottom: "1px solid #e5e7eb" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {candidatos.map((c, i) => (
                  <tr key={i} style={{ background: c._error ? "#fef2f2" : "white", borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "0.6rem 1rem", color: "#9ca3af" }}>{i + 1}</td>
                    <td style={{ padding: "0.6rem 1rem", fontWeight: 500 }}>{c.nombre || "—"}</td>
                    <td style={{ padding: "0.6rem 1rem" }}>{c.posicion || "—"}</td>
                    <td style={{ padding: "0.6rem 1rem" }}>
                      <span style={{
                        padding: "0.15rem 0.6rem",
                        borderRadius: 999,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                        background: c.estado === "aprobado" ? "#dcfce7" : c.estado === "rechazado" ? "#fee2e2" : "#fef9c3",
                        color: c.estado === "aprobado" ? "#166534" : c.estado === "rechazado" ? "#991b1b" : "#854d0e",
                      }}>
                        {c.estado}
                      </span>
                    </td>
                    <td style={{ padding: "0.6rem 1rem" }}>{c.fechaEntrevista || "—"}</td>
                    <td style={{ padding: "0.6rem 1rem", color: "#dc2626", fontSize: "0.8rem" }}>
                      {c._error ?? ""}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Barra de progreso */}
          {importando && (
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ background: "#e5e7eb", borderRadius: 999, height: 8, overflow: "hidden" }}>
                <div style={{ background: "#e85d3c", height: "100%", width: `${progreso}%`, transition: "width 0.2s" }} />
              </div>
              <p style={{ textAlign: "center", marginTop: "0.5rem", color: "#666", fontSize: "0.875rem" }}>
                Importando… {progreso}%
              </p>
            </div>
          )}

          {/* Botón de importar */}
          {validos.length > 0 && !importando && (
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
              Importar {validos.length} candidato{validos.length !== 1 ? "s" : ""}
              {conErrores.length > 0 && ` (${conErrores.length} con errores serán omitidos)`}
            </button>
          )}
        </>
      )}

      {/* Guía de formato */}
      <details style={{ marginTop: "2rem", color: "#666" }}>
        <summary style={{ cursor: "pointer", fontWeight: 600, marginBottom: "0.5rem" }}>
          ¿Cómo debe estar organizado el archivo?
        </summary>
        <p style={{ marginTop: "0.75rem" }}>El archivo debe tener estas columnas (el orden no importa):</p>
        <table style={{ borderCollapse: "collapse", marginTop: "0.5rem", fontSize: "0.875rem" }}>
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              {["Columna", "Requerida", "Valores aceptados"].map((h) => (
                <th key={h} style={{ padding: "0.5rem 1rem", textAlign: "left", border: "1px solid #e5e7eb" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              ["nombre", "✅ Sí", "Texto libre"],
              ["posicion", "✅ Sí", "Texto libre"],
              ["fechaEntrevista", "✅ Sí", "DD/MM/YYYY o YYYY-MM-DD"],
              ["estado", "No (defecto: pendiente)", "pendiente / aprobado / rechazado"],
            ].map(([col, req, val]) => (
              <tr key={col}>
                <td style={{ padding: "0.5rem 1rem", border: "1px solid #e5e7eb", fontFamily: "monospace" }}>{col}</td>
                <td style={{ padding: "0.5rem 1rem", border: "1px solid #e5e7eb" }}>{req}</td>
                <td style={{ padding: "0.5rem 1rem", border: "1px solid #e5e7eb", color: "#555" }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
