import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Sparkles,
  Heart,
  Crown,
  Building2,
  UserCheck
} from "lucide-react";

// Views
import Dashboard from "./views/Dashboard";
import Escalas from "./views/Escalas";
import Voluntarios from "./views/Voluntarios";
import Cultos from "./views/Cultos";
import SuperAdmin from "./views/SuperAdmin";
import OrgAdmin from "./views/OrgAdmin";

// Storage
import { initializeStorage } from "./utils/storage";

function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [userRole, setUserRole] = useState("Líder de Sede");

  useEffect(() => {
    // Inicializar o LocalStorage com os dados iniciais realistas
    initializeStorage();
  }, []);

  const handleRoleChange = (role) => {
    setUserRole(role);
    if (role === "Super Admin") {
      setActiveTab("superadmin");
    } else if (role === "Administrador da Matriz") {
      setActiveTab("orgadmin");
    } else {
      setActiveTab("dashboard");
    }
  };

  return (
    <div className="app-container">
      {/* SIDEBAR RESPONSIVA */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Sparkles className="sidebar-logo-icon" size={24} />
          <span>Escala Igrejas</span>
        </div>

        <nav className="sidebar-nav">
          {userRole === "Líder de Sede" ? (
            <>
              <button
                className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutDashboard size={20} />
                <span>Painel Sede</span>
              </button>
              
              <button
                className={`nav-item ${activeTab === "escalas" ? "active" : ""}`}
                onClick={() => setActiveTab("escalas")}
              >
                <Calendar size={20} />
                <span>Escalas</span>
              </button>
              
              <button
                className={`nav-item ${activeTab === "voluntarios" ? "active" : ""}`}
                onClick={() => setActiveTab("voluntarios")}
              >
                <Users size={20} />
                <span>Membros</span>
              </button>
              
              <button
                className={`nav-item ${activeTab === "cultos" ? "active" : ""}`}
                onClick={() => setActiveTab("cultos")}
              >
                <Settings size={20} />
                <span>Estrutura / Cultos</span>
              </button>
            </>
          ) : userRole === "Administrador da Matriz" ? (
            <button
              className="nav-item active"
              onClick={() => setActiveTab("orgadmin")}
            >
              <Building2 size={20} />
              <span>Painel da Matriz</span>
            </button>
          ) : (
            <button
              className="nav-item active"
              onClick={() => setActiveTab("superadmin")}
            >
              <Crown size={20} />
              <span>Painel Super Admin</span>
            </button>
          )}
        </nav>

        <footer className="sidebar-footer">
          {/* SELETOR DE PAPEL SAAS (SIMULADOR) */}
          <div style={{ marginBottom: "1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
              Simular Nível de Acesso
            </span>
            <div style={{ position: "relative" }}>
              <select
                value={userRole}
                onChange={(e) => handleRoleChange(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.6rem 2.2rem 0.6rem 0.8rem",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid var(--glass-border)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  outline: "none",
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  transition: "var(--transition-fast)"
                }}
                className="role-selector-select"
              >
                <option value="Líder de Sede" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                  Líder de Sede (Local)
                </option>
                <option value="Administrador da Matriz" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                  Administrador da Matriz
                </option>
                <option value="Super Admin" style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}>
                  Super Admin (SaaS)
                </option>
              </select>
              {/* Premium icon overlay in select */}
              <div style={{ position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--primary)", display: "flex", alignItems: "center" }}>
                {userRole === "Super Admin" ? <Crown size={14} /> : userRole === "Administrador da Matriz" ? <Building2 size={14} /> : <UserCheck size={14} />}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)", justifyContent: "center" }}>
            <span>Feito com</span>
            <Heart size={12} style={{ color: "#ef4444", fill: "#ef4444" }} />
            <span>para Igrejas</span>
          </div>
          <div style={{ textAlign: "center", fontSize: "0.65rem", color: "var(--text-muted)" }}>
            Versão v1.0.0 (SaaS Multi-Tenant)
          </div>
        </footer>
      </aside>

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="main-content">
        {userRole === "Super Admin" && <SuperAdmin />}
        {userRole === "Administrador da Matriz" && <OrgAdmin />}
        {userRole === "Líder de Sede" && (
          <>
            {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
            {activeTab === "escalas" && <Escalas />}
            {activeTab === "voluntarios" && <Voluntarios />}
            {activeTab === "cultos" && <Cultos />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
