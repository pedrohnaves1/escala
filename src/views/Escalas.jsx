// -------------------------------------------------------------
// ESCALA VIEW - GESTÃO DE ESCALAS (CORE)
// -------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Calendar,
  UserCheck,
  UserX,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
  Music,
  Share2,
  Copy,
  X,
  FileText,
  UserPlus,
  PlusCircle,
  ExternalLink
} from "lucide-react";
import {
  getServices,
  getVolunteers,
  getAssignments,
  saveAssignments,
  getMinistries,
  saveServices
} from "../utils/storage";
import {
  getRecommendedVolunteers,
  runAutoScaleForService,
  checkConflicts
} from "../utils/scheduler";

export default function Escalas() {
  const [services, setServices] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [ministries, setMinistries] = useState([]);

  // Culto selecionado atualmente
  const [selectedServiceId, setSelectedServiceId] = useState("");
  
  // Modals States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState(null); // { ministryId, roleId }
  const [recommendations, setRecommendations] = useState([]);

  // Modal WhatsApp State
  const [isWhatsappModalOpen, setIsWhatsappModalOpen] = useState(false);
  const [whatsappText, setWhatsappText] = useState("");

  // Modal Setlist/Musicas State
  const [newSong, setNewSong] = useState({ title: "", key: "", link: "" });

  // Votação de Repertório Democrática (SaaS Feature)
  const [polls, setPolls] = useState(() => {
    try {
      const stored = localStorage.getItem("escala_polls");
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      return {};
    }
  });

  const [simulatedVoterId, setSimulatedVoterId] = useState("");
  const [selectedPollSongs, setSelectedPollSongs] = useState([]);

  const savePolls = (newPolls) => {
    setPolls(newPolls);
    localStorage.setItem("escala_polls", JSON.stringify(newPolls));
  };

  const loadData = () => {
    const sList = getServices();
    const vList = getVolunteers();
    const aList = getAssignments();
    const mList = getMinistries();

    setServices(sList);
    setVolunteers(vList);
    setAssignments(aList);
    setMinistries(mList);

    // Se houver cultos e nenhum estiver selecionado, seleciona o primeiro
    if (sList.length > 0 && !selectedServiceId) {
      setSelectedServiceId(sList[0].id);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("escala-db-synced", loadData);
    return () => window.removeEventListener("escala-db-synced", loadData);
  }, []);

  const activeService = services.find(s => s.id === selectedServiceId);

  // --- CONTROLE DE ESCALAS ---

  // Abre modal de atribuição
  const handleOpenAssignModal = (ministryId, roleId) => {
    setActiveSlot({ ministryId, roleId });
    // Carregar sugestões ordenadas pelo algoritmo
    const recs = getRecommendedVolunteers(selectedServiceId, ministryId, roleId);
    setRecommendations(recs);
    setIsAssignModalOpen(true);
  };

  // Faz a atribuição de um voluntário a um cargo
  const handleAssignVolunteer = (volunteerId) => {
    if (!activeSlot || !selectedServiceId) return;

    // Remove qualquer agendamento existente para este cargo neste culto
    const filtered = assignments.filter(
      a => !(a.serviceId === selectedServiceId && a.ministryId === activeSlot.ministryId && a.roleId === activeSlot.roleId)
    );

    const newAssignObj = {
      serviceId: selectedServiceId,
      ministryId: activeSlot.ministryId,
      roleId: activeSlot.roleId,
      volunteerId: volunteerId,
      status: "pending" // Começa como pendente de confirmação
    };

    const updated = [...filtered, newAssignObj];
    saveAssignments(updated);
    setAssignments(updated);
    setIsAssignModalOpen(false);
    setActiveSlot(null);
  };

  // Desescalar / Esvaziar vaga
  const handleUnassignSlot = (ministryId, roleId) => {
    if (window.confirm("Deseja remover o voluntário deste cargo?")) {
      const updated = assignments.filter(
        a => !(a.serviceId === selectedServiceId && a.ministryId === ministryId && a.roleId === roleId)
      );
      saveAssignments(updated);
      setAssignments(updated);
    }
  };

  // Alterar Status de Confirmação (Toggles rápido)
  const handleToggleStatus = (ministryId, roleId, currentStatus) => {
    const statusCycle = { pending: "confirmed", confirmed: "declined", declined: "pending" };
    const nextStatus = statusCycle[currentStatus] || "pending";

    const updated = assignments.map(a => {
      if (a.serviceId === selectedServiceId && a.ministryId === ministryId && a.roleId === roleId) {
        return { ...a, status: nextStatus };
      }
      return a;
    });

    saveAssignments(updated);
    setAssignments(updated);
  };

  // ⚡ Executar Autoescala de 1-Clique
  const handleRunAutoScale = () => {
    if (!selectedServiceId) return;
    const result = runAutoScaleForService(selectedServiceId);
    
    if (result.success) {
      saveAssignments(result.newAssignments);
      setAssignments(result.newAssignments);
      alert(`⚡ Autoescala concluída! ${result.count} vaga(s) foram preenchidas inteligentemente.`);
    } else {
      alert(`Falha ao rodar autoescala: ${result.message}`);
    }
  };

  // --- REPERTÓRIO / SETLIST ---

  const handleAddSong = (e) => {
    e.preventDefault();
    if (!newSong.title.trim()) return;

    const newSongObj = {
      id: `song_${Date.now()}`,
      title: newSong.title.trim(),
      key: newSong.key.trim() || "N/A",
      link: newSong.link.trim()
    };

    const updatedServices = services.map(s => {
      if (s.id === selectedServiceId) {
        const currentSetlist = s.setlist || [];
        return {
          ...s,
          setlist: [...currentSetlist, newSongObj]
        };
      }
      return s;
    });

    saveServices(updatedServices);
    setServices(updatedServices);
    setNewSong({ title: "", key: "", link: "" });
  };

  const handleRemoveSong = (songId) => {
    if (window.confirm("Remover esta música do repertório deste culto?")) {
      const updatedServices = services.map(s => {
        if (s.id === selectedServiceId) {
          const currentSetlist = s.setlist || [];
          return {
            ...s,
            setlist: currentSetlist.filter(song => song.id !== songId)
          };
        }
        return s;
      });

      saveServices(updatedServices);
      setServices(updatedServices);
    }
  };

  // --- ENQUETE DE MÚSICAS (SETLIST POLL - SAAS FEATURE) ---

  const handleCreatePoll = () => {
    if (!selectedServiceId) return;
    
    const candidateSongs = [
      { id: "o1", title: "A Casa É Sua", key: "G", link: "https://www.cifraclub.com.br/casa-worship/a-casa-e-sua/", votes: [] },
      { id: "o2", title: "Bondade de Deus", key: "A", link: "https://www.cifraclub.com.br/isaias-saad/bondade-de-deus/", votes: [] },
      { id: "o3", title: "O Escudo", key: "Em", link: "https://www.cifraclub.com.br/grupo-logos/o-escudo/", votes: [] },
      { id: "o4", title: "Caminho no Deserto", key: "C", link: "https://www.cifraclub.com.br/soraya-moraes/caminho-no-deserto/", votes: [] },
      { id: "o5", title: "Eu Também (100 bilhões de vezes)", key: "F", link: "https://www.cifraclub.com.br/kemuel/eu-tambem-100-bilhoes-de-vezes/", votes: [] },
      { id: "o6", title: "Porque Ele Vive", key: "A", link: "https://www.cifraclub.com.br/harpa-crista/porque-ele-vive/", votes: [] }
    ];

    const newPolls = {
      ...polls,
      [selectedServiceId]: {
        status: "voting",
        targetCount: 3,
        options: candidateSongs
      }
    };

    savePolls(newPolls);
    alert(`🗳️ Enquete de Louvor aberta com sucesso!\n\nDisparamos mensagens automáticas no WhatsApp para os backing vocals e instrumentistas contendo o link exclusivo de votação de 1-Clique.`);
  };

  const handleVotePoll = (e) => {
    e.preventDefault();
    if (!selectedServiceId || !simulatedVoterId) return;

    const poll = polls[selectedServiceId];
    if (!poll) return;

    if (selectedPollSongs.length === 0) {
      alert("Por favor, selecione ao menos 1 música para votar!");
      return;
    }
    if (selectedPollSongs.length > poll.targetCount) {
      alert(`Você só pode selecionar até ${poll.targetCount} músicas!`);
      return;
    }

    const updatedOptions = poll.options.map(opt => {
      const filteredVotes = opt.votes.filter(vId => vId !== simulatedVoterId);
      
      if (selectedPollSongs.includes(opt.id)) {
        return { ...opt, votes: [...filteredVotes, simulatedVoterId] };
      }
      return { ...opt, votes: filteredVotes };
    });

    const newPolls = {
      ...polls,
      [selectedServiceId]: {
        ...poll,
        options: updatedOptions
      }
    };

    savePolls(newPolls);
    setSimulatedVoterId("");
    setSelectedPollSongs([]);
    alert("Voto registrado com sucesso!");
  };

  const handleClosePoll = () => {
    if (!selectedServiceId) return;

    const poll = polls[selectedServiceId];
    if (!poll) return;

    const sortedOptions = [...poll.options].sort((a, b) => b.votes.length - a.votes.length);
    const winningSongs = sortedOptions.slice(0, poll.targetCount).map(opt => ({
      id: opt.id,
      title: opt.title,
      key: opt.key,
      link: opt.link
    }));

    const updatedServices = services.map(s => {
      if (s.id === selectedServiceId) {
        return {
          ...s,
          setlist: winningSongs
        };
      }
      return s;
    });

    saveServices(updatedServices);
    setServices(updatedServices);

    const newPolls = {
      ...polls,
      [selectedServiceId]: {
        ...poll,
        status: "closed"
      }
    };
    savePolls(newPolls);

    let victoryMessage = `*🎵 REPERTÓRIO DE LOUVOR CONFIRMADO! VOTAÇÃO ENCERRADA!*\n\nA enquete foi finalizada e as músicas mais votadas pela equipe para o culto *${activeService?.title}* são:\n\n`;
    winningSongs.forEach((song, idx) => {
      victoryMessage += `${idx + 1}. *${song.title}* [Tom: ${song.key}]\n`;
      if (song.link) {
        victoryMessage += `   🔗 Link: ${song.link}\n`;
      }
    });
    victoryMessage += `\nPreparem seus instrumentos e vozes! 🎸🎤`;

    setWhatsappText(victoryMessage);
    setIsWhatsappModalOpen(true);
  };

  // --- GERADOR DE WHATSAPP ---

  const handleGenerateWhatsappText = () => {
    if (!activeService) return;

    let text = `*⛪ ESCALA DE SERVIÇO: ${activeService.title.toUpperCase()}*\n`;
    text += `📅 *Data:* ${new Date(activeService.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n`;
    text += `⏰ *Horário:* ${activeService.time}\n`;
    if (activeService.description) {
      text += `📝 *Avisos:* ${activeService.description}\n`;
    }
    text += `\n---------------------------------\n\n`;

    // Agrupar escalas por Ministério
    ministries.forEach(m => {
      // Filtrar apenas funções que são requeridas neste culto
      const requiredRolesInMin = activeService.requiredRoles.filter(r => r.ministryId === m.id);
      
      if (requiredRolesInMin.length > 0) {
        text += `*🔹 ${m.name.toUpperCase()}*\n`;
        
        requiredRolesInMin.forEach(req => {
          const role = m.roles.find(r => r.id === req.roleId);
          const roleName = role ? role.name : req.roleId;

          const assign = assignments.find(
            a => a.serviceId === selectedServiceId && a.ministryId === m.id && a.roleId === req.roleId
          );

          if (assign) {
            const vol = volunteers.find(v => v.id === assign.volunteerId);
            const volName = vol ? vol.name : "Desconhecido";
            const statusEmoji = assign.status === "confirmed" ? "✅" : assign.status === "pending" ? "⏳" : "❌";
            text += `• *${roleName}:* ${volName} (${statusEmoji})\n`;
          } else {
            text += `• *${roleName}:* _[VAGA PENDENTE]_\n`;
          }
        });
        text += `\n`;
      }
    });

    // Anexar Setlist se houver músicas e o Louvor estiver ativo
    const hasLouvor = activeService.requiredRoles.some(r => r.ministryId === "louvor");
    if (hasLouvor && activeService.setlist && activeService.setlist.length > 0) {
      text += `---------------------------------\n`;
      text += `*🎵 REPERTÓRIO DE LOUVOR (SETLIST)*\n\n`;
      activeService.setlist.forEach((song, idx) => {
        text += `${idx + 1}. *${song.title}* [Tom: ${song.key}]\n`;
        if (song.link) {
          text += `   🔗 Link: ${song.link}\n`;
        }
      });
      text += `\n`;
    }

    text += `⚠️ *Por favor, responda confirmando (✅) ou justificando a ausência (❌) o quanto antes!*`;

    setWhatsappText(text);
    setIsWhatsappModalOpen(true);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(whatsappText);
    alert("Texto copiado para a área de transferência! Cole diretamente no WhatsApp.");
    setIsWhatsappModalOpen(false);
  };

  // --- HELPERS ---

  const getVolunteerDetails = (id) => {
    return volunteers.find(v => v.id === id) || { name: "Desconhecido" };
  };

  const getRoleName = (ministryId, roleId) => {
    const min = ministries.find(m => m.id === ministryId);
    if (!min) return roleId;
    const role = min.roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  // Calcula a taxa de preenchimento do culto ativo
  const getServiceFillStats = (service) => {
    if (!service || !service.requiredRoles) return { total: 0, filled: 0, percent: 0 };
    const total = service.requiredRoles.length;
    const filled = assignments.filter(a => a.serviceId === service.id).length;
    const percent = total > 0 ? Math.round((filled / total) * 100) : 0;
    return { total, filled, percent };
  };

  return (
    <div className="view-transition">
      <div className="app-header">
        <div className="header-title-container">
          <h1>Gestão de Escalas</h1>
          <p>Selecione um culto para escalar voluntários, gerenciar repertórios, checar conflitos e compartilhar via WhatsApp.</p>
        </div>
      </div>

      <div className="grid-cols-12" style={{ alignItems: "flex-start" }}>
        
        {/* Painel Esquerdo: Lista de Cultos Selecionáveis */}
        <div style={{ gridColumn: "span 4", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "1.125rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Cultos Disponíveis</h3>
          {services.map(s => {
            const isSelected = s.id === selectedServiceId;
            const stats = getServiceFillStats(s);

            return (
              <div
                key={s.id}
                onClick={() => setSelectedServiceId(s.id)}
                className="card"
                style={{
                  padding: "1rem",
                  cursor: "pointer",
                  borderLeft: isSelected ? "4px solid var(--primary)" : "1px solid var(--glass-border)",
                  background: isSelected ? "var(--glass-bg-hover)" : "var(--glass-bg)",
                  transition: "all var(--transition-fast)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: isSelected ? "var(--text-active)" : "var(--text-primary)" }}>{s.title}</h4>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "0.25rem", marginTop: "0.25rem" }}>
                      📅 {new Date(s.date + "T00:00:00").toLocaleDateString("pt-BR")} | ⏰ {s.time}
                    </span>
                  </div>
                  <span className={`badge ${stats.percent === 100 ? "badge-success" : stats.percent > 0 ? "badge-warning" : "badge-danger"}`} style={{ fontSize: "0.7rem" }}>
                    {stats.percent}%
                  </span>
                </div>
                
                {/* Mini Barra de Progresso */}
                <div style={{ width: "100%", height: "4px", background: "rgba(255,255,255,0.05)", borderRadius: "2px", marginTop: "0.75rem", overflow: "hidden" }}>
                  <div style={{ width: `${stats.percent}%`, height: "100%", background: stats.percent === 100 ? "var(--secondary)" : "var(--primary)", transition: "width 0.3s ease" }}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Painel Direito: Escala e repertório do culto selecionado */}
        <div style={{ gridColumn: "span 8", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {activeService ? (
            <div>
              
              {/* Card Resumo do Culto Ativo */}
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
                  <div>
                    <h2 style={{ fontSize: "1.5rem", color: "var(--text-active)" }}>{activeService.title}</h2>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginTop: "0.25rem" }}>
                      📅 {new Date(activeService.date + "T00:00:00").toLocaleDateString("pt-BR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} • ⏰ {activeService.time}
                    </p>
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <button className="btn btn-secondary" onClick={handleGenerateWhatsappText}>
                      <Share2 size={16} /> WhatsApp
                    </button>
                    <button className="btn btn-primary" onClick={handleRunAutoScale} title="Escalar automaticamente as vagas em aberto">
                      <Sparkles size={16} /> Autoescala
                    </button>
                  </div>
                </div>
                {activeService.description && (
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", borderLeft: "2px solid var(--glass-border)", paddingLeft: "0.75rem", fontStyle: "italic" }}>
                    {activeService.description}
                  </p>
                )}
              </div>

              {/* Matriz / Tabela de Escalas */}
              <div className="card" style={{ marginBottom: "1.5rem" }}>
                <h3 style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>Quadro de Escalas</h3>
                
                {activeService.requiredRoles && activeService.requiredRoles.length > 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    
                    {activeService.requiredRoles.map((req, idx) => {
                      const assign = assignments.find(
                        a => a.serviceId === activeService.id && a.ministryId === req.ministryId && a.roleId === req.roleId
                      );
                      const isFilled = !!assign;
                      
                      // Checar conflitos reais (se estiver escalado)
                      const conflicts = isFilled ? checkConflicts(assign.volunteerId, activeService.id) : null;
                      const hasConf = conflicts ? conflicts.doubleBooked || conflicts.blackoutConflict : false;

                      return (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", padding: "0.75rem 1rem", background: isFilled ? "rgba(255, 255, 255, 0.01)" : "rgba(239, 68, 68, 0.02)", border: isFilled ? "1px solid var(--glass-border)" : "1px dashed rgba(239, 68, 68, 0.2)", borderRadius: "var(--radius-md)" }}>
                          
                          {/* Coluna 1: Nome da Função & Ministério */}
                          <div>
                            <span style={{ fontSize: "0.9375rem", fontWeight: 600 }}>
                              {getRoleName(req.ministryId, req.roleId)}
                            </span>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                              {ministries.find(m => m.id === req.ministryId)?.name}
                            </div>
                          </div>

                          {/* Coluna 2: Voluntário Escalado & Status */}
                          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            {isFilled ? (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                
                                {/* Alertas visuais de conflito em escalas salvas */}
                                {hasConf && (
                                  <span title="Conflito de agendamento ou indisponibilidade detectado!" style={{ color: "#ef4444", animation: "pulse-slow 1.5s infinite" }}>
                                    <AlertTriangle size={16} />
                                  </span>
                                )}

                                <span style={{ fontSize: "0.9375rem", fontWeight: 500 }}>
                                  {getVolunteerDetails(assign.volunteerId).name}
                                </span>

                                {/* Selector de Status rápido (Pendente / Confirmado / Recusado) */}
                                <button
                                  className={`btn ${assign.status === "confirmed" ? "btn-success" : assign.status === "pending" ? "btn-warning" : "btn-danger"}`}
                                  style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem", borderRadius: "9999px" }}
                                  onClick={() => handleToggleStatus(req.ministryId, req.roleId, assign.status)}
                                  title="Clique para alternar o status de confirmação"
                                >
                                  {assign.status === "confirmed" ? "Confirmado" : assign.status === "pending" ? "Pendente" : "Recusado"}
                                </button>

                                {/* Desescalar voluntário */}
                                <button className="btn btn-icon" style={{ padding: "0.25rem", color: "#ef4444" }} onClick={() => handleUnassignSlot(req.ministryId, req.roleId)} title="Remover escala">
                                  <UserX size={14} />
                                </button>
                              </div>
                            ) : (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <span className="badge badge-danger" style={{ fontSize: "0.75rem" }}>Vaga Aberta</span>
                                <button className="btn btn-secondary" style={{ padding: "0.35rem 0.75rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.25rem" }} onClick={() => handleOpenAssignModal(req.ministryId, req.roleId)}>
                                  <UserPlus size={12} /> Escalar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "1.5rem" }}>Não há cargos planejados para este culto. Vá na aba "Cultos" para configurar.</p>
                )}
              </div>

              {/* Card de Setlist / Repertório (Apenas se o Louvor fizer parte deste culto) */}
              {activeService.requiredRoles && activeService.requiredRoles.some(r => r.ministryId === "louvor") && (
                <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                  
                  {/* CARD DE VOTAÇÃO DEMOCRÁTICA (SAAS ENQUETE) */}
                  <div className="card" style={{ background: "linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 241, 0.02) 100%)", border: "1px solid rgba(139, 92, 246, 0.25)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3 style={{ fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Sparkles size={18} style={{ color: "#c084fc" }} /> 🗳️ Votação de Repertório Democrática
                      </h3>
                      <span className="badge badge-info" style={{ fontSize: "0.7rem" }}>SaaS Premium</span>
                    </div>

                    {!polls[selectedServiceId] || polls[selectedServiceId].status === "closed" ? (
                      <div style={{ textAlign: "center", padding: "1rem" }}>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                          O Vocal Principal pode disponibilizar 6 opções de músicas e disparar uma votação para a equipe (backing vocals e músicos) escolherem as {polls[selectedServiceId]?.targetCount || 3} mais votadas para o culto.
                        </p>
                        <button type="button" className="btn btn-primary" onClick={handleCreatePoll}>
                          ⚡ Abrir Enquete de Repertório (WhatsApp)
                        </button>
                      </div>
                    ) : (
                      <div>
                        {/* Enquete Ativa */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem", background: "rgba(255,255,255,0.02)", padding: "0.5rem 0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid rgba(255,255,255,0.04)" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#a7f3d0" }}>🗳️ VOTAÇÃO ATIVA: Escolher {polls[selectedServiceId].targetCount} de 6 músicas</span>
                          <button className="btn btn-danger" style={{ padding: "0.25rem 0.625rem", fontSize: "0.75rem" }} onClick={handleClosePoll}>
                            🔒 Fechar Votação e Confirmar Setlist
                          </button>
                        </div>

                        {/* Listagem das músicas candidatas com barra de votos */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
                          {polls[selectedServiceId].options.map((opt) => {
                            const votersCount = opt.votes.length;
                            const totalVotesCast = polls[selectedServiceId].options.reduce((a, o) => a + o.votes.length, 0);
                            const percentage = totalVotesCast > 0 ? Math.round((votersCount / totalVotesCast) * 100) : 0;

                            return (
                              <div key={opt.id} style={{ position: "relative", overflow: "hidden", background: "rgba(0,0,0,0.15)", border: "1px solid var(--glass-border)", padding: "0.75rem 1rem", borderRadius: "var(--radius-md)" }}>
                                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${percentage}%`, background: "rgba(139, 92, 246, 0.1)", transition: "width 0.4s ease" }}></div>

                                <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{opt.title}</span>
                                    <span className="badge badge-primary" style={{ fontSize: "0.65rem" }}>Tom: {opt.key}</span>
                                  </div>
                                  <span className="badge badge-success" style={{ fontSize: "0.7rem", fontWeight: 700 }}>
                                    {votersCount} voto(s) ({percentage}%)
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Simulador de Votação da Equipe */}
                        <div style={{ borderTop: "1px dashed var(--glass-border)", paddingTop: "1rem" }}>
                          <h4 style={{ fontSize: "0.85rem", color: "#c084fc", marginBottom: "0.75rem", fontWeight: 700 }}>
                            ⚡ Simulador de Votos do Backing Vocal / Músicos
                          </h4>
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                            Simule a votação de um voluntário escalado para este culto que recebeu a notificação no WhatsApp:
                          </p>

                          <form onSubmit={handleVotePoll}>
                            <div className="form-group" style={{ marginBottom: "1rem" }}>
                              <label className="form-label" style={{ fontSize: "0.75rem" }}>Escolher Integrante Escalado</label>
                              <select
                                className="form-select"
                                value={simulatedVoterId}
                                onChange={(e) => {
                                  setSimulatedVoterId(e.target.value);
                                  setSelectedPollSongs([]);
                                }}
                                style={{ fontSize: "0.85rem", padding: "0.5rem 0.75rem" }}
                              >
                                <option value="">Selecione o Integrante...</option>
                                {assignments
                                  .filter(a => a.serviceId === selectedServiceId && a.ministryId === "louvor" && (a.roleId === "vocal" || a.roleId === "vocalback" || a.roleId === "violao" || a.roleId === "teclado"))
                                  .map(a => {
                                    const vol = volunteers.find(v => v.id === a.volunteerId);
                                    return vol ? (
                                      <option key={vol.id} value={vol.id}>
                                        {vol.name} ({a.roleId === "vocal" ? "Vocal Principal" : a.roleId === "vocalback" ? "Vocal Back" : a.roleId === "violao" ? "Violão" : "Teclado"})
                                      </option>
                                    ) : null;
                                  })
                                  .filter(Boolean)}
                              </select>
                            </div>

                            {simulatedVoterId && (
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.25rem", background: "rgba(0,0,0,0.1)", padding: "0.75rem", borderRadius: "var(--radius-md)", border: "1px solid var(--glass-border)" }}>
                                <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.25rem", display: "block" }}>
                                  Selecione as {polls[selectedServiceId].targetCount} músicas favoritas:
                                </span>
                                {polls[selectedServiceId].options.map(opt => {
                                  const isChecked = selectedPollSongs.includes(opt.id);
                                  return (
                                    <label key={opt.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", cursor: "pointer", userSelect: "none" }}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        disabled={!isChecked && selectedPollSongs.length >= polls[selectedServiceId].targetCount}
                                        onChange={() => {
                                          if (isChecked) {
                                            setSelectedPollSongs(prev => prev.filter(id => id !== opt.id));
                                          } else {
                                            if (selectedPollSongs.length < polls[selectedServiceId].targetCount) {
                                              setSelectedPollSongs(prev => [...prev, opt.id]);
                                            }
                                          }
                                        }}
                                        style={{ width: "14px", height: "14px", accentColor: "var(--primary)" }}
                                      />
                                      <span>{opt.title} <strong>({opt.key})</strong></span>
                                    </label>
                                  );
                                })}

                                <button type="submit" className="btn btn-secondary" style={{ padding: "0.45rem 1rem", fontSize: "0.8rem", marginTop: "0.5rem", width: "100%" }}>
                                  Enviar Voto do Integrante
                                </button>
                              </div>
                            )}
                          </form>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* REPERTÓRIO CONFIRMADO MANUAL (O CARD ORIGINAL) */}
                  <div className="card">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                      <h3 style={{ fontSize: "1.125rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <Music size={18} style={{ color: "var(--primary)" }} /> Repertório Confirmado do Culto (Setlist)
                      </h3>
                    </div>

                    {/* Formulário para Adicionar Música */}
                    <form onSubmit={handleAddSong} style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nome da música..."
                        value={newSong.title}
                        onChange={(e) => setNewSong(prev => ({ ...prev, title: e.target.value }))}
                        style={{ flex: 2, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                        required
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Tom (ex: G)..."
                        value={newSong.key}
                        onChange={(e) => setNewSong(prev => ({ ...prev, key: e.target.value }))}
                        style={{ flex: 1, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                      />
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Link (YouTube / Cifra)..."
                        value={newSong.link}
                        onChange={(e) => setNewSong(prev => ({ ...prev, link: e.target.value }))}
                        style={{ flex: 2, padding: "0.5rem 0.75rem", fontSize: "0.85rem" }}
                      />
                      <button type="submit" className="btn btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                        <Plus size={14} /> Adicionar
                      </button>
                    </form>

                    {/* Listagem do Repertório */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {activeService.setlist && activeService.setlist.length > 0 ? (
                        activeService.setlist.map((song, idx) => (
                          <div key={song.id || idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.5rem 0.75rem", background: "rgba(255,255,255,0.01)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-sm)" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 700 }}>{idx + 1}.</span>
                              <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{song.title}</span>
                              <span className="badge badge-primary" style={{ fontSize: "0.7rem" }}>Tom: {song.key}</span>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {song.link && (
                                <a href={song.link} target="_blank" rel="noopener noreferrer" className="btn btn-icon" style={{ padding: "0.25rem", color: "var(--info)" }} title="Acessar cifra/música">
                                  <ExternalLink size={14} />
                                </a>
                              )}
                              <button className="btn btn-icon" style={{ padding: "0.25rem", color: "#ef4444" }} onClick={() => handleRemoveSong(song.id)} title="Remover música">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", display: "block", padding: "1rem" }}>
                          Nenhuma música no setlist deste culto. Use a enquete de votação ou adicione uma manualmente acima!
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-secondary)" }}>
              <h3>Selecione um culto para gerenciar</h3>
              <p style={{ marginTop: "0.25rem", color: "var(--text-muted)" }}>Escolha uma das opções no menu à esquerda.</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL DE ATRIBUIÇÃO INTELIGENTE (ESCALAR MEMBRO) */}
      {isAssignModalOpen && activeSlot && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "1.15rem" }}>Escalar Voluntário Inteligente</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", marginTop: "0.15rem" }}>
                  Função: *{getRoleName(activeSlot.ministryId, activeSlot.roleId)}* no culto *{activeService?.title}*
                </p>
              </div>
              <button className="btn btn-icon" onClick={() => setIsAssignModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                Abaixo estão listados todos os voluntários habilitados para esta função, classificados de forma inteligente para evitar sobrecarga, duplo agendamento e ausências registradas.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "400px", overflowY: "auto", paddingRight: "0.25rem" }}>
                {recommendations.length > 0 ? (
                  recommendations.map((rec, idx) => {
                    const vol = rec.volunteer;
                    const hasConf = rec.conflicts.hasConflicts;
                    const doubleBooked = rec.conflicts.doubleBooked;
                    const blackoutConflict = rec.conflicts.blackoutConflict;
                    const limitExceeded = rec.conflicts.limitExceeded;

                    // Tag de recomendação (se score for muito baixo e sem conflitos, é o ideal!)
                    const isPerfectFit = rec.score < 50 && !hasConf;

                    return (
                      <div
                        key={vol.id}
                        className="card"
                        style={{
                          padding: "0.85rem 1.25rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: blackoutConflict || doubleBooked ? "rgba(239, 68, 68, 0.03)" : "var(--glass-bg)",
                          border: isPerfectFit ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid var(--glass-border)",
                          opacity: blackoutConflict ? 0.6 : 1
                        }}
                      >
                        {/* Coluna 1: Nome do voluntário e status */}
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <h4 style={{ fontWeight: 700, fontSize: "0.9375rem" }}>{vol.name}</h4>
                            {isPerfectFit && (
                              <span className="badge badge-success" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>
                                ⭐ Sugestão Ideal
                              </span>
                            )}
                          </div>
                          
                          <div style={{ display: "flex", gap: "1rem", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                            <span>Escalas este mês: <strong>{rec.monthlyAssignments} / {rec.conflicts.maxCount}</strong></span>
                            <span>Total Geral: {rec.totalAssignments}</span>
                          </div>

                          {/* Alertas visuais e claros de conflito */}
                          {hasConf && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.5rem" }}>
                              {doubleBooked && (
                                <span className="badge badge-danger" style={{ fontSize: "0.65rem" }}>
                                  ⚠️ Já Escalado Neste Culto (Duplo Agendamento)
                                </span>
                              )}
                              {blackoutConflict && (
                                <span className="badge badge-danger" style={{ fontSize: "0.65rem" }}>
                                  🚫 Indisponível (Ausência Declarada)
                                </span>
                              )}
                              {limitExceeded && (
                                <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>
                                  ⚠️ Frequência Máxima Excedida
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Coluna 2: Botão para Escalar */}
                        <button
                          className={`btn ${blackoutConflict ? "btn-secondary" : isPerfectFit ? "btn-success" : "btn-primary"}`}
                          disabled={blackoutConflict} // Bloqueia escalamento se estiver em férias/bloqueio
                          onClick={() => handleAssignVolunteer(vol.id)}
                          style={{ padding: "0.45rem 1rem", fontSize: "0.8rem" }}
                        >
                          {blackoutConflict ? "Bloqueado" : "Escalar"}
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem", padding: "2rem" }}>
                    Nenhum voluntário habilitado para esta função foi encontrado no sistema. Adicione esta habilidade a um membro no menu "Membros".
                  </p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsAssignModalOpen(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL COMPARTILHAR WHATSAPP */}
      {isWhatsappModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Visualização e Cópia (WhatsApp)</h3>
              <button className="btn btn-icon" onClick={() => setIsWhatsappModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Abaixo está a mensagem estruturada com emojis para copiar e colar no grupo oficial do WhatsApp da igreja:
              </p>

              {/* Caixa do texto a ser copiado */}
              <div style={{ background: "rgba(0,0,0,0.2)", border: "1px solid var(--glass-border)", borderRadius: "var(--radius-md)", padding: "1rem", whiteSpace: "pre-wrap", maxHeight: "300px", overflowY: "auto", fontSize: "0.85rem", fontFamily: "monospace", color: "#a7f3d0" }}>
                {whatsappText}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setIsWhatsappModalOpen(false)}>
                Fechar
              </button>
              <button className="btn btn-primary" onClick={handleCopyToClipboard}>
                <Copy size={16} /> Copiar Texto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
