// -------------------------------------------------------------
// ESCALA VIEW - DESTAQUES & COMUNIDADE (GAMIFICATION & AWARDS)
// -------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
  Trophy,
  Music,
  Zap,
  Star,
  Users,
  Award,
  Sparkles,
  Flame,
  ThumbsUp,
  TrendingUp,
  Heart
} from "lucide-react";
import {
  getVolunteers,
  getServices,
  getAssignments,
  getMinistries
} from "../utils/storage";

export default function Comunidade() {
  const [volunteers, setVolunteers] = useState([]);
  const [services, setServices] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [ministries, setMinistries] = useState([]);

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

  // --- CÁLCULO 1: VOLUNTÁRIOS DO MÊS (Mais Escalas Confirmadas) ---
  const getTopVolunteers = () => {
    const counts = {};
    assignments.forEach(a => {
      if (a.status === "confirmed") {
        counts[a.volunteerId] = (counts[a.volunteerId] || 0) + 1;
      }
    });

    return volunteers
      .map(v => ({
        ...v,
        count: counts[v.id] || 0
      }))
      .filter(v => v.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3
  };

  // --- CÁLCULO 2: MÚSICAS MAIS TOCADAS ---
  const getTopSongs = () => {
    const counts = {};
    services.forEach(s => {
      if (s.songs && s.songs.length > 0) {
        s.songs.forEach(song => {
          const songKey = `${song.title} (${song.key || song.tone})`;
          counts[songKey] = (counts[songKey] || 0) + 1;
        });
      }
    });

    return Object.entries(counts)
      .map(([song, count]) => ({ song, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5
  };

  // --- CÁLCULO 3: SERVO MULTIUSO (Mais Skills/Funções Habilitadas) ---
  const getMostVersatile = () => {
    return [...volunteers]
      .filter(v => v.roles && v.roles.length > 0)
      .map(v => ({
        id: v.id,
        name: v.name,
        skillsCount: v.roles.length,
        email: v.email
      }))
      .sort((a, b) => b.skillsCount - a.skillsCount)
      .slice(0, 4); // Top 4
  };

  // --- CÁLCULO 4: RESPOSTA RELÂMPAGO (RSVP Simulado Rápido) ---
  const getFastestResponders = () => {
    // Simulamos um RSVP tempo com base no ID para consistência visual na simulação
    const responseTimes = {
      v1: { time: "4 min", desc: "Sempre alerta!" },
      v2: { time: "8 min", desc: "Luz reativa" },
      v3: { time: "11 min", desc: "Foco total" },
      v4: { time: "15 min", desc: "Super rápido" },
      v5: { time: "18 min", desc: "Prontidão de Ouro" }
    };

    return volunteers
      .map(v => ({
        id: v.id,
        name: v.name,
        time: responseTimes[v.id]?.time || `${Math.floor((v.name.length * 3.5) % 45) + 20} min`,
        desc: responseTimes[v.id]?.desc || "Resposta ágil"
      }))
      .slice(0, 4);
  };

  // --- CÁLCULO 5: EQUIPE DE OURO (Ministério com melhor preenchimento) ---
  const getBestMinistry = () => {
    const totalSlots = {};
    const filledSlots = {};

    services.forEach(s => {
      if (s.requiredRoles) {
        s.requiredRoles.forEach(r => {
          totalSlots[r.ministryId] = (totalSlots[r.ministryId] || 0) + 1;
        });
      }
    });

    assignments.forEach(a => {
      if (a.status === "confirmed") {
        filledSlots[a.ministryId] = (filledSlots[a.ministryId] || 0) + 1;
      }
    });

    let bestMin = null;
    let maxRate = -1;

    ministries.forEach(m => {
      const total = totalSlots[m.id] || 0;
      const filled = filledSlots[m.id] || 0;
      const rate = total > 0 ? Math.round((filled / total) * 100) : 0;

      if (total > 0 && rate > maxRate) {
        maxRate = rate;
        bestMin = { ...m, rate, total, filled };
      }
    });

    return bestMin;
  };

  const topVolunteers = getTopVolunteers();
  const topSongs = getTopSongs();
  const mostVersatile = getMostVersatile();
  const fastestResponders = getFastestResponders();
  const bestMinistry = getBestMinistry();

  // Configurações visuais do pódio de voluntários
  const podiumColors = [
    { border: "rgba(245, 158, 11, 0.4)", badge: "#f59e0b", height: "180px", title: "Voluntário do Mês (1º)", size: "1.15rem" },
    { border: "rgba(148, 163, 184, 0.4)", badge: "#94a3b8", height: "150px", title: "Destaque (2º)", size: "1rem" },
    { border: "rgba(180, 83, 9, 0.4)", badge: "#b45309", height: "130px", title: "Destaque (3º)", size: "0.95rem" }
  ];

  // Reordenar topVolunteers para o formato visual de pódio clássico: [2º, 1º, 3º]
  const getPodiumOrder = (list) => {
    if (list.length < 2) return list;
    if (list.length === 2) return [list[1], list[0]];
    return [list[1], list[0], list[2]];
  };

  const getPodiumSettings = (volId) => {
    const idx = topVolunteers.findIndex(v => v.id === volId);
    return podiumColors[idx] || podiumColors[2];
  };

  return (
    <div className="view-transition">
      <div className="app-header">
        <div className="header-title-container">
          <h1 style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Trophy style={{ color: "#f59e0b" }} /> Destaques & Comunidade
          </h1>
          <p>Celebração do engajamento dos membros, estatísticas de louvores e marcos de serviço de nossa comunidade.</p>
        </div>
      </div>

      <div className="grid-cols-12">
        
        {/* PÓDIO PRINCIPAL: VOLUNTÁRIOS DO MÊS */}
        <div className="card" style={{ gridColumn: "span 7", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Award style={{ color: "#f59e0b" }} /> Pódio de Voluntários do Mês
          </h3>

          {topVolunteers.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "space-between" }}>
              {/* O Pódio Gráfico */}
              <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: "1.5rem", padding: "1.5rem 0", borderBottom: "1px solid var(--glass-border)", marginBottom: "1.5rem" }}>
                {getPodiumOrder(topVolunteers).map(vol => {
                  const settings = getPodiumSettings(vol.id);
                  const isFirst = topVolunteers[0].id === vol.id;
                  
                  return (
                    <div
                      key={vol.id}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "140px",
                        transition: "var(--transition-normal)"
                      }}
                      className="podium-card"
                    >
                      {/* Avatar Simulado com Primeira Letra */}
                      <div
                        style={{
                          width: isFirst ? "76px" : "60px",
                          height: isFirst ? "76px" : "60px",
                          borderRadius: "50%",
                          background: `linear-gradient(135deg, ${settings.badge} 0%, rgba(255,255,255,0.05) 100%)`,
                          border: `2px solid ${settings.badge}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: isFirst ? "1.75rem" : "1.35rem",
                          fontWeight: 900,
                          color: "#fff",
                          boxShadow: isFirst ? "0 0 20px rgba(245, 158, 11, 0.3)" : "none",
                          marginBottom: "0.75rem",
                          position: "relative"
                        }}
                      >
                        {vol.name.charAt(0)}
                        {/* Coroa sobre o 1º lugar */}
                        {isFirst && (
                          <div style={{ position: "absolute", top: "-18px", color: "#f59e0b", transform: "rotate(-15deg)" }}>
                            <Trophy size={20} style={{ fill: "#f59e0b" }} />
                          </div>
                        )}
                      </div>

                      {/* Nome do Voluntário */}
                      <span style={{ fontWeight: 800, color: "var(--text-active)", fontSize: settings.size, textAlign: "center", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}>
                        {vol.name.split(" ")[0]} {vol.name.split(" ")[1] || ""}
                      </span>

                      {/* Info do Pódio */}
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.15rem", marginBottom: "0.75rem" }}>
                        {vol.count} cultos servidos
                      </span>

                      {/* Bloco Base do Pódio */}
                      <div
                        style={{
                          width: "100%",
                          height: settings.height,
                          background: "rgba(255,255,255,0.02)",
                          border: `1px solid ${settings.border}`,
                          borderBottom: "none",
                          borderRadius: "var(--radius-md) var(--radius-md) 0 0",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                          alignItems: "center",
                          padding: "1rem"
                        }}
                      >
                        <span style={{ fontSize: "1.75rem", fontWeight: 900, color: settings.badge }}>
                          {topVolunteers.indexOf(vol) + 1}º
                        </span>
                        <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.05em", textAlign: "center", marginTop: "0.25rem" }}>
                          {settings.badge === "#f59e0b" ? "Ouro" : settings.badge === "#94a3b8" ? "Prata" : "Bronze"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mensagem de Gratidão */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1rem", background: "rgba(245, 158, 11, 0.03)", border: "1px dashed rgba(245, 158, 11, 0.15)", borderRadius: "var(--radius-lg)" }}>
                <Sparkles size={24} style={{ color: "#f59e0b", flexShrink: 0 }} />
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, margin: 0 }}>
                  Agradecemos imensamente a dedicação de todos os servos da nossa igreja! A cooperação espontânea de cada um torna a realização de nossos cultos e eventos viável e abençoada.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "4rem", color: "var(--text-muted)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Nenhum voluntário confirmado neste mês ainda. As estatísticas aparecerão assim que as escalas forem respondidas!
            </div>
          )}
        </div>

        {/* RANKING: MÚSICAS MAIS TOCADAS (TOP HITS) */}
        <div className="card" style={{ gridColumn: "span 5" }}>
          <h3 style={{ fontSize: "1.25rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Music size={20} style={{ color: "#a78bfa" }} /> Top 5 Músicas Mais Tocadas
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {topSongs.length > 0 ? (
              topSongs.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.85rem 1rem",
                    background: "rgba(255, 255, 255, 0.01)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "var(--radius-md)",
                    position: "relative",
                    overflow: "hidden"
                  }}
                  className="song-ranking-item"
                >
                  {/* Pequeno efeito de barra de fundo baseada na popularidade */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: `${(item.count / topSongs[0].count) * 100}%`,
                      background: "rgba(167, 139, 250, 0.03)",
                      zIndex: 0,
                      pointerEvents: "none"
                    }}
                  />

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem", zIndex: 1 }}>
                    <span style={{ fontSize: "1.15rem", fontWeight: 800, color: idx === 0 ? "#f59e0b" : idx === 1 ? "#94a3b8" : "var(--text-muted)", width: "24px" }}>
                      #{idx + 1}
                    </span>
                    <div>
                      <h4 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-active)" }}>{item.song}</h4>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Setlist musical</span>
                    </div>
                  </div>

                  <span
                    className="badge badge-primary"
                    style={{
                      zIndex: 1,
                      background: "rgba(167, 139, 250, 0.15)",
                      border: "1px solid rgba(167, 139, 250, 0.3)",
                      color: "#c084fc",
                      fontSize: "0.75rem",
                      fontWeight: 700
                    }}
                  >
                    <Flame size={12} style={{ fill: "#c084fc", marginRight: "0.25rem" }} /> {item.count} vezes
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", border: "1px dashed var(--glass-border)", borderRadius: "var(--radius-md)" }}>
                🎵 Nenhum repertório planejado ou executado ainda.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid-cols-12" style={{ marginTop: "1.5rem" }}>
        
        {/* CARD: RESPOSTA RELÂMPAGO */}
        <div className="card" style={{ gridColumn: "span 4" }}>
          <h3 style={{ fontSize: "1.125rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={18} style={{ color: "var(--warning)" }} /> Respostas Relâmpago (RSVP)
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Voluntários dedicados que agilizam o planejamento confirmando suas escalas em tempo recorde no WhatsApp!
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {fastestResponders.slice(0, volunteers.length ? Math.min(volunteers.length, 4) : 0).map((r, idx) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-active)" }}>{r.name}</h4>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{r.desc}</span>
                </div>
                <span className="badge badge-warning" style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}>
                  ⚡ {r.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CARD: SERVO MULTIUSO (VERSATILIDADE) */}
        <div className="card" style={{ gridColumn: "span 4" }}>
          <h3 style={{ fontSize: "1.125rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Star size={18} style={{ color: "var(--primary)" }} /> Servos Mais Versáteis
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            Membros que apoiam em múltiplas frentes de atuação com talentos variados e diversas funções ativadas!
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {mostVersatile.slice(0, volunteers.length ? Math.min(volunteers.length, 4) : 0).map((item) => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", background: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.03)", borderRadius: "var(--radius-md)" }}>
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-active)" }}>{item.name}</h4>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-secondary)" }}>{item.email}</span>
                </div>
                <span className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem", fontWeight: 700 }}>
                  🌟 {item.skillsCount} funções
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CARD: MINISTERIO DESTAQUE (EQUIPE DE OURO) */}
        <div className="card" style={{ gridColumn: "span 4", display: "flex", flexDirection: "column" }}>
          <h3 style={{ fontSize: "1.125rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Users size={18} style={{ color: "var(--secondary)" }} /> Equipe de Ouro
          </h3>
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "1.25rem", lineHeight: 1.5 }}>
            O ministério com a melhor taxa de preenchimento de escalas e assiduidade dos voluntários neste período!
          </p>

          {bestMinistry ? (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "1.5rem 1rem", background: `rgba(${parseInt(bestMinistry.color.slice(1,3), 16) || 139}, ${parseInt(bestMinistry.color.slice(3,5), 16) || 92}, ${parseInt(bestMinistry.color.slice(5,7), 16) || 246}, 0.03)`, border: `1px solid ${bestMinistry.color}33`, borderRadius: "var(--radius-lg)", textAlign: "center", flex: 1 }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: `${bestMinistry.color}15`,
                  color: bestMinistry.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  marginBottom: "1rem"
                }}
              >
                🏆
              </div>

              <h4 style={{ fontSize: "1.15rem", fontWeight: 800, color: "var(--text-active)", marginBottom: "0.25rem" }}>
                {bestMinistry.name}
              </h4>
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Taxa de preenchimento excepcional
              </span>

              {/* Rosca ou barra de porcentagem */}
              <div style={{ width: "100%", background: "rgba(255,255,255,0.03)", height: "8px", borderRadius: "4px", overflow: "hidden", marginBottom: "0.5rem" }}>
                <div style={{ width: `${bestMinistry.rate}%`, background: bestMinistry.color, height: "100%", borderRadius: "4px" }} />
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", width: "100%", fontSize: "0.75rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                <span>{bestMinistry.rate}% Eficácia</span>
                <span>{bestMinistry.filled}/{bestMinistry.total} escalas</span>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)", flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              Nenhum dado de ministério calculado ainda.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
