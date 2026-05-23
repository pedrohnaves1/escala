// -------------------------------------------------------------
// ESCALA VIEW - DASHBOARD
// -------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Users,
  Calendar,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Music,
  Download,
  Upload,
  RefreshCw,
  Sparkles
} from "lucide-react";
import {
  getVolunteers,
  getServices,
  getAssignments,
  getMinistries,
  exportBackup,
  importBackup,
  resetToDefaults
} from "../utils/storage";

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState({
    totalVolunteers: 0,
    totalServices: 0,
    fillRate: 0,
    pendingConfirmations: 0
  });

  const [nextService, setNextService] = useState(null);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [pendingItems, setPendingItems] = useState([]);

  // Recarrega todos os dados
  const loadData = () => {
    const vList = getVolunteers();
    const sList = getServices();
    const aList = getAssignments();
    const mList = getMinistries();

    setVolunteers(vList);
    setAssignments(aList);
    setMinistries(mList);

    // Calcular estatísticas
    const today = new Date().toISOString().slice(0, 10);
    
    // Próximo culto (primeiro com data >= hoje, ordenado por data e hora)
    const futureServices = sList
      .filter(s => s.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    const next = futureServices.length > 0 ? futureServices[0] : (sList.length > 0 ? sList[0] : null);
    setNextService(next);

    // Total de voluntários cadastrados
    const totalV = vList.length;

    // Cultos agendados no mês corrente
    const currentMonth = new Date().toISOString().slice(0, 7);
    const servicesThisMonth = sList.filter(s => s.date.startsWith(currentMonth)).length;

    // Pendentes de confirmação
    const pending = aList.filter(a => a.status === "pending");
    setPendingItems(pending);

    // Taxa de preenchimento de escalas geral
    let totalSlots = 0;
    let filledSlots = 0;

    sList.forEach(s => {
      const required = s.requiredRoles ? s.requiredRoles.length : 0;
      totalSlots += required;
      
      const filled = aList.filter(a => a.serviceId === s.id).length;
      filledSlots += filled;
    });

    const rate = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

    setStats({
      totalVolunteers: totalV,
      totalServices: servicesThisMonth,
      fillRate: rate,
      pendingConfirmations: pending.length
    });
  };

  useEffect(() => {
    loadData();
    window.addEventListener("escala-db-synced", loadData);
    return () => window.removeEventListener("escala-db-synced", loadData);
  }, []);

  // Importar arquivo JSON de backup
  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importBackup(event.target.result);
      if (result.success) {
        alert("Backup restaurado com sucesso!");
        loadData();
      } else {
        alert(`Falha na restauração: ${result.error}`);
      }
    };
    reader.readAsText(file);
  };

  // Helper para achar nome do voluntário
  const getVolunteerName = (id) => {
    const v = volunteers.find(vol => vol.id === id);
    return v ? v.name : "Desconhecido";
  };

  // Helper para achar detalhes do culto
  const getServiceDetails = (id) => {
    const services = getServices();
    return services.find(s => s.id === id) || { title: "Culto Desconhecido", date: "" };
  };

  // Helper para achar nome da função
  const getRoleName = (ministryId, roleId) => {
    const min = ministries.find(m => m.id === ministryId);
    if (!min) return roleId;
    const role = min.roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  return (
    <div className="view-transition">
      <div className="app-header">
        <div className="header-title-container">
          <h1>Painel de Controle</h1>
          <p>Visão geral rápida das equipes, próximos cultos e confirmações.</p>
        </div>
        <div className="flex gap-2" style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={exportBackup}>
            <Download size={16} /> Exportar Backup
          </button>
          <label className="btn btn-secondary" style={{ cursor: "pointer" }}>
            <Upload size={16} /> Importar Backup
            <input type="file" accept=".json" onChange={handleImportFile} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {/* Grid de Métricas */}
      <div className="grid-cols-4" style={{ marginBottom: "2.5rem" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(139, 92, 246, 0.15)", borderRadius: "var(--radius-md)", color: "var(--primary)" }}>
            <Users size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{stats.totalVolunteers}</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Voluntários Ativos</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(14, 165, 233, 0.15)", borderRadius: "var(--radius-md)", color: "var(--info)" }}>
            <Calendar size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{stats.totalServices}</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Cultos este Mês</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(16, 185, 129, 0.15)", borderRadius: "var(--radius-md)", color: "var(--secondary)" }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{stats.fillRate}%</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Escalas Preenchidas</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(245, 158, 11, 0.15)", borderRadius: "var(--radius-md)", color: "var(--warning)" }}>
            <AlertTriangle size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{stats.pendingConfirmations}</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Pendentes de Resposta</p>
          </div>
        </div>
      </div>

      <div className="grid-cols-12">
        {/* Card Destaque: Próximo Culto */}
        <div className="card" style={{ gridColumn: "span 7" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Sparkles size={20} className="sidebar-logo-icon" />
              <h3 style={{ fontSize: "1.25rem" }}>Próximo Culto em Destaque</h3>
            </div>
            <button className="btn btn-secondary btn-icon" onClick={() => setActiveTab("escalas")} title="Ir para Escalas">
              <ArrowRight size={18} />
            </button>
          </div>

          {nextService ? (
            <div>
              <div style={{ marginBottom: "1.5rem" }}>
                <h2 style={{ fontSize: "1.5rem", color: "var(--text-active)", marginBottom: "0.5rem" }}>{nextService.title}</h2>
                <div style={{ display: "flex", gap: "1.5rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  <span>📅 {new Date(nextService.date).toLocaleDateString("pt-BR", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  <span>⏰ {nextService.time}</span>
                </div>
                {nextService.description && (
                  <p style={{ marginTop: "0.75rem", color: "var(--text-secondary)", fontSize: "0.9375rem", lineHeight: 1.5 }}>
                    {nextService.description}
                  </p>
                )}
              </div>

              {/* Setlist do Próximo Culto */}
              {nextService.setlist && nextService.setlist.length > 0 && (
                <div style={{ marginBottom: "1.5rem", background: "rgba(139, 92, 246, 0.05)", border: "1px dashed rgba(139, 92, 246, 0.2)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                  <h4 style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9375rem", color: "#c084fc", marginBottom: "0.75rem" }}>
                    <Music size={16} /> Repertório Musical (Setlist)
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {nextService.setlist.map((m, idx) => (
                      <span key={m.id || idx} className="badge badge-primary">
                        {m.title} <strong>({m.key})</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Status de preenchimento dos cargos do próximo culto */}
              <div>
                <h4 style={{ fontSize: "0.9375rem", marginBottom: "0.75rem", color: "var(--text-secondary)" }}>Status das Equipes</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {nextService.requiredRoles && nextService.requiredRoles.map((req, idx) => {
                    const assign = assignments.find(
                      a => a.serviceId === nextService.id && a.ministryId === req.ministryId && a.roleId === req.roleId
                    );
                    const isFilled = !!assign;

                    return (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                          {getRoleName(req.ministryId, req.roleId)}
                        </span>
                        {isFilled ? (
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <span style={{ fontSize: "0.875rem", color: "var(--text-primary)" }}>{getVolunteerName(assign.volunteerId)}</span>
                            <span className={`badge ${assign.status === "confirmed" ? "badge-success" : assign.status === "pending" ? "badge-warning" : "badge-danger"}`}>
                              {assign.status === "confirmed" ? "Confirmado" : assign.status === "pending" ? "Pendente" : "Recusado"}
                            </span>
                          </div>
                        ) : (
                          <span className="badge badge-danger animate-pulse-slow">Pendente de Escala</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem" }}>Nenhum culto agendado. Vá na aba "Cultos" para criar um novo.</p>
          )}
        </div>

        {/* Alertas de Confirmações Pendentes e Backup */}
        <div style={{ gridColumn: "span 5", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Card de Respostas Pendentes */}
          <div className="card" style={{ flex: 1 }}>
            <h3 style={{ fontSize: "1.125rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <UserCheck size={18} style={{ color: "var(--warning)" }} /> Pendências do WhatsApp
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Estes voluntários foram escalados, mas ainda não responderam se poderão servir:
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto", paddingRight: "0.5rem" }}>
              {pendingItems.length > 0 ? (
                pendingItems.map((p, idx) => {
                  const s = getServiceDetails(p.serviceId);
                  return (
                    <div key={idx} style={{ padding: "0.75rem", background: "rgba(245, 158, 11, 0.04)", border: "1px solid rgba(245, 158, 11, 0.15)", borderRadius: "var(--radius-md)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <h5 style={{ fontWeight: 600, fontSize: "0.875rem" }}>{getVolunteerName(p.volunteerId)}</h5>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.75rem", marginTop: "0.15rem" }}>
                          {s.title} • {getRoleName(p.ministryId, p.roleId)}
                        </p>
                      </div>
                      <span className="badge badge-warning" style={{ fontSize: "0.7rem" }}>Aguardando</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                  🎉 Tudo limpo! Todas as escalas respondidas.
                </div>
              )}
            </div>
          </div>

          {/* Card de Ações Rápidas */}
          <div className="card" style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.07) 0%, rgba(99, 102, 241, 0.03) 100%)" }}>
            <h3 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Ações Rápidas</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <button className="btn btn-primary" onClick={() => setActiveTab("escalas")}>
                Montar Escala de Culto
              </button>
              <button className="btn btn-secondary" onClick={() => setActiveTab("voluntarios")}>
                Adicionar Novo Membro
              </button>
              <button className="btn btn-secondary" style={{ color: "#ef4444" }} onClick={() => {
                if (window.confirm("Atenção: Isso irá apagar todos os dados atuais e restaurar as configurações padrão de fábrica. Deseja prosseguir?")) {
                  resetToDefaults();
                }
              }}>
                <RefreshCw size={14} /> Restaurar Padrões de Teste
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
