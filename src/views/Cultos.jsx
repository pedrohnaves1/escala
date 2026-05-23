// -------------------------------------------------------------
// ESCALA VIEW - CULTOS & PLANEJAMENTO
// -------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Clock,
  BookOpen,
  X,
  Sparkles,
  Settings,
  PlusCircle,
  FolderPlus
} from "lucide-react";
import {
  getServices,
  saveServices,
  getMinistries,
  saveMinistries,
  getAssignments,
  saveAssignments
} from "../utils/storage";

export default function Cultos() {
  const [services, setServices] = useState([]);
  const [ministries, setMinistries] = useState([]);
  
  // Tab interna: "services" (Cultos) ou "ministries" (Ministérios)
  const [activeSubTab, setActiveSubTab] = useState("services");

  // Modal de Culto State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    date: "",
    time: "",
    description: "",
    requiredRoles: [], // Array de { ministryId, roleId }
    setlist: [] // Array de { id, title, key, link }
  });

  // Modal de Ministério State
  const [isMinistryModalOpen, setIsMinistryModalOpen] = useState(false);
  const [newMinistryName, setNewMinistryName] = useState("");
  const [newMinistryColor, setNewMinistryColor] = useState("#8b5cf6");

  // Estado para adicionar novas funções a ministérios existentes
  const [newRoleNames, setNewRoleNames] = useState({}); // { [ministryId]: "" }

  const loadData = () => {
    setServices(getServices());
    setMinistries(getMinistries());
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- CONTROLE DE CULTOS ---

  const handleOpenCreateService = () => {
    setEditingServiceId(null);
    setServiceForm({
      title: "",
      date: "",
      time: "",
      description: "",
      requiredRoles: [],
      setlist: []
    });
    setIsServiceModalOpen(true);
  };

  const handleOpenEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      title: service.title,
      date: service.date,
      time: service.time,
      description: service.description || "",
      requiredRoles: service.requiredRoles ? [...service.requiredRoles] : [],
      setlist: service.setlist ? [...service.setlist] : []
    });
    setIsServiceModalOpen(true);
  };

  const handleDeleteService = (id, title) => {
    if (window.confirm(`Tem certeza que deseja excluir o culto "${title}"? Isso removerá todas as escalas vinculadas a ele.`)) {
      // Remover culto
      const updatedServices = services.filter(s => s.id !== id);
      saveServices(updatedServices);
      setServices(updatedServices);

      // Limpar escalas associadas
      const assignments = getAssignments();
      const updatedAssignments = assignments.filter(a => a.serviceId !== id);
      saveAssignments(updatedAssignments);
    }
  };

  const handleServiceChange = (e) => {
    const { name, value } = e.target;
    setServiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle de Cargos Requeridos no Culto
  const handleRequiredRoleToggle = (ministryId, roleId) => {
    setServiceForm(prev => {
      const exists = prev.requiredRoles.some(
        r => r.ministryId === ministryId && r.roleId === roleId
      );

      let newRoles;
      if (exists) {
        newRoles = prev.requiredRoles.filter(
          r => !(r.ministryId === ministryId && r.roleId === roleId)
        );
      } else {
        newRoles = [...prev.requiredRoles, { ministryId, roleId }];
      }

      return { ...prev, requiredRoles: newRoles };
    });
  };

  // Salvar Culto
  const handleSaveService = (e) => {
    e.preventDefault();
    if (!serviceForm.title.trim() || !serviceForm.date || !serviceForm.time) {
      alert("Título, Data e Hora são obrigatórios!");
      return;
    }

    let updated;
    if (editingServiceId) {
      updated = services.map(s => 
        s.id === editingServiceId ? { ...s, ...serviceForm } : s
      );
    } else {
      const newService = {
        id: `s_${Date.now()}`,
        ...serviceForm,
        setlist: [] // Inicializa setlist vazia
      };
      updated = [...services, newService];
    }

    // Ordena os cultos por data
    updated.sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

    saveServices(updated);
    setServices(updated);
    setIsServiceModalOpen(false);
  };

  // --- CONTROLE DE MINISTÉRIOS E FUNÇÕES ---

  // Criar Ministério
  const handleCreateMinistry = (e) => {
    e.preventDefault();
    if (!newMinistryName.trim()) return;

    const newMin = {
      id: `m_${Date.now()}`,
      name: newMinistryName,
      color: newMinistryColor,
      roles: []
    };

    const updated = [...ministries, newMin];
    saveMinistries(updated);
    setMinistries(updated);
    setNewMinistryName("");
    setIsMinistryModalOpen(false);
  };

  // Excluir Ministério
  const handleDeleteMinistry = (id, name) => {
    if (window.confirm(`ATENÇÃO: Excluir o ministério "${name}" apagará todas as suas funções e desabilitará voluntários relacionados. Deseja prosseguir?`)) {
      const updated = ministries.filter(m => m.id !== id);
      saveMinistries(updated);
      setMinistries(updated);
    }
  };

  // Adicionar Função a um Ministério
  const handleAddRoleToMinistry = (ministryId) => {
    const roleName = newRoleNames[ministryId];
    if (!roleName || !roleName.trim()) return;

    const updated = ministries.map(m => {
      if (m.id === ministryId) {
        const newRoleId = `r_${Date.now()}`;
        const newRoleObj = { id: newRoleId, name: roleName.trim() };
        return {
          ...m,
          roles: [...m.roles, newRoleObj]
        };
      }
      return m;
    });

    saveMinistries(updated);
    setMinistries(updated);
    setNewRoleNames(prev => ({ ...prev, [ministryId]: "" }));
  };

  // Excluir Função de um Ministério
  const handleDeleteRoleFromMinistry = (ministryId, roleId, roleName) => {
    if (window.confirm(`Excluir a função "${roleName}" do ministério?`)) {
      const updated = ministries.map(m => {
        if (m.id === ministryId) {
          return {
            ...m,
            roles: m.roles.filter(r => r.id !== roleId)
          };
        }
        return m;
      });

      saveMinistries(updated);
      setMinistries(updated);
    }
  };

  // Helper para contar voluntários qualificados
  const countQualifiedVolunteers = (ministryId, roleId) => {
    const volunteers = JSON.parse(localStorage.getItem("escala_volunteers") || "[]");
    return volunteers.filter(v => 
      v.skills && v.skills.some(s => s.ministryId === ministryId && s.roleId === roleId)
    ).length;
  };

  return (
    <div className="view-transition">
      <div className="app-header">
        <div className="header-title-container">
          <h1>Planejamento e Estrutura</h1>
          <p>Cadastre cultos, defina quais equipes são requeridas e personalize ministérios e funções.</p>
        </div>
      </div>

      {/* Sub-Navegação interna (Abas do Planejamento) */}
      <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem", marginBottom: "2rem" }}>
        <button
          className={`btn ${activeSubTab === "services" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveSubTab("services")}
        >
          <Calendar size={16} /> Cultos e Eventos
        </button>
        <button
          className={`btn ${activeSubTab === "ministries" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveSubTab("ministries")}
        >
          <Settings size={16} /> Ministérios e Funções
        </button>
      </div>

      {/* CONTEÚDO DA ABA DE CULTOS */}
      {activeSubTab === "services" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem" }}>Calendário de Cultos Planejados</h3>
            <button className="btn btn-primary" onClick={handleOpenCreateService}>
              <Plus size={16} /> Planejar Novo Culto
            </button>
          </div>

          {services.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {services.map(s => (
                <div key={s.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    {/* Emblema com a data */}
                    <div style={{ background: "rgba(139, 92, 246, 0.15)", color: "var(--primary)", border: "1px solid rgba(139, 92, 246, 0.25)", padding: "1rem", borderRadius: "var(--radius-md)", width: "90px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "1.25rem", fontWeight: 800 }}>
                        {s.date.slice(8, 10)}
                      </span>
                      <span style={{ fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 600 }}>
                        {new Date(s.date + "T00:00:00").toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: "1.25rem", color: "var(--text-active)", marginBottom: "0.25rem" }}>{s.title}</h3>
                      <div style={{ display: "flex", gap: "1.25rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <Clock size={14} /> {s.time}
                        </span>
                        <span>
                          👥 {s.requiredRoles ? s.requiredRoles.length : 0} posições requeridas
                        </span>
                        {s.setlist && s.setlist.length > 0 && (
                          <span style={{ color: "#c084fc", fontWeight: 500 }}>
                            🎵 {s.setlist.length} músicas no repertório
                          </span>
                        )}
                      </div>
                      {s.description && (
                        <p style={{ marginTop: "0.5rem", color: "var(--text-secondary)", fontSize: "0.875rem", maxWidth: "600px" }}>
                          {s.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-secondary" onClick={() => handleOpenEditService(s)}>
                      <Edit2 size={14} /> Editar
                    </button>
                    <button className="btn btn-danger" onClick={() => handleDeleteService(s.id, s.title)}>
                      <Trash2 size={14} /> Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              <Calendar size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
              <h3>Nenhum culto cadastrado</h3>
              <p style={{ marginTop: "0.25rem", color: "var(--text-muted)" }}>Comece criando e planejando um culto agora mesmo!</p>
            </div>
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA DE MINISTÉRIOS */}
      {activeSubTab === "ministries" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h3 style={{ fontSize: "1.25rem" }}>Estrutura de Equipes da Igreja</h3>
            <button className="btn btn-primary" onClick={() => setIsMinistryModalOpen(true)}>
              <FolderPlus size={16} /> Criar Novo Ministério
            </button>
          </div>

          <div className="grid-cols-2">
            {ministries.map(m => (
              <div key={m.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1.25rem", borderTop: `4px solid ${m.color}` }}>
                
                {/* Header do card de Ministério */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: m.color }}>{m.name}</h3>
                  <button className="btn btn-icon" style={{ color: "#f87171" }} onClick={() => handleDeleteMinistry(m.id, m.name)} title="Excluir Ministério">
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Lista de Funções */}
                <div>
                  <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.75rem", letterSpacing: "0.05em" }}>
                    Funções Cadastradas
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {m.roles && m.roles.length > 0 ? (
                      m.roles.map(role => {
                        const qualifiedCount = countQualifiedVolunteers(m.id, role.id);
                        return (
                          <div key={role.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "var(--radius-sm)" }}>
                            <span style={{ fontSize: "0.875rem", fontWeight: 500 }}>{role.name}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>
                                {qualifiedCount} voluntário(s) habilitado(s)
                              </span>
                              <button className="btn btn-icon" style={{ padding: "0.2rem", color: "#fca5a5" }} onClick={() => handleDeleteRoleFromMinistry(m.id, role.id, role.name)} title="Excluir Função">
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Nenhuma função criada. Adicione uma abaixo!
                      </span>
                    )}
                  </div>
                </div>

                {/* Input para Adicionar Nova Função */}
                <div style={{ display: "flex", gap: "0.5rem", borderTop: "1px solid var(--glass-border)", paddingTop: "0.75rem", marginTop: "auto" }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Adicionar nova função (ex: Bateria)..."
                    value={newRoleNames[m.id] || ""}
                    onChange={(e) => setNewRoleNames(prev => ({ ...prev, [m.id]: e.target.value }))}
                    style={{ flex: 1, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                  />
                  <button className="btn btn-secondary" style={{ padding: "0.5rem 0.75rem" }} onClick={() => handleAddRoleToMinistry(m.id)}>
                    <Plus size={14} /> Adicionar
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CRIAR/EDITAR CULTO */}
      {isServiceModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h3>{editingServiceId ? "Editar Culto Planejado" : "Planejar Novo Culto"}</h3>
              <button className="btn btn-icon" onClick={() => setIsServiceModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveService}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* Campos do Culto */}
                <div className="form-group">
                  <label className="form-label">Título do Culto / Evento</label>
                  <input
                    type="text"
                    className="form-input"
                    name="title"
                    placeholder="Ex: Culto de Celebração de Domingo"
                    value={serviceForm.title}
                    onChange={handleServiceChange}
                    required
                  />
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Data</label>
                    <input
                      type="date"
                      className="form-input"
                      name="date"
                      value={serviceForm.date}
                      onChange={handleServiceChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Horário de Início</label>
                    <input
                      type="time"
                      className="form-input"
                      name="time"
                      value={serviceForm.time}
                      onChange={handleServiceChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descrição / Notas Especiais</label>
                  <textarea
                    className="form-textarea"
                    name="description"
                    placeholder="Notas adicionais sobre o culto (ex: Santa Ceia, Pastor visitante, etc.)"
                    value={serviceForm.description}
                    onChange={handleServiceChange}
                  />
                </div>

                {/* Seleção de quais funções serão necessárias para este culto */}
                <div>
                  <h4 style={{ fontSize: "0.9375rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                    Selecionar Equipes e Funções Requeridas
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                    Marque quais cargos precisarão de voluntários escalados especificamente para este culto.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {ministries.map(m => (
                      <div key={m.id} style={{ background: "rgba(255, 255, 255, 0.01)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                        <h5 style={{ color: m.color, fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {m.name}
                        </h5>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                          {m.roles.map(role => {
                            const isChecked = serviceForm.requiredRoles.some(
                              r => r.ministryId === m.id && r.roleId === role.id
                            );
                            return (
                              <label key={role.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleRequiredRoleToggle(m.id, role.id)}
                                  style={{ accentColor: "var(--primary)", width: "16px", height: "16px" }}
                                />
                                <span>{role.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsServiceModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingServiceId ? "Salvar Alterações" : "Salvar e Planejar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CRIAR NOVO MINISTÉRIO */}
      {isMinistryModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Criar Novo Ministério</h3>
              <button className="btn btn-icon" onClick={() => setIsMinistryModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleCreateMinistry}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div className="form-group">
                  <label className="form-label">Nome do Ministério</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ex: Ministério de Teatro"
                    value={newMinistryName}
                    onChange={(e) => setNewMinistryName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Cor de Identificação Visual</label>
                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="color"
                      value={newMinistryColor}
                      onChange={(e) => setNewMinistryColor(e.target.value)}
                      style={{ border: "none", width: "40px", height: "40px", cursor: "pointer", borderRadius: "50%", background: "none" }}
                    />
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Selecione uma cor para destacar esta equipe nas escalas.
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsMinistryModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Criar Ministério
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
