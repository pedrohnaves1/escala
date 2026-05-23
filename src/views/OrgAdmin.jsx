// -------------------------------------------------------------
// ESCALA VIEW - ORGANIZAÇÃO (MATRIZ / CONVENÇÃO LEVEL)
// -------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Building2,
  Users,
  CreditCard,
  Plus,
  ArrowRightLeft,
  Calendar,
  X,
  PlusCircle,
  Sparkles,
  MapPin,
  CheckCircle,
  ExternalLink,
  Trash2
} from "lucide-react";
import { getVolunteers, getMinistries } from "../utils/storage";

export default function OrgAdmin() {
  const [branches, setBranches] = useState([
    { id: "b1", name: "Sede Principal Centro", city: "São Paulo", state: "SP", leader: "Pr. Marcos Lima", members: 124, status: "active" },
    { id: "b2", name: "Congregação Zona Norte", city: "São Paulo", state: "SP", leader: "Coord. Felipe Souza", members: 42, status: "active" },
    { id: "b3", name: "Filial Campinas", city: "Campinas", state: "SP", leader: "Pr. André Jesus", members: 68, status: "active" },
    { id: "b4", name: "Congregação Alphaville", city: "Barueri", state: "SP", leader: "Coord. Julia Castro", members: 26, status: "active" }
  ]);

  const [transfers, setTransfers] = useState([
    { id: "t1", volunteerName: "João Silva", sourceBranch: "Sede Principal Centro", targetBranch: "Filial Campinas", role: "Teclado", date: "2026-05-30", status: "Aprovado" },
    { id: "t2", volunteerName: "Pedro Santos", sourceBranch: "Sede Principal Centro", targetBranch: "Congregação Zona Norte", role: "Operador de Som", date: "2026-05-24", status: "Pendente" }
  ]);

  const [volunteers, setVolunteers] = useState([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  // Form states
  const [newBranch, setNewBranch] = useState({ name: "", city: "", state: "", leader: "" });
  const [newTransfer, setNewTransfer] = useState({ volunteerId: "", targetBranchId: "", date: "", role: "Violão" });

  const loadData = () => {
    setVolunteers(getVolunteers());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBranch = (e) => {
    e.preventDefault();
    if (!newBranch.name.trim()) return;

    const createdBranch = {
      id: `b_${Date.now()}`,
      name: newBranch.name,
      city: newBranch.city || "N/A",
      state: newBranch.state || "N/A",
      leader: newBranch.leader || "Pendente",
      members: 0,
      status: "active"
    };

    setBranches(prev => [...prev, createdBranch]);
    setNewBranch({ name: "", city: "", state: "", leader: "" });
    setIsBranchModalOpen(false);
  };

  const handleCreateTransfer = (e) => {
    e.preventDefault();
    if (!newTransfer.volunteerId || !newTransfer.targetBranchId || !newTransfer.date) return;

    const vol = volunteers.find(v => v.id === newTransfer.volunteerId);
    const targetB = branches.find(b => b.id === newTransfer.targetBranchId);

    if (!vol || !targetB) return;

    const createdTransfer = {
      id: `t_${Date.now()}`,
      volunteerName: vol.name,
      sourceBranch: "Sede Principal Centro", // Assume a sede local
      targetBranch: targetB.name,
      role: newTransfer.role,
      date: newTransfer.date,
      status: "Aprovado" // Auto-aprovado pelo admin da matriz
    };

    setTransfers(prev => [createdTransfer, ...prev]);
    setIsTransferModalOpen(false);
  };

  const handleDeleteBranch = (id, name) => {
    if (window.confirm(`Tem certeza que deseja deletar a sede "${name}"?`)) {
      setBranches(prev => prev.filter(b => b.id !== id));
    }
  };

  return (
    <div className="view-transition">
      <div className="app-header">
        <div className="header-title-container">
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Building2 style={{ color: "var(--primary)" }} /> Painel de Organização (Matriz)
          </h1>
          <p>Gerencie faturamento da denominação, cadastre sedes/filiais e gerencie compartilhamento de equipes voluntárias.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsBranchModalOpen(true)}>
          <Plus size={16} /> Cadastrar Nova Sede
        </button>
      </div>

      {/* Grid de Métricas Consolidadas */}
      <div className="grid-cols-4" style={{ marginBottom: "2.5rem" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(139, 92, 246, 0.15)", borderRadius: "var(--radius-md)", color: "var(--primary)" }}>
            <Building2 size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{branches.length}</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Sedes Cadastradas</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(14, 165, 233, 0.15)", borderRadius: "var(--radius-md)", color: "var(--info)" }}>
            <Users size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{branches.reduce((a, b) => a + b.members, 0)}</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Membros Ativos Totais</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(16, 185, 129, 0.15)", borderRadius: "var(--radius-md)", color: "var(--secondary)" }}>
            <CreditCard size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>R$ 450,00</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Assinatura (Plano Catedral)</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(245, 158, 11, 0.15)", borderRadius: "var(--radius-md)", color: "var(--warning)" }}>
            <ArrowRightLeft size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{transfers.length}</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Apoios Inter-Sedes</p>
          </div>
        </div>
      </div>

      <div className="grid-cols-12">
        {/* Tabela de Congregações / Sedes */}
        <div className="card" style={{ gridColumn: "span 7" }}>
          <h3 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Congregações / Sedes Ativas</h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {branches.map(b => (
              <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.85rem 1rem", background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <h4 style={{ fontWeight: 700, fontSize: "0.9375rem", color: "var(--text-active)" }}>{b.name}</h4>
                  <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                    <MapPin size={12} /> {b.city} — {b.state} • 👥 {b.members} voluntários • Líder: {b.leader}
                  </p>
                </div>
                
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button className="btn btn-secondary btn-icon" title="Ver painel local desta sede">
                    <ExternalLink size={14} />
                  </button>
                  <button className="btn btn-icon" style={{ color: "#ef4444" }} onClick={() => handleDeleteBranch(b.id, b.name)} title="Excluir Sede">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Painel de Apoio Compartilhado (Escala Cruzada) */}
        <div className="card" style={{ gridColumn: "span 5" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <ArrowRightLeft size={18} style={{ color: "var(--primary)" }} /> Apoio Cruzado de Voluntários
            </h3>
            <button className="btn btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.75rem" }} onClick={() => setIsTransferModalOpen(true)}>
              <Plus size={12} /> Solicitar Apoio
            </button>
          </div>

          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
            Líderes de Matriz podem transferir ou disponibilizar voluntários temporariamente para dar suporte a filiais que precisam de apoio instrumental ou técnico.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {transfers.map(t => (
              <div key={t.id} style={{ padding: "0.75rem", background: "rgba(139, 92, 246, 0.03)", border: "1px solid rgba(139, 92, 246, 0.15)", borderRadius: "var(--radius-md)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h4 style={{ fontSize: "0.875rem", fontWeight: 700 }}>{t.volunteerName} ({t.role})</h4>
                  <span className={`badge ${t.status === "Aprovado" ? "badge-success" : "badge-warning"}`} style={{ fontSize: "0.65rem" }}>
                    {t.status}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  De: *{t.sourceBranch}* para *{t.targetBranch}*
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--primary)", fontWeight: 600, marginTop: "0.25rem" }}>
                  📅 Data do Apoio: {new Date(t.date + "T00:00:00").toLocaleDateString("pt-BR")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL CADASTRAR FILIAL / SEDE */}
      {isBranchModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Cadastrar Nova Sede / Filial</h3>
              <button className="btn btn-icon" onClick={() => setIsBranchModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateBranch}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="form-group">
                  <label className="form-label">Nome da Sede / Congregação</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Congregação Zona Sul"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Cidade</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: São Paulo"
                      value={newBranch.city}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estado (UF)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Ex: SP"
                      value={newBranch.state}
                      onChange={(e) => setNewBranch(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Coordenador / Líder Local</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Ev. Felipe Souza"
                    value={newBranch.leader}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, leader: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsBranchModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Sede
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SOLICITAR APOIO CRUZADO */}
      {isTransferModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Solicitar Apoio Cruzado</h3>
              <button className="btn btn-icon" onClick={() => setIsTransferModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTransfer}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="form-group">
                  <label className="form-label">Voluntário Cedente (Disponível na Sede)</label>
                  <select
                    className="form-select"
                    value={newTransfer.volunteerId}
                    onChange={(e) => setNewTransfer(prev => ({ ...prev, volunteerId: e.target.value }))}
                    required
                  >
                    <option value="">Selecione o Voluntário...</option>
                    {volunteers.map(v => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Sede / Filial que Receberá o Apoio</label>
                  <select
                    className="form-select"
                    value={newTransfer.targetBranchId}
                    onChange={(e) => setNewTransfer(prev => ({ ...prev, targetBranchId: e.target.value }))}
                    required
                  >
                    <option value="">Selecione a Filial...</option>
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Data do Culto</label>
                    <input
                      type="date"
                      className="form-input"
                      value={newTransfer.date}
                      onChange={(e) => setNewTransfer(prev => ({ ...prev, date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Função / Instrumento</label>
                    <input
                      type="text"
                      className="form-input"
                      value={newTransfer.role}
                      onChange={(e) => setNewTransfer(prev => ({ ...prev, role: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsTransferModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Liberar e Agendar Apoio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
