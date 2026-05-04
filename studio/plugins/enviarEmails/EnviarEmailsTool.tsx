import { useState, useEffect, useRef, useCallback } from "react";
import { useClient, useColorScheme } from "sanity";

type Mode = "candidatos" | "manual" | "listas";
type EstadoFilter = "todos" | "pendiente" | "aprobado" | "rechazado";

interface ManualEntry {
  email: string;
  nombre: string;
  posicion: string;
  estado: string;
}

interface CandidatoSanity {
  _id: string;
  nombre: string;
  email: string;
  posicion: string;
  estado: string;
}

interface ListaCorreos {
  _id: string;
  nombre: string;
  descripcion?: string;
  destinatarios?: { _key: string; email: string; nombre?: string }[];
}

const CANCEL_SECRET = (import.meta as any).env?.SANITY_STUDIO_CANCEL_SECRET ?? "";
const SITE_URL = ((import.meta as any).env?.SANITY_STUDIO_SITE_URL ?? "").replace(/\/$/, "");

function useTheme(isDark: boolean) {
  return isDark
    ? {
        bg: "#101010",
        cardBg: "#1a1a1a",
        inputBg: "#1a1a1a",
        border: "#2e2e2e",
        text: "#f1f1f1",
        textMuted: "#888",
        textLabel: "#aaa",
        rowHover: "#252525",
        rowSelected: "#1c3461",
        selectAllSelected: "#1c3461",
        selectAllNone: "#1a1a1a",
        emptyBorder: "#2e2e2e",
        suggestionBg: "#1a1a1a",
        suggestionHover: "#252525",
        suggestionBorder: "#2e2e2e",
        tagBg: "#1c3461",
        tagBorder: "#2563eb",
        tagText: "#93c5fd",
        codeBg: "#252525",
        listaCard: "#1a1a1a",
        listaCardSelected: "#1c3461",
        listaCardBorder: "#2e2e2e",
        listaCardBorderSelected: "#2563eb",
      }
    : {
        bg: "white",
        cardBg: "#f9fafb",
        inputBg: "white",
        border: "#d1d5db",
        text: "#111827",
        textMuted: "#6b7280",
        textLabel: "#374151",
        rowHover: "#f9fafb",
        rowSelected: "#eff6ff",
        selectAllSelected: "#eff6ff",
        selectAllNone: "#f9fafb",
        emptyBorder: "#d1d5db",
        suggestionBg: "white",
        suggestionHover: "#f5f7ff",
        suggestionBorder: "#d1d5db",
        tagBg: "#eff6ff",
        tagBorder: "#bfdbfe",
        tagText: "#1e40af",
        codeBg: "#f3f4f6",
        listaCard: "#f9fafb",
        listaCardSelected: "#eff6ff",
        listaCardBorder: "#d1d5db",
        listaCardBorderSelected: "#3b82f6",
      };
}

export function EnviarEmailsTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const { scheme } = useColorScheme();
  const isDark = scheme === "dark";
  const t = useTheme(isDark);

  const [mode, setMode] = useState<Mode>("listas");

  // Manual mode
  const [manualInput, setManualInput] = useState("");
  const [suggestions, setSuggestions] = useState<ManualEntry[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualEntries, setManualEntries] = useState<ManualEntry[]>([]);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Candidates mode
  const [candidatos, setCandidatos] = useState<CandidatoSanity[]>([]);
  const [loadingCandidatos, setLoadingCandidatos] = useState(false);
  const [estadoFilter, setEstadoFilter] = useState<EstadoFilter>("todos");
  const [posicionFilter, setPosicionFilter] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Listas mode
  const [listas, setListas] = useState<ListaCorreos[]>([]);
  const [loadingListas, setLoadingListas] = useState(false);
  const [selectedLista, setSelectedLista] = useState<ListaCorreos | null>(null);

  // Email composer
  const [asunto, setAsunto] = useState("");
  const [cuerpo, setCuerpo] = useState("");

  // Send state
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    border: `1px solid ${t.border}`,
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    background: t.inputBg,
    color: t.text,
  };

  const btn: React.CSSProperties = {
    padding: "7px 16px",
    borderRadius: "6px",
    border: `1px solid ${t.border}`,
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 500,
    background: t.cardBg,
    color: t.text,
  };

  // Load candidatos
  useEffect(() => {
    if (mode !== "candidatos") return;
    setLoadingCandidatos(true);
    client
      .fetch<CandidatoSanity[]>(
        `*[_type == "candidato" && defined(email) && email != ""] | order(nombre asc) { _id, nombre, email, posicion, estado }`
      )
      .then((data) => setCandidatos(data ?? []))
      .catch(() => setCandidatos([]))
      .finally(() => setLoadingCandidatos(false));
  }, [mode, client]);

  // Load listas
  useEffect(() => {
    if (mode !== "listas") return;
    setLoadingListas(true);
    setSelectedLista(null);
    client
      .fetch<ListaCorreos[]>(
        `*[_type == "listaCorreos"] | order(nombre asc) { _id, nombre, descripcion, destinatarios[] { _key, email, nombre } }`
      )
      .then((data) => setListas(data ?? []))
      .catch(() => setListas([]))
      .finally(() => setLoadingListas(false));
  }, [mode, client]);

  // Autocomplete suggestions
  const fetchSuggestions = useCallback(
    (q: string) => {
      if (q.length < 2) { setSuggestions([]); return; }
      client
        .fetch<ManualEntry[]>(
          `*[_type == "candidato" && defined(email) && email != "" && (email match $q || nombre match $q)] | order(nombre asc)[0...8] { "email": email, nombre, posicion, estado }`,
          { q: `*${q}*` }
        )
        .then((data) => setSuggestions(data ?? []))
        .catch(() => setSuggestions([]));
    },
    [client]
  );

  const handleManualInput = (val: string) => {
    setManualInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 250);
    setShowSuggestions(true);
  };

  const addEntry = (entry: ManualEntry) => {
    if (!entry.email || !entry.email.includes("@")) return;
    const emailLower = entry.email.toLowerCase().trim();
    setManualEntries((prev) =>
      prev.some((e) => e.email.toLowerCase() === emailLower)
        ? prev
        : [...prev, { ...entry, email: emailLower }]
    );
    setManualInput("");
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const addFromInput = () => {
    addEntry({ email: manualInput.trim(), nombre: "", posicion: "", estado: "" });
  };

  const removeEntry = (email: string) => {
    setManualEntries((prev) => prev.filter((e) => e.email !== email));
  };

  // Candidate filtering
  const filteredCandidatos = candidatos.filter((c) => {
    if (estadoFilter !== "todos" && c.estado !== estadoFilter) return false;
    if (posicionFilter && !c.posicion.toLowerCase().includes(posicionFilter.toLowerCase())) return false;
    return true;
  });

  const allFilteredIds = filteredCandidatos.map((c) => c._id);
  const allSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.has(id));
  const someSelected = allFilteredIds.some((id) => selectedIds.has(id));

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allFilteredIds.forEach((id) => next.delete(id));
      } else {
        allFilteredIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleCandidate = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Build recipients for send
  const recipients: ManualEntry[] =
    mode === "manual"
      ? manualEntries
      : mode === "candidatos"
      ? candidatos.filter((c) => selectedIds.has(c._id)).map((c) => ({
          email: c.email,
          nombre: c.nombre,
          posicion: c.posicion,
          estado: c.estado,
        }))
      : (selectedLista?.destinatarios ?? []).map((d) => ({
          email: d.email,
          nombre: d.nombre ?? "",
          posicion: "",
          estado: "",
        }));

  const handleSend = async () => {
    setMessage(null);
    if (!recipients.length) {
      setMessage({ text: "No hay destinatarios seleccionados.", type: "error" });
      return;
    }
    if (!asunto.trim()) {
      setMessage({ text: "El asunto es obligatorio.", type: "error" });
      return;
    }
    if (!cuerpo.trim()) {
      setMessage({ text: "El cuerpo del email es obligatorio.", type: "error" });
      return;
    }
    if (!confirm(`¿Enviar email a ${recipients.length} destinatario${recipients.length !== 1 ? "s" : ""}?`)) return;

    setSending(true);
    try {
      const res = await fetch(`${SITE_URL}/api/email/candidatos-bulk`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cancel-secret": CANCEL_SECRET,
        },
        body: JSON.stringify({ recipients, asunto, cuerpo }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? `Error ${res.status}`);

      setMessage({
        text: `✅ Enviado a ${data.sent ?? recipients.length} destinatario${(data.sent ?? recipients.length) !== 1 ? "s" : ""}${data.errors > 0 ? ` (${data.errors} fallaron)` : ""}.`,
        type: "success",
      });
      setManualEntries([]);
      setSelectedIds(new Set());
      setAsunto("");
      setCuerpo("");
    } catch (err: any) {
      setMessage({ text: `Error: ${err?.message ?? "Error desconocido"}`, type: "error" });
    } finally {
      setSending(false);
    }
  };

  const estadoBadgeStyle = (estado: string): React.CSSProperties => ({
    padding: "2px 8px",
    borderRadius: "999px",
    fontSize: "11px",
    fontWeight: 600,
    background:
      estado === "aprobado" ? "#dcfce7" : estado === "rechazado" ? "#fee2e2" : "#fef9c3",
    color:
      estado === "aprobado" ? "#166534" : estado === "rechazado" ? "#991b1b" : "#854d0e",
    flexShrink: 0,
  });

  const tabs: { key: Mode; label: string }[] = [
    { key: "listas", label: "📋 Listas de correo" },
    { key: "candidatos", label: "👥 Seleccionar candidatos" },
    { key: "manual", label: "✏️ Lista manual" },
  ];

  return (
    <div style={{ padding: "24px", fontFamily: "sans-serif", maxWidth: "900px", color: t.text }}>
      <h2 style={{ margin: "0 0 6px", fontSize: "22px", fontWeight: 700, color: t.text }}>📧 Enviar Emails</h2>
      <p style={{ margin: "0 0 20px", color: t.textMuted, fontSize: "14px" }}>
        Envía actualizaciones personalizadas. Usa <code>{"{{nombre}}"}</code>,{" "}
        <code>{"{{posicion}}"}</code>, <code>{"{{estado}}"}</code> como variables en el mensaje.
      </p>

      {/* Mode tabs */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", flexWrap: "wrap" }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key); setMessage(null); }}
            style={{
              ...btn,
              background: mode === key ? "#1d4ed8" : t.cardBg,
              color: mode === key ? "#fff" : t.text,
              border: mode === key ? "1px solid #1d4ed8" : `1px solid ${t.border}`,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── LISTAS MODE ── */}
      {mode === "listas" && (
        <div style={{ marginBottom: "24px" }}>
          {loadingListas ? (
            <p style={{ color: t.textMuted, fontSize: "14px" }}>Cargando listas...</p>
          ) : listas.length === 0 ? (
            <div style={{ padding: "24px", border: `1px dashed ${t.emptyBorder}`, borderRadius: "8px", textAlign: "center", color: t.textMuted, fontSize: "14px" }}>
              No hay listas de correo creadas todavía.
              <br />
              <span style={{ fontSize: "12px" }}>Crea una lista desde <strong>Candidatos → Listas de correo</strong> en el panel lateral.</span>
            </div>
          ) : (
            <>
              <label style={{ display: "block", fontWeight: 600, fontSize: "13px", color: t.textLabel, marginBottom: "10px" }}>
                Selecciona una lista
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "10px", marginBottom: "16px" }}>
                {listas.map((lista) => {
                  const count = lista.destinatarios?.length ?? 0;
                  const isSelected = selectedLista?._id === lista._id;
                  return (
                    <div
                      key={lista._id}
                      onClick={() => setSelectedLista(isSelected ? null : lista)}
                      style={{
                        padding: "14px 16px",
                        borderRadius: "8px",
                        border: `2px solid ${isSelected ? t.listaCardBorderSelected : t.listaCardBorder}`,
                        background: isSelected ? t.listaCardSelected : t.listaCard,
                        cursor: "pointer",
                        transition: "border-color 0.15s, background 0.15s",
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: "14px", color: t.text, marginBottom: "4px" }}>
                        📋 {lista.nombre}
                      </div>
                      {lista.descripcion && (
                        <div style={{ fontSize: "12px", color: t.textMuted, marginBottom: "6px" }}>
                          {lista.descripcion}
                        </div>
                      )}
                      <div style={{ fontSize: "12px", color: isSelected ? "#3b82f6" : t.textMuted, fontWeight: isSelected ? 600 : 400 }}>
                        {count} destinatario{count !== 1 ? "s" : ""}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Destinatarios preview */}
              {selectedLista && (
                <div style={{ border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden", marginBottom: "8px" }}>
                  <div style={{ padding: "10px 14px", background: t.cardBg, borderBottom: `1px solid ${t.border}`, fontSize: "13px", fontWeight: 600, color: t.text }}>
                    Destinatarios de «{selectedLista.nombre}» — {selectedLista.destinatarios?.length ?? 0} en total
                  </div>
                  {!selectedLista.destinatarios?.length ? (
                    <div style={{ padding: "16px", color: t.textMuted, fontSize: "13px", textAlign: "center" }}>
                      Esta lista no tiene destinatarios. Edítala desde el panel lateral para agregar correos.
                    </div>
                  ) : (
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {selectedLista.destinatarios.map((d) => (
                        <div
                          key={d._key}
                          style={{ display: "flex", alignItems: "center", gap: "10px", padding: "9px 14px", borderBottom: `1px solid ${t.border}`, fontSize: "13px" }}
                        >
                          <span style={{ color: t.text, fontWeight: d.nombre ? 600 : 400 }}>
                            {d.nombre || d.email}
                          </span>
                          {d.nombre && (
                            <span style={{ color: t.textMuted }}>{d.email}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── MANUAL MODE ── */}
      {mode === "manual" && (
        <div style={{ marginBottom: "24px" }}>
          <label style={{ display: "block", fontWeight: 600, fontSize: "13px", color: t.textLabel, marginBottom: "6px" }}>
            Agregar correos destinatarios
          </label>
          <div style={{ position: "relative", display: "flex", gap: "8px" }}>
            <div style={{ flex: 1, position: "relative" }}>
              <input
                type="text"
                placeholder="Escribe un correo y presiona Enter (o selecciona de las sugerencias)..."
                value={manualInput}
                onChange={(e) => handleManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") { e.preventDefault(); addFromInput(); }
                  if (e.key === "Escape") setShowSuggestions(false);
                }}
                onFocus={() => manualInput.length >= 2 && setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                style={inputStyle}
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 4px)",
                  left: 0,
                  right: 0,
                  background: t.suggestionBg,
                  border: `1px solid ${t.suggestionBorder}`,
                  borderRadius: "8px",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
                  zIndex: 100,
                  overflow: "hidden",
                }}>
                  {suggestions
                    .filter((s) => !manualEntries.some((e) => e.email === s.email.toLowerCase()))
                    .map((s) => (
                      <div
                        key={s.email}
                        onMouseDown={() => addEntry(s)}
                        style={{ padding: "10px 14px", cursor: "pointer", borderBottom: `1px solid ${t.suggestionBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: t.suggestionBg }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = t.suggestionHover)}
                        onMouseLeave={(e) => (e.currentTarget.style.background = t.suggestionBg)}
                      >
                        <div>
                          <span style={{ fontWeight: 600, fontSize: "14px", color: t.text }}>{s.nombre}</span>
                          <span style={{ color: t.textMuted, fontSize: "13px", marginLeft: "8px" }}>{s.email}</span>
                        </div>
                        <span style={estadoBadgeStyle(s.estado)}>{s.posicion}</span>
                      </div>
                    ))}
                </div>
              )}
            </div>
            <button
              onClick={addFromInput}
              style={{ ...btn, background: "#1d4ed8", color: "white", border: "1px solid #1d4ed8", whiteSpace: "nowrap" }}
            >
              + Agregar
            </button>
          </div>

          {/* Tags */}
          {manualEntries.length > 0 ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
              {manualEntries.map((entry) => (
                <span
                  key={entry.email}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    background: t.tagBg,
                    border: `1px solid ${t.tagBorder}`,
                    borderRadius: "999px",
                    fontSize: "13px",
                    color: t.tagText,
                  }}
                >
                  {entry.nombre ? <><strong>{entry.nombre}</strong> &lt;{entry.email}&gt;</> : entry.email}
                  <button
                    onClick={() => removeEntry(entry.email)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: t.tagBorder, fontSize: "17px", lineHeight: 1, padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p style={{ color: t.textMuted, fontSize: "13px", marginTop: "10px" }}>
              Sin destinatarios. Escribe un correo y presiona Enter, o elige de las sugerencias.
            </p>
          )}
        </div>
      )}

      {/* ── CANDIDATES MODE ── */}
      {mode === "candidatos" && (
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Estado
              </label>
              <select
                value={estadoFilter}
                onChange={(e) => { setEstadoFilter(e.target.value as EstadoFilter); setSelectedIds(new Set()); }}
                style={{ padding: "8px 12px", border: `1px solid ${t.border}`, borderRadius: "6px", fontSize: "14px", background: t.inputBg, color: t.text, cursor: "pointer" }}
              >
                <option value="todos">Todos</option>
                <option value="pendiente">⏳ Pendiente</option>
                <option value="aprobado">✅ Aprobado</option>
                <option value="rechazado">❌ Rechazado</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "4px" }}>
                Posición
              </label>
              <input
                type="text"
                placeholder="Filtrar por posición..."
                value={posicionFilter}
                onChange={(e) => { setPosicionFilter(e.target.value); setSelectedIds(new Set()); }}
                style={{ ...inputStyle, width: "200px" }}
              />
            </div>
            {(estadoFilter !== "todos" || posicionFilter) && (
              <button
                onClick={() => { setEstadoFilter("todos"); setPosicionFilter(""); setSelectedIds(new Set()); }}
                style={btn}
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {loadingCandidatos ? (
            <p style={{ color: t.textMuted, fontSize: "14px" }}>Cargando candidatos...</p>
          ) : filteredCandidatos.length === 0 ? (
            <div style={{ padding: "24px", border: `1px dashed ${t.emptyBorder}`, borderRadius: "8px", textAlign: "center", color: t.textMuted, fontSize: "14px" }}>
              No hay candidatos con correo registrado que coincidan con los filtros.
              <br />
              <span style={{ fontSize: "12px" }}>Agrega emails a los candidatos desde su ficha en Sanity.</span>
            </div>
          ) : (
            <div style={{ border: `1px solid ${t.border}`, borderRadius: "8px", overflow: "hidden" }}>
              <div style={{
                padding: "10px 14px",
                background: someSelected ? t.selectAllSelected : t.selectAllNone,
                borderBottom: `1px solid ${t.border}`,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
                  onChange={toggleSelectAll}
                  style={{ width: "16px", height: "16px", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", fontWeight: 600, color: t.text }}>
                  {allSelected ? "Deseleccionar todos" : "Seleccionar todos"}
                </span>
                <span style={{ fontSize: "13px", color: t.textMuted, marginLeft: "auto" }}>
                  {selectedIds.size} de {filteredCandidatos.length} seleccionados
                </span>
              </div>

              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {filteredCandidatos.map((c) => (
                  <div
                    key={c._id}
                    onClick={() => toggleCandidate(c._id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      padding: "10px 14px",
                      borderBottom: `1px solid ${t.border}`,
                      cursor: "pointer",
                      background: selectedIds.has(c._id) ? t.rowSelected : t.inputBg,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { if (!selectedIds.has(c._id)) e.currentTarget.style.background = t.rowHover; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = selectedIds.has(c._id) ? t.rowSelected : t.inputBg; }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c._id)}
                      onChange={() => toggleCandidate(c._id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ width: "16px", height: "16px", cursor: "pointer", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: "14px", color: t.text }}>{c.nombre}</div>
                      <div style={{ fontSize: "12px", color: t.textMuted, marginTop: "1px" }}>
                        {c.email}
                        {c.posicion && <span style={{ marginLeft: "8px" }}>· {c.posicion}</span>}
                      </div>
                    </div>
                    <span style={estadoBadgeStyle(c.estado)}>{c.estado}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── EMAIL COMPOSER ── */}
      <div style={{ borderTop: `2px solid ${t.border}`, paddingTop: "20px" }}>
        <h3 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: t.text }}>Composición del email</h3>

        <div style={{ marginBottom: "14px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: t.textLabel, marginBottom: "6px" }}>
            Asunto *
          </label>
          <input
            type="text"
            placeholder="Ej: Actualización sobre tu proceso de selección"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: t.textLabel, marginBottom: "6px" }}>
            Mensaje *
          </label>
          <textarea
            placeholder={"Hola {{nombre}},\n\nQueremos informarte sobre el estado de tu aplicación para la posición de {{posicion}}...\n\nAtentamente,\nVIP Caribbean"}
            value={cuerpo}
            onChange={(e) => setCuerpo(e.target.value)}
            rows={9}
            style={{ ...inputStyle, resize: "vertical", lineHeight: "1.5" }}
          />
          <p style={{ fontSize: "12px", color: t.textMuted, margin: "4px 0 0" }}>
            Variables disponibles:{" "}
            <code style={{ background: t.codeBg, padding: "1px 5px", borderRadius: "4px", color: t.text }}>{"{{nombre}}"}</code>{" "}
            <code style={{ background: t.codeBg, padding: "1px 5px", borderRadius: "4px", color: t.text }}>{"{{posicion}}"}</code>{" "}
            <code style={{ background: t.codeBg, padding: "1px 5px", borderRadius: "4px", color: t.text }}>{"{{estado}}"}</code>
          </p>
        </div>

        {message && (
          <div style={{
            padding: "10px 14px",
            borderRadius: "8px",
            marginBottom: "14px",
            background: message.type === "success" ? "#d1fae5" : "#fee2e2",
            color: message.type === "success" ? "#065f46" : "#991b1b",
            fontSize: "14px",
          }}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending || recipients.length === 0}
          style={{
            width: "100%",
            padding: "12px 24px",
            borderRadius: "8px",
            border: "none",
            background: sending || recipients.length === 0 ? (isDark ? "#374151" : "#d1d5db") : "#1d4ed8",
            color: sending || recipients.length === 0 ? t.textMuted : "white",
            fontWeight: 700,
            fontSize: "15px",
            cursor: sending || recipients.length === 0 ? "not-allowed" : "pointer",
            transition: "background 0.15s",
          }}
        >
          {sending
            ? "Enviando emails..."
            : recipients.length === 0
            ? "Selecciona destinatarios primero"
            : `📨 Enviar a ${recipients.length} destinatario${recipients.length !== 1 ? "s" : ""}`}
        </button>
      </div>
    </div>
  );
}
