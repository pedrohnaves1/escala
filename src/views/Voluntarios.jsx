// -------------------------------------------------------------
// ESCALA VIEW - VOLUNTÁRIOS
// -------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Phone,
  Mail,
  User,
  X,
  PlusCircle
} from "lucide-react";
import { getVolunteers, saveVolunteers, getMinistries } from "../utils/storage";

export default function Voluntarios() {
  const [volunteers, setVolunteers] = useState([]);
  const [ministries, setMinistries] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMinistryFilter, setSelectedMinistryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    maxMonthlyServices: 2,
    skills: [], // Array de { ministryId, roleId }
    blackouts: [] // Array de strings "YYYY-MM-DD"
  });

  const [newBlackoutDate, setNewBlackoutDate] = useState("");
  const [newBlackoutType, setNewBlackoutType] = useState("allDay"); // allDay ou time
  const [newBlackoutStartTime, setNewBlackoutStartTime] = useState("08:00");
  const [newBlackoutEndTime, setNewBlackoutEndTime] = useState("12:00");

  const loadData = () => {
    setVolunteers(getVolunteers());
    setMinistries(getMinistries());
  };

  useEffect(() => {
    loadData();
    window.addEventListener("escala-db-synced", loadData);
    return () => window.removeEventListener("escala-db-synced", loadData);
  }, []);

  // Filtragem dos voluntários
  const filteredVolunteers = volunteers.filter(v => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.email.toLowerCase().includes(search.toLowerCase()) ||
      v.phone.includes(search);

    const matchesMinistry =
      selectedMinistryFilter === "all" ||
      v.skills.some(skill => skill.ministryId === selectedMinistryFilter);

    return matchesSearch && matchesMinistry;
  });

  // Abre Modal de Criação
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      maxMonthlyServices: 2,
      skills: [],
      blackouts: []
    });
    setNewBlackoutDate("");
    setNewBlackoutType("allDay");
    setNewBlackoutStartTime("08:00");
    setNewBlackoutEndTime("12:00");
    setIsModalOpen(true);
  };

  // Abre Modal de Edição
  const handleOpenEditModal = (volunteer) => {
    setEditingId(volunteer.id);
    setFormData({
      name: volunteer.name,
      email: volunteer.email,
      phone: volunteer.phone,
      maxMonthlyServices: volunteer.maxMonthlyServices || 2,
      skills: volunteer.skills ? [...volunteer.skills] : [],
      blackouts: volunteer.blackouts ? [...volunteer.blackouts] : []
    });
    setNewBlackoutDate("");
    setNewBlackoutType("allDay");
    setNewBlackoutStartTime("08:00");
    setNewBlackoutEndTime("12:00");
    setIsModalOpen(true);
  };

  // Excluir Voluntário
  const handleDelete = (id, name) => {
    if (window.confirm(`Tem certeza que deseja excluir o voluntário "${name}"?`)) {
      const updated = volunteers.filter(v => v.id !== id);
      saveVolunteers(updated);
      setVolunteers(updated);
    }
  };

  // Lidar com campos simples do form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Lidar com Checkbox de Skills/Habilidades
  const handleSkillToggle = (ministryId, roleId) => {
    setFormData(prev => {
      const exists = prev.skills.some(
        s => s.ministryId === ministryId && s.roleId === roleId
      );
      
      let newSkills;
      if (exists) {
        newSkills = prev.skills.filter(
          s => !(s.ministryId === ministryId && s.roleId === roleId)
        );
      } else {
        newSkills = [...prev.skills, { ministryId, roleId }];
      }

      return { ...prev, skills: newSkills };
    });
  };

  // Adicionar data/horário de indisponibilidade
  const handleAddBlackout = () => {
    if (!newBlackoutDate) {
      alert("Por favor, selecione uma data!");
      return;
    }

    let blackoutEntry;
    if (newBlackoutType === "allDay") {
      blackoutEntry = { date: newBlackoutDate, allDay: true };
    } else {
      if (!newBlackoutStartTime || !newBlackoutEndTime) {
        alert("Por favor, insira o horário de início e fim!");
        return;
      }
      if (newBlackoutStartTime >= newBlackoutEndTime) {
        alert("O horário de início deve ser menor que o horário de fim!");
        return;
      }
      blackoutEntry = {
        date: newBlackoutDate,
        allDay: false,
        startTime: newBlackoutStartTime,
        endTime: newBlackoutEndTime
      };
    }

    // Verificar duplicações
    const isDuplicate = formData.blackouts.some(b => {
      const bDate = typeof b === "string" ? b : b.date;
      if (bDate !== newBlackoutDate) return false;
      
      if (newBlackoutType === "allDay") {
        return typeof b === "string" || b.allDay;
      } else {
        return b.startTime === newBlackoutStartTime && b.endTime === newBlackoutEndTime;
      }
    });

    if (isDuplicate) {
      alert("Este bloqueio de data/horário já está cadastrado!");
      return;
    }

    const sortBlackouts = (list) => {
      return [...list].sort((a, b) => {
        const dateA = typeof a === "string" ? a : a.date;
        const dateB = typeof b === "string" ? b : b.date;
        return dateA.localeCompare(dateB);
      });
    };

    setFormData(prev => ({
      ...prev,
      blackouts: sortBlackouts([...prev.blackouts, blackoutEntry])
    }));

    setNewBlackoutDate("");
  };

  // Remover indisponibilidade por index (evita problemas com referências de objetos)
  const handleRemoveBlackoutIndex = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      blackouts: prev.blackouts.filter((_, idx) => idx !== indexToRemove)
    }));
  };

  // Enviar formulário
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("O nome é obrigatório!");
      return;
    }

    let updatedVolunteers;

    if (editingId) {
      // Edição
      updatedVolunteers = volunteers.map(v => 
        v.id === editingId ? { ...v, ...formData } : v
      );
    } else {
      // Criação
      const newVol = {
        id: `v_${Date.now()}`,
        ...formData
      };
      updatedVolunteers = [...volunteers, newVol];
    }

    saveVolunteers(updatedVolunteers);
    setVolunteers(updatedVolunteers);
    setIsModalOpen(false);
  };

  // Helper para obter nome da função e ministério
  const getSkillLabel = (ministryId, roleId) => {
    const min = ministries.find(m => m.id === ministryId);
    if (!min) return roleId;
    const role = min.roles.find(r => r.id === roleId);
    return `${min.name} — ${role ? role.name : roleId}`;
  };

  return (
    <div className="view-transition">
      <div className="app-header">
        <div className="header-title-container">
          <h1>Membros & Voluntários</h1>
          <p>Gerencie quem serve, suas habilidades, limites de escala e datas de indisponibilidade.</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={16} /> Adicionar Voluntário
        </button>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="search-filter-bar">
        <div className="search-input-wrapper">
          <Search size={18} className="search-input-icon" />
          <input
            type="text"
            className="form-input"
            placeholder="Pesquisar por nome, e-mail ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", gap: "0.5rem" }}>
          <select
            className="form-select"
            value={selectedMinistryFilter}
            onChange={(e) => setSelectedMinistryFilter(e.target.value)}
          >
            <option value="all">Todos os Ministérios</option>
            {ministries.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Voluntários */}
      {filteredVolunteers.length > 0 ? (
        <div className="grid-cols-3">
          {filteredVolunteers.map(v => (
            <div key={v.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: 700, color: "var(--text-active)" }}>{v.name}</h3>
                  <span className="badge badge-info" style={{ marginTop: "0.4rem", fontSize: "0.75rem" }}>
                    Freq. Máxima: {v.maxMonthlyServices || 2}x / mês
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button className="btn btn-icon" onClick={() => handleOpenEditModal(v)} title="Editar">
                    <Edit2 size={14} />
                  </button>
                  <button className="btn btn-icon" style={{ color: "#f87171" }} onClick={() => handleDelete(v.id, v.name)} title="Excluir">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Detalhes de contato */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem", fontSize: "0.85rem", color: "var(--text-secondary)", borderTop: "1px solid var(--glass-border)", borderBottom: "1px solid var(--glass-border)", padding: "0.75rem 0" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Mail size={14} /> {v.email || "Sem e-mail"}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Phone size={14} /> {v.phone || "Sem telefone"}
                </span>
              </div>

              {/* Habilidades / Skills */}
              <div>
                <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Funções Habilitadas</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                  {v.skills && v.skills.length > 0 ? (
                    v.skills.map((skill, idx) => {
                      const min = ministries.find(m => m.id === skill.ministryId);
                      const role = min ? min.roles.find(r => r.id === skill.roleId) : null;
                      return (
                        <span key={idx} className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }}>
                          {role ? role.name : skill.roleId}
                        </span>
                      );
                    })
                  ) : (
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>Nenhuma função cadastrada</span>
                  )}
                </div>
              </div>

              {/* Datas de Bloqueio (Blackouts) */}
              {v.blackouts && v.blackouts.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.8rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "0.5rem", letterSpacing: "0.05em" }}>Ausências / Bloqueios 🚫</h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
                    {v.blackouts.map((blackout, idx) => {
                      const isString = typeof blackout === "string";
                      const date = isString ? blackout : blackout.date;
                      const label = isString || blackout.allDay 
                        ? new Date(date + "T00:00:00").toLocaleDateString("pt-BR")
                        : `${new Date(date + "T00:00:00").toLocaleDateString("pt-BR")} (${blackout.startTime}-${blackout.endTime})`;
                      return (
                        <span key={idx} className="badge badge-danger" style={{ fontSize: "0.7rem", padding: "0.2rem 0.5rem" }} title={isString || blackout.allDay ? "Dia Inteiro" : "Horário Específico"}>
                          {label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
          <User size={48} style={{ color: "var(--text-muted)", marginBottom: "1rem" }} />
          <h3>Nenhum voluntário encontrado</h3>
          <p style={{ marginTop: "0.25rem", color: "var(--text-muted)" }}>Tente ajustar os filtros de busca ou crie um novo voluntário.</p>
        </div>
      )}

      {/* MODAL EDITAR / CRIAR VOLUNTÁRIO */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h3>{editingId ? "Editar Voluntário" : "Novo Voluntário"}</h3>
              <button className="btn btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {/* 1. Dados Básicos */}
                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Nome Completo</label>
                    <input
                      type="text"
                      className="form-input"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Limite Mensal de Escalas</label>
                    <input
                      type="number"
                      className="form-input"
                      name="maxMonthlyServices"
                      min={1}
                      max={30}
                      value={formData.maxMonthlyServices}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">E-mail</label>
                    <input
                      type="email"
                      className="form-input"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Telefone (WhatsApp)</label>
                    <input
                      type="text"
                      className="form-input"
                      name="phone"
                      placeholder="(11) 99999-9999"
                      value={formData.phone}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>

                {/* 2. Seleção de Funções / Habilidades */}
                <div>
                  <h4 style={{ fontSize: "0.9375rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                    Habilitar Funções e Ministérios
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    {ministries.map(m => (
                      <div key={m.id} style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", padding: "1rem" }}>
                        <h5 style={{ color: m.color, fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                          {m.name}
                        </h5>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.75rem" }}>
                          {m.roles.map(role => {
                            const isChecked = formData.skills.some(
                              s => s.ministryId === m.id && s.roleId === role.id
                            );
                            return (
                              <label key={role.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}>
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleSkillToggle(m.id, role.id)}
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

                {/* 3. Ausências Temporárias (Blackouts) */}
                <div>
                  <h4 style={{ fontSize: "0.9375rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "0.5rem", marginBottom: "1rem" }}>
                    Indisponibilidades (Datas e Horários Específicos)
                  </h4>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                    Adicione datas ou horários específicos em que o voluntário viajou, está doente ou ocupado. O motor de escalas evitará agendá-lo nesse intervalo.
                  </p>
                  
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", background: "rgba(255,255,255,0.01)", border: "1px solid var(--glass-border)", padding: "1rem", borderRadius: "var(--radius-md)", marginBottom: "1rem" }}>
                    <div className="grid-cols-2" style={{ gap: "0.75rem" }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: "0.75rem" }}>Data da Ausência</label>
                        <input
                          type="date"
                          className="form-input"
                          value={newBlackoutDate}
                          onChange={(e) => setNewBlackoutDate(e.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label" style={{ fontSize: "0.75rem" }}>Tipo de Bloqueio</label>
                        <select
                          className="form-select"
                          value={newBlackoutType}
                          onChange={(e) => setNewBlackoutType(e.target.value)}
                        >
                          <option value="allDay">Dia Inteiro</option>
                          <option value="time">Horário Específico</option>
                        </select>
                      </div>
                    </div>

                    {newBlackoutType === "time" && (
                      <div className="grid-cols-2" style={{ gap: "0.75rem" }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.75rem" }}>Hora de Início</label>
                          <input
                            type="time"
                            className="form-input"
                            value={newBlackoutStartTime}
                            onChange={(e) => setNewBlackoutStartTime(e.target.value)}
                          />
                        </div>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label className="form-label" style={{ fontSize: "0.75rem" }}>Hora de Fim</label>
                          <input
                            type="time"
                            className="form-input"
                            value={newBlackoutEndTime}
                            onChange={(e) => setNewBlackoutEndTime(e.target.value)}
                          />
                        </div>
                      </div>
                    )}

                    <button type="button" className="btn btn-secondary" style={{ marginTop: "0.25rem", width: "100%" }} onClick={handleAddBlackout}>
                      <PlusCircle size={16} /> Adicionar Bloqueio
                    </button>
                  </div>

                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {formData.blackouts.length > 0 ? (
                      formData.blackouts.map((blackout, index) => {
                        const isString = typeof blackout === "string";
                        const date = isString ? blackout : blackout.date;
                        const label = isString || blackout.allDay
                          ? `${new Date(date + "T00:00:00").toLocaleDateString("pt-BR")} (Dia Inteiro)`
                          : `${new Date(date + "T00:00:00").toLocaleDateString("pt-BR")} (das ${blackout.startTime} às ${blackout.endTime})`;
                        return (
                          <span key={index} className="badge badge-danger" style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", padding: "0.3rem 0.6rem" }}>
                            {label}
                            <button type="button" style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0 }} onClick={() => handleRemoveBlackoutIndex(index)}>
                              <X size={12} />
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Nenhuma indisponibilidade registrada.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
