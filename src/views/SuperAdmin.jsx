// -------------------------------------------------------------
// ESCALA VIEW - SUPER ADMIN (SAAS LEVEL)
// -------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  Building2,
  Users,
  AlertOctagon,
  Plus,
  ShieldAlert,
  CreditCard,
  UserCheck,
  Power,
  Edit2,
  Trash2,
  X
} from "lucide-react";
import { getMinistries } from "../utils/storage";

export default function SuperAdmin() {
  const [organizations, setOrganizations] = useState([
    { id: "o1", name: "Convenção Assembleia de Deus Madureira", slug: "ad-madureira", plan: "Catedral", status: "active", mrr: 450, branchesCount: 12, created: "2026-01-15" },
    { id: "o2", name: "Igreja Batista da Lagoinha", slug: "lagoinha", plan: "Catedral", status: "active", mrr: 650, branchesCount: 8, created: "2026-02-10" },
    { id: "o3", name: "Igreja Presbiteriana do Brasil Sede", slug: "ipb-sede", plan: "Profissional", status: "active", mrr: 150, branchesCount: 3, created: "2026-03-01" },
    { id: "o4", name: "Comunidade Evangélica Sara Nossa Terra", slug: "sara-nossa-terra", plan: "Profissional", status: "suspended", mrr: 0, branchesCount: 4, created: "2026-04-18" },
    { id: "o5", name: "Igreja Videira Local", slug: "videira-local", plan: "Gratuito", status: "active", mrr: 0, branchesCount: 1, created: "2026-05-12" }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newOrg, setNewOrg] = useState({ name: "", slug: "", plan: "Profissional" });

  // Calcular métricas
  const totalOrgs = organizations.length;
  const activeOrgs = organizations.filter(o => o.status === "active").length;
  const totalBranches = organizations.reduce((acc, o) => acc + o.branchesCount, 0);
  const totalMRR = organizations.reduce((acc, o) => acc + o.mrr, 0);

  const handleCreateOrg = (e) => {
    e.preventDefault();
    if (!newOrg.name.trim()) return;

    const orgSlug = newOrg.slug.trim() || newOrg.name.toLowerCase().replace(/ /g, "-");

    const createdOrg = {
      id: `org_${Date.now()}`,
      name: newOrg.name,
      slug: orgSlug,
      plan: newOrg.plan,
      status: "active",
      mrr: newOrg.plan === "Catedral" ? 450 : newOrg.plan === "Profissional" ? 150 : 0,
      branchesCount: 1,
      created: new Date().toISOString().slice(0, 10)
    };

    setOrganizations(prev => [...prev, createdOrg]);
    setNewOrg({ name: "", slug: "", plan: "Profissional" });
    setIsModalOpen(false);
  };

  const handleToggleStatus = (id) => {
    setOrganizations(prev => prev.map(o => {
      if (o.id === id) {
        const nextStatus = o.status === "active" ? "suspended" : "active";
        const nextMRR = nextStatus === "active" ? (o.plan === "Catedral" ? 450 : o.plan === "Profissional" ? 150 : 0) : 0;
        return { ...o, status: nextStatus, mrr: nextMRR };
      }
      return o;
    }));
  };

  const handleDeleteOrg = (id, name) => {
    if (window.confirm(`Deseja realmente DELETAR a organização "${name}"? Isso apagará todas as filiais e dados vinculados.`)) {
      setOrganizations(prev => prev.filter(o => o.id !== id));
    }
  };

  return (
    <div className="view-transition">
      <div className="app-header">
        <div className="header-title-container">
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ShieldAlert style={{ color: "var(--danger)" }} /> Painel Super Admin (SaaS)
          </h1>
          <p>Visão de controle global da infraestrutura do Escala, faturamento e contas clientes.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} /> Cadastrar Nova Igreja
        </button>
      </div>

      {/* Métricas do SaaS */}
      <div className="grid-cols-4" style={{ marginBottom: "2.5rem" }}>
        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(16, 185, 129, 0.15)", borderRadius: "var(--radius-md)", color: "var(--secondary)" }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>R$ {totalMRR.toLocaleString("pt-BR")},00</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Receita Recorrente (MRR)</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(139, 92, 246, 0.15)", borderRadius: "var(--radius-md)", color: "var(--primary)" }}>
            <Building2 size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{totalOrgs} ({activeOrgs} Ativas)</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Igrejas Registradas</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(14, 165, 233, 0.15)", borderRadius: "var(--radius-md)", color: "var(--info)" }}>
            <Users size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>{totalBranches}</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Sedes / Filiais Ativas</p>
          </div>
        </div>

        <div className="card" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ padding: "0.75rem", background: "rgba(245, 158, 11, 0.15)", borderRadius: "var(--radius-md)", color: "var(--warning)" }}>
            <AlertOctagon size={28} />
          </div>
          <div>
            <h4 style={{ fontSize: "1.75rem", fontWeight: 800 }}>0</h4>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>Chamados Pendentes</p>
          </div>
        </div>
      </div>

      {/* Tabela de Organizações Clientes */}
      <div className="card">
        <h3 style={{ fontSize: "1.125rem", marginBottom: "1.25rem" }}>Clientes Cadastrados (Organizações / Igrejas)</h3>

        <div className="custom-table-wrapper">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Igreja / Organização</th>
                <th>Slug</th>
                <th>Plano</th>
                <th>Mensalidade</th>
                <th>Filiais</th>
                <th>Data de Adesão</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {organizations.map(org => (
                <tr key={org.id}>
                  <td style={{ fontWeight: 600, color: "var(--text-active)" }}>{org.name}</td>
                  <td><code>{org.slug}</code></td>
                  <td>
                    <span className={`badge ${org.plan === "Catedral" ? "badge-primary" : org.plan === "Profissional" ? "badge-info" : "badge-secondary"}`}>
                      {org.plan}
                    </span>
                  </td>
                  <td>R$ {org.mrr},00 / mês</td>
                  <td>{org.branchesCount} Sede(s)</td>
                  <td>{new Date(org.created + "T00:00:00").toLocaleDateString("pt-BR")}</td>
                  <td>
                    <span className={`badge ${org.status === "active" ? "badge-success" : "badge-danger"}`}>
                      {org.status === "active" ? "Ativo" : "Suspenso"}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button
                        className={`btn ${org.status === "active" ? "btn-danger" : "btn-success"}`}
                        style={{ padding: "0.35rem 0.75rem", fontSize: "0.75rem" }}
                        onClick={() => handleToggleStatus(org.id)}
                        title={org.status === "active" ? "Suspender Conta" : "Ativar Conta"}
                      >
                        <Power size={12} /> {org.status === "active" ? "Suspender" : "Ativar"}
                      </button>
                      <button
                        className="btn btn-icon"
                        style={{ color: "#ef4444" }}
                        onClick={() => handleDeleteOrg(org.id, org.name)}
                        title="Deletar Igreja"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL CADASTRAR NOVA ORGANIZAÇÃO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Cadastrar Nova Organização Cliente</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateOrg}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div className="form-group">
                  <label className="form-label">Nome da Organização (Igreja)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Igreja Batista da Lagoinha"
                    value={newOrg.name}
                    onChange={(e) => setNewOrg(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Slug de Subdomínio (Único)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: lagoinha"
                    value={newOrg.slug}
                    onChange={(e) => setNewOrg(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Plano de Assinatura</label>
                  <select
                    className="form-select"
                    value={newOrg.plan}
                    onChange={(e) => setNewOrg(prev => ({ ...prev, plan: e.target.value }))}
                  >
                    <option value="Gratuito">Gratuito (1 Sede, até 15 membros) - R$ 0</option>
                    <option value="Profissional">Profissional (até 5 sedes, membros ilimitados) - R$ 150/mês</option>
                    <option value="Catedral">Catedral (sedes ilimitadas, membros ilimitados) - R$ 450/mês</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Cadastrar e Ativar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
