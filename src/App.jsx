import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Sparkles,
  Heart,
  Crown,
  Building2
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

  useEffect(() => {
    // Inicializar o LocalStorage com os dados iniciais realistas
    initializeStorage();
  }, []);

  return (
    <div className="app-container">
      {/* SIDEBAR RESPONSIVA */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Sparkles className="sidebar-logo-icon" size={24} />
          <span>Escala Igrejas</span>
        </div>

        <nav className="sidebar-nav">
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
            <span>Estrutura</span>
          </button>

          <button
            className={`nav-item ${activeTab === "orgadmin" ? "active" : ""}`}
            onClick={() => setActiveTab("orgadmin")}
          >
            <Building2 size={20} />
            <span>Matriz</span>
          </button>

          <button
            className={`nav-item ${activeTab === "superadmin" ? "active" : ""}`}
            onClick={() => setActiveTab("superadmin")}
          >
            <Crown size={20} />
            <span>SaaS Admin</span>
          </button>
        </nav>

        <footer className="sidebar-footer">
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
        {activeTab === "dashboard" && <Dashboard setActiveTab={setActiveTab} />}
        {activeTab === "escalas" && <Escalas />}
        {activeTab === "voluntarios" && <Voluntarios />}
        {activeTab === "cultos" && <Cultos />}
        {activeTab === "orgadmin" && <OrgAdmin />}
        {activeTab === "superadmin" && <SuperAdmin />}
      </main>
    </div>
  );
}

export default App;
