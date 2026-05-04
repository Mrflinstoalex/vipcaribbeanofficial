import { useEffect, useState } from "react";
import { useClient } from "sanity";

type Cita = {
  _id: string;
  nombre: string;
  email: string;
  telefono: string;
  fecha: string;
  hora: string;
  estado: string;
};

type GroupedCitas = Record<string, Cita[]>;
type Filter = "activas" | "canceladas" | "todas";

const CANCEL_SECRET = (import.meta as any).env?.SANITY_STUDIO_CANCEL_SECRET ?? "";
const SITE_URL = ((import.meta as any).env?.SANITY_STUDIO_SITE_URL ?? "").replace(/\/$/, "");

const btnBase: React.CSSProperties = {
  padding: "6px 14px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: 500,
};

export function CitasTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [filter, setFilter] = useState<Filter>("activas");
  const [limpiando, setLimpiando] = useState(false);

  const fetchCitas = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const result = await client.fetch<Cita[]>(
        `*[_type == "cita"] | order(fecha desc, hora asc) { _id, nombre, email, telefono, fecha, hora, estado }`
      );
      setCitas(result ?? []);
    } catch {
      setMessage({ text: "Error al cargar las citas.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitas();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async (cita: Cita) => {
    if (!confirm(`¿Cancelar la cita de ${cita.nombre} (${cita.fecha} ${cita.hora})?`)) return;

    setCancelling(cita._id);
    setMessage(null);

    try {
      await client.patch(cita._id).set({ estado: "cancelada" }).commit();

      const res = await fetch(`${SITE_URL}/api/email/cancelar-cita`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cancel-secret": CANCEL_SECRET,
        },
        body: JSON.stringify({
          name: cita.nombre,
          email: cita.email,
          appointment_date: cita.fecha,
          appointment_time: cita.hora,
          citaId: cita._id,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessage({
          text: `Cita cancelada en Sanity pero el email falló: ${data?.message ?? res.statusText}`,
          type: "error",
        });
      } else {
        setMessage({ text: `Cita de ${cita.nombre} cancelada y email enviado.`, type: "success" });
      }

      setCitas((prev) =>
        prev.map((c) => (c._id === cita._id ? { ...c, estado: "cancelada" } : c))
      );
    } catch (err: any) {
      setMessage({ text: `Error al cancelar: ${err?.message ?? "Error desconocido"}`, type: "error" });
    } finally {
      setCancelling(null);
    }
  };

  const handleLimpiar = async () => {
    const hoy = new Date().toISOString().split("T")[0];
    const pasadas = citas.filter((c) => c.fecha < hoy);

    if (pasadas.length === 0) {
      setMessage({ text: "No hay citas de fechas anteriores para limpiar.", type: "success" });
      return;
    }

    const fechas = [...new Set(pasadas.map((c) => c.fecha))].sort().join(", ");
    const confirmed = window.confirm(
      `¿Eliminar permanentemente ${pasadas.length} cita(s) de fechas anteriores?\n\nFechas: ${fechas}\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    setLimpiando(true);
    setMessage(null);

    try {
      let tx = client.transaction();
      for (const c of pasadas) {
        tx = tx.delete(c._id);
      }
      await tx.commit();

      setCitas((prev) => prev.filter((c) => c.fecha >= hoy));
      setMessage({ text: `${pasadas.length} cita(s) de fechas anteriores eliminadas correctamente.`, type: "success" });
    } catch (err: any) {
      setMessage({ text: `Error al limpiar: ${err?.message ?? "Error desconocido"}`, type: "error" });
    } finally {
      setLimpiando(false);
    }
  };

  // Agrupar y filtrar
  const grouped: GroupedCitas = {};
  for (const c of citas) {
    const key = c.fecha ?? "sin-fecha";
    grouped[key] ??= [];
    grouped[key].push(c);
  }

  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  const totalActivas = citas.filter((c) => c.estado === "activa").length;
  const totalCanceladas = citas.filter((c) => c.estado === "cancelada").length;

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: "1100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 700 }}>📅 Gestión de Citas</h2>
        <button
          onClick={fetchCitas}
          disabled={loading}
          style={{
            ...btnBase,
            background: "#f5f5f5",
            color: "#111827",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Cargando..." : "🔄 Actualizar"}
        </button>
        <button
          onClick={handleLimpiar}
          disabled={limpiando || loading}
          style={{
            ...btnBase,
            background: limpiando ? "#f9fafb" : "#fff1f2",
            color: "#991b1b",
            border: "1px solid #fca5a5",
            cursor: limpiando || loading ? "not-allowed" : "pointer",
          }}
        >
          {limpiando ? "Limpiando..." : "🗑️ Limpiar citas pasadas"}
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {(["activas", "canceladas", "todas"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              ...btnBase,
              background: filter === f ? "#1d4ed8" : "#f5f5f5",
              color: filter === f ? "#fff" : "#111827",
              border: filter === f ? "1px solid #1d4ed8" : "1px solid #ccc",
            }}
          >
            {f === "activas" && `✅ Activas (${totalActivas})`}
            {f === "canceladas" && `❌ Canceladas (${totalCanceladas})`}
            {f === "todas" && `📋 Todas (${citas.length})`}
          </button>
        ))}
      </div>

      {/* Mensaje */}
      {message && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: "6px",
            marginBottom: "16px",
            background: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            fontSize: "14px",
          }}
        >
          {message.text}
        </div>
      )}

      {loading && <p style={{ color: "#888", fontSize: "14px" }}>Cargando citas...</p>}

      {!loading && citas.length === 0 && (
        <p style={{ color: "#888", fontSize: "14px" }}>No hay citas registradas.</p>
      )}

      {!loading &&
        sortedDates.map((fecha) => {
          const allInGroup = grouped[fecha];

          // Aplicar filtro dentro del grupo
          const group = allInGroup.filter((c) => {
            if (filter === "activas") return c.estado === "activa";
            if (filter === "canceladas") return c.estado === "cancelada";
            return true;
          });

          // Ocultar grupo si no hay citas que coincidan con el filtro
          if (group.length === 0) return null;

          const activas = allInGroup.filter((c) => c.estado === "activa").length;
          const canceladas = allInGroup.filter((c) => c.estado === "cancelada").length;

          const [year, month, day] = fecha.split("-").map(Number);
          const label =
            fecha !== "sin-fecha"
              ? `Miércoles ${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`
              : "Sin fecha";

          return (
            <div
              key={fecha}
              style={{
                marginBottom: "32px",
                border: "1px solid #e5e7eb",
                borderRadius: "10px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "12px 16px",
                  background: "#f9fafb",
                  borderBottom: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "15px", color: "#111827" }}>{label}</span>
                <span
                  style={{
                    fontSize: "12px",
                    background: "#dcfce7",
                    color: "#166534",
                    padding: "2px 8px",
                    borderRadius: "999px",
                  }}
                >
                  ✅ {activas} activas
                </span>
                {canceladas > 0 && (
                  <span
                    style={{
                      fontSize: "12px",
                      background: "#fee2e2",
                      color: "#991b1b",
                      padding: "2px 8px",
                      borderRadius: "999px",
                    }}
                  >
                    ❌ {canceladas} canceladas
                  </span>
                )}
              </div>

              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                  <thead>
                    <tr style={{ background: "#f3f4f6" }}>
                      {["Nombre", "Email", "Teléfono", "Hora", "Estado", "Acciones"].map((h) => (
                        <th
                          key={h}
                          style={{
                            padding: "8px 12px",
                            textAlign: "left",
                            fontWeight: 600,
                            color: "#374151",
                            borderBottom: "1px solid #e5e7eb",
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((cita) => (
                      <tr
                        key={cita._id}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          background: cita.estado === "cancelada" ? "#fef2f2" : "white",
                        }}
                      >
                        <td style={{ padding: "8px 12px", color: "#111827" }}>{cita.nombre}</td>
                        <td style={{ padding: "8px 12px", color: "#6b7280" }}>{cita.email}</td>
                        <td style={{ padding: "8px 12px", color: "#6b7280" }}>{cita.telefono}</td>
                        <td style={{ padding: "8px 12px", color: "#111827" }}>{cita.hora}</td>
                        <td style={{ padding: "8px 12px" }}>
                          <span
                            style={{
                              padding: "2px 8px",
                              borderRadius: "999px",
                              fontSize: "12px",
                              fontWeight: 600,
                              background: cita.estado === "activa" ? "#dcfce7" : "#fee2e2",
                              color: cita.estado === "activa" ? "#166534" : "#991b1b",
                            }}
                          >
                            {cita.estado === "activa" ? "✅ Activa" : "❌ Cancelada"}
                          </span>
                        </td>
                        <td style={{ padding: "8px 12px" }}>
                          {cita.estado === "activa" && (
                            <button
                              onClick={() => handleCancel(cita)}
                              disabled={cancelling === cita._id}
                              style={{
                                padding: "4px 10px",
                                borderRadius: "6px",
                                border: "1px solid #fca5a5",
                                background: cancelling === cita._id ? "#f9fafb" : "#fff",
                                color: "#dc2626",
                                cursor: cancelling === cita._id ? "not-allowed" : "pointer",
                                fontSize: "12px",
                                fontWeight: 500,
                              }}
                            >
                              {cancelling === cita._id ? "Cancelando..." : "Cancelar"}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
    </div>
  );
}
