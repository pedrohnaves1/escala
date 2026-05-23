// -------------------------------------------------------------
// ESCALA VIEW - VOLUNTÁRIO PORTAL (MEMBER VIEW)
// -------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Music,
  CalendarDays,
  Plus,
  Trash2,
  Sparkles,
  MapPin,
  Smile,
  FileText
} from "lucide-react";
import {
  getVolunteers,
  getServices,
  getAssignments,
  getMinistries,
  saveAssignments,
  saveVolunteers
} from "../utils/storage";

export default function VoluntarioView() {
  const [volunteers, setVolunteers] = useState([]);
  const [services, setServices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [selectedVolId, setSelectedVolId] = useState("");
  const [newBlackoutDate, setNewBlackoutDate] = useState("");
  const [newBlackoutTime, setNewBlackoutTime] = useState("");

  const loadData = () => {
    setVolunteers(getVolunteers());
    setServices(getServices());
    setAssignments(getAssignments());
    setMinistries(getMinistries());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("escala-db-synced", loadData);
    return () => window.removeEventListener("escala-db-synced", loadData);
  }, []);

  // Voluntário atualmente selecionado
  const currentVolunteer = volunteers.find(v => v.id === selectedVolId);

  // Escalas vinculadas ao voluntário selecionado
  const myAssignments = assignments.filter(a => a.volunteerId === selectedVolId);

  // Alterar Status da Escala (Confirmar / Recusar)
  const handleUpdateStatus = (assignmentId, newStatus) => {
    const updated = assignments.map(a => 
      a.id === assignmentId ? { ...a, status: newStatus } : a
    );
    saveAssignments(updated);
    setAssignments(updated);
    // Dispara sincronização em nuvem e atualiza ouvintes do app
    window.dispatchEvent(new CustomEvent("escala-db-synced"));
  };

  // Adicionar data de ausência/indisponibilidade
  const handleAddBlackout = (e) => {
    e.preventDefault();
    if (!newBlackoutDate || !selectedVolId) return;

    const blackoutEntry = newBlackoutTime
      ? { date: newBlackoutDate, time: newBlackoutTime }
      : newBlackoutDate;

    // Verificar se já existe duplicado
    const alreadyExists = currentVolunteer.blackouts?.some(b => {
      const bDate = typeof b === "string" ? b : b.date;
      const bTime = typeof b === "string" ? "" : b.time;
      return bDate === newBlackoutDate && bTime === newBlackoutTime;
    });

    if (alreadyExists) {
      alert("Esta ausência já está agendada!");
      return;
    }

    const updatedVolunteers = volunteers.map(v => {
      if (v.id === selectedVolId) {
        const list = v.blackouts || [];
        const sorted = [...list, blackoutEntry].sort((a, b) => {
          const dateA = typeof a === "string" ? a : a.date;
          const dateB = typeof b === "string" ? b : b.date;
          return dateA.localeCompare(dateB);
        });
        return { ...v, blackouts: sorted };
      }
      return v;
    });

    saveVolunteers(updatedVolunteers);
    setVolunteers(updatedVolunteers);
    setNewBlackoutDate("");
    setNewBlackoutTime("");
    window.dispatchEvent(new CustomEvent("escala-db-synced"));
  };

  // Remover data de ausência
  const handleRemoveBlackout = (indexToRemove) => {
    const updatedVolunteers = volunteers.map(v => {
      if (v.id === selectedVolId) {
        const list = v.blackouts || [];
        return { ...v, blackouts: list.filter((_, idx) => idx !== indexToRemove) };
      }
      return v;
    });

    saveVolunteers(updatedVolunteers);
    setVolunteers(updatedVolunteers);
    window.dispatchEvent(new CustomEvent("escala-db-synced"));
  };

  // Helpers de visualização
  const getServiceDetails = (serviceId) => {
    return services.find(s => s.id === serviceId) || { title: "Culto Desconhecido", date: "", time: "", songs: [] };
  };

  const getRoleLabel = (ministryId, roleId) => {
    const min = ministries.find(m => m.id === ministryId);
    if (!min) return roleId;
    const role = min.roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  return (
    <div className="view-transition">
      <div className="app-header">
        <div className="header-title-container">
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Smile style={{ color: "var(--primary)" }} /> Portal do Voluntário
          </h1>
          <p>Confirme suas escalas, acesse o repertório musical e gerencie suas datas de indisponibilidade.</p>
        </div>

        {/* Seletor premium de simulação de membro */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", background: "var(--glass-bg)", border: "1px solid var(--glass-border)", padding: "0.5rem 1rem", borderRadius: "var(--radius-lg)", backdropFilter: "blur(10px)" }}>
          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 600 }}>Simular Membro:</span>
          <select
            value={selectedVolId}
            onChange={(e) => setSelectedVolId(e.target.value)}
            className="form-select"
            style={{ width: "200px", padding: "0.4rem 0.75rem", fontSize: "0.875rem", margin: 0 }}
          >
            <option value="">-- Escolha um Voluntário --</option>
            {volunteers.map(v => (
              <option key={v.id} value={v.id}>{v.name}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedVolId ? (
        <div className="card" style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5rem" }}>
          <div style={{ padding: "1.5rem", background: "rgba(139, 92, 246, 0.1)", color: "var(--primary)", borderRadius: "50%" }}>
            <Sparkles size={48} className="animate-pulse-slow" />
          </div>
          <div>
            <h2 style={{ fontSize: "1.5rem", color: "var(--text-active)", marginBottom: "0.5rem" }}>Área de Acesso do Voluntário</h2>
            <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto", lineHeight: 1.6 }}>
              Para simular a visão de um membro da igreja, por favor selecione um voluntário no dropdown do cabeçalho ou selecione abaixo:
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0.75rem", maxWidth: "600px", marginTop: "1rem" }}>
            {volunteers.slice(0, 8).map(v => (
              <button
                key={v.id}
                className="btn btn-secondary"
                onClick={() => setSelectedVolId(v.id)}
                style={{ fontSize: "0.85rem" }}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid-cols-12">
          {/* Minha Agenda / Escalas futuras */}
          <div className="card" style={{ gridColumn: "span 7" }}>
            <h3 style={{ fontSize: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Calendar size={20} style={{ color: "var(--primary)" }} /> Minha Agenda & Escalas
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {myAssignments.length > 0 ? (
                myAssignments.map((assign) => {
                  const service = getServiceDetails(assign.serviceId);
                  const isConfirmed = assign.status === "confirmed";
                  const isDeclined = assign.status === "declined";
                  const isPending = assign.status === "pending";

                  return (
                    <div
                      key={assign.id}
                      style={{
                        padding: "1.25rem",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: `1px solid ${isConfirmed ? "rgba(16, 185, 129, 0.2)" : isDeclined ? "rgba(239, 68, 68, 0.2)" : "var(--glass-border)"}`,
                        borderRadius: "var(--radius-lg)",
                        transition: "var(--transition-normal)"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                        <div>
                          <h4 style={{ fontSize: "1.125rem", color: "var(--text-active)", fontWeight: 700, marginBottom: "0.25rem" }}>
                            {service.title}
                          </h4>
                          <div style={{ display: "flex", gap: "1rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                            <span>📅 {new Date(service.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })}</span>
                            <span>⏰ {service.time}</span>
                          </div>
                        </div>

                        <span className={`badge ${isConfirmed ? "badge-success" : isDeclined ? "badge-danger" : "badge-warning"}`}>
                          {isConfirmed ? "Confirmado" : isDeclined ? "Recusado" : "Pendente de Resposta"}
                        </span>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(255, 255, 255, 0.01)", borderRadius: "var(--radius-md)", border: "1px solid rgba(255, 255, 255, 0.03)", marginBottom: "1.25rem" }}>
                        <span style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Sua Função Escalada:</span>
                        <strong style={{ fontSize: "0.9375rem", color: "var(--primary)" }}>{getRoleLabel(assign.ministryId, assign.roleId)}</strong>
                      </div>

                      {/* Botões de Ação para o voluntário */}
                      <div style={{ display: "flex", gap: "0.75rem" }}>
                        <button
                          className={`btn btn-success`}
                          style={{ flex: 1, padding: "0.6rem" }}
                          onClick={() => handleUpdateStatus(assign.id, "confirmed")}
                          disabled={isConfirmed}
                        >
                          <CheckCircle size={16} /> Confirmar Presença
                        </button>
                        <button
                          className={`btn btn-danger`}
                          style={{ flex: 1, padding: "0.6rem" }}
                          onClick={() => handleUpdateStatus(assign.id, "declined")}
                          disabled={isDeclined}
                        >
                          <XCircle size={16} /> Recusar Convite
                        </button>
                      </div>

                      {/* Setlist do Culto (Exibido apenas para voluntários de Louvor/Dança confirmados ou pendentes) */}
                      {isConfirmed && service.songs && service.songs.length > 0 && (
                        <div style={{ marginTop: "1.25rem", borderTop: "1px dashed var(--glass-border)", paddingTop: "1rem" }}>
                          <h5 style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.85rem", color: "#c084fc", marginBottom: "0.75rem" }}>
                            <Music size={14} /> Repertório Musical (Pratique sua parte)
                          </h5>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {service.songs.map((song, idx) => (
                              <div
                                key={song.id || idx}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  padding: "0.5rem 0.75rem",
                                  background: "rgba(139, 92, 246, 0.03)",
                                  border: "1px solid rgba(139, 92, 246, 0.1)",
                                  borderRadius: "var(--radius-sm)"
                                }}
                              >
                                <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                                  {song.title} <strong style={{ color: "#a78bfa" }}>({song.key || song.tone})</strong>
                                </span>
                                {song.link && (
                                  <a
                                    href={song.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-secondary btn-icon"
                                    style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.25rem" }}
                                  >
                                    <FileText size={12} /> Cifra / Link
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", border: "1px dashed var(--glass-border)", borderRadius: "var(--radius-lg)" }}>
                  📅 Nenhuma escala ativa agendada para você neste momento.
                </div>
              )}
            </div>
          </div>

          {/* Gerenciar Ausências / Indisponibilidades */}
          <div style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            {/* Card para Cadastrar Ausência */}
            <div className="card">
              <h3 style={{ fontSize: "1.125rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <CalendarDays size={18} style={{ color: "var(--danger)" }} /> Bloquear Minha Agenda
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
                Informe abaixo as datas em que você estará viajando, com compromisso ou impossibilitado de servir. O algoritmo do sistema não deixará os líderes escalarem você nessas datas!
              </p>

              <form onSubmit={handleAddBlackout} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Data da Ausência</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newBlackoutDate}
                    onChange={(e) => setNewBlackoutDate(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ fontSize: "0.75rem" }}>Janela de Horário (Opcional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: 08:00 - 12:00, ou em branco para o dia todo"
                    value={newBlackoutTime}
                    onChange={(e) => setNewBlackoutTime(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-danger" style={{ width: "100%", padding: "0.6rem" }}>
                  <Plus size={16} /> Agendar Ausência
                </button>
              </form>
            </div>

            {/* Listagem de Ausências */}
            <div className="card">
              <h3 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Minhas Ausências Agendadas</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "250px", overflowY: "auto", paddingRight: "0.25rem" }}>
                {currentVolunteer.blackouts && currentVolunteer.blackouts.length > 0 ? (
                  currentVolunteer.blackouts.map((b, idx) => {
                    const hasTime = typeof b !== "string" && b.time;
                    const dateStr = typeof b === "string" ? b : b.date;
                    const timeStr = typeof b === "string" ? "" : b.time;

                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "0.6rem 0.75rem",
                          background: "rgba(239, 68, 68, 0.04)",
                          border: "1px solid rgba(239, 68, 68, 0.15)",
                          borderRadius: "var(--radius-md)"
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-active)" }}>
                            📅 {new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR")}
                          </span>
                          {hasTime && (
                            <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.1rem" }}>
                              <Clock size={10} /> {timeStr}
                            </span>
                          )}
                        </div>

                        <button
                          className="btn btn-icon"
                          style={{ color: "#ef4444", padding: "0.25rem" }}
                          onClick={() => handleRemoveBlackout(idx)}
                          title="Excluir data de ausência"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                    🌴 Nenhuma ausência registrada. Você está 100% disponível!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
