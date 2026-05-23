// -------------------------------------------------------------
// ESCALA STORAGE UTILITIES - DUAL-ADAPTER LOCALSTORAGE & SUPABASE
// -------------------------------------------------------------

import {
  initialMinistries,
  initialVolunteers,
  initialServices,
  initialAssignments
} from "./mockData";
import { supabase, isSupabaseConfigured } from "./supabaseClient";

const KEYS = {
  MINISTRIES: "escala_ministries",
  VOLUNTEERS: "escala_volunteers",
  SERVICES: "escala_services",
  ASSIGNMENTS: "escala_assignments"
};

// Funções Genéricas de Leitura e Escrita do Cache Local
const readKey = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Erro ao ler chave ${key} do LocalStorage`, error);
    return defaultValue;
  }
};

const writeKey = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Erro ao salvar chave ${key} no LocalStorage`, error);
    return false;
  }
};

// Inicializa o banco de dados no LocalStorage caso esteja vazio
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.MINISTRIES)) {
    localStorage.setItem(KEYS.MINISTRIES, JSON.stringify(initialMinistries));
  } else {
    // Migração dinâmica: garante que as atualizações do sistema existam no LocalStorage
    try {
      const stored = JSON.parse(localStorage.getItem(KEYS.MINISTRIES));
      let modified = false;

      // 1. Migração de Vocal Back
      const louvor = stored.find(m => m.id === "louvor");
      if (louvor && !louvor.roles.some(r => r.id === "vocalback")) {
        louvor.roles.push({ id: "vocalback", name: "Vocal Back" });
        modified = true;
      }

      // 2. Migração do Ministério de Dança completo
      if (!stored.some(m => m.id === "danca")) {
        stored.push({
          id: "danca",
          name: "Ministério de Dança",
          color: "#ec4899",
          roles: [
            { id: "coreografo", name: "Coreógrafo(a)" },
            { id: "dançarino", name: "Dançarino(a) / Ministro" }
          ]
        });
        modified = true;
      }

      if (modified) {
        localStorage.setItem(KEYS.MINISTRIES, JSON.stringify(stored));
      }
    } catch (e) {
      console.error("Erro ao migrar novas funções de escala", e);
    }
  }
  
  if (!localStorage.getItem(KEYS.VOLUNTEERS)) {
    localStorage.setItem(KEYS.VOLUNTEERS, JSON.stringify(initialVolunteers));
  }
  if (!localStorage.getItem(KEYS.SERVICES)) {
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(initialServices));
  }
  if (!localStorage.getItem(KEYS.ASSIGNMENTS)) {
    localStorage.setItem(KEYS.ASSIGNMENTS, JSON.stringify(initialAssignments));
  }

  // Se o Supabase estiver configurado, realiza a sincronização inicial e seeding
  if (isSupabaseConfigured()) {
    console.log("Supabase configurado! Inicializando sincronização de nuvem...");
    
    // Se o banco estiver vazio, nós o populamos imediatamente (seeding)
    supabase
      .from("escala_ministries")
      .select("id")
      .limit(1)
      .then(({ data, error }) => {
        if (!error && (!data || data.length === 0)) {
          console.log("Supabase vazio no primeiro acesso. Realizando seeding dos dados locais para a nuvem...");
          saveMinistries(readKey(KEYS.MINISTRIES));
          saveVolunteers(readKey(KEYS.VOLUNTEERS));
          saveServices(readKey(KEYS.SERVICES));
          saveAssignments(readKey(KEYS.ASSIGNMENTS));
        } else {
          // Força um carregamento silencioso para atualizar o LocalStorage
          getMinistries();
          getVolunteers();
          getServices();
          getAssignments();
        }
      });
  }
};

// --- MINISTÉRIOS ---
export const getMinistries = () => {
  const localData = readKey(KEYS.MINISTRIES, initialMinistries);
  
  if (isSupabaseConfigured()) {
    supabase
      .from("escala_ministries")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(m => ({
            id: m.id,
            name: m.name,
            color: m.color,
            roles: m.roles
          }));
          
          if (JSON.stringify(mapped) !== JSON.stringify(localData)) {
            writeKey(KEYS.MINISTRIES, mapped);
            window.dispatchEvent(new CustomEvent("escala-db-synced"));
          }
        }
      });
  }
  
  return localData;
};

export const saveMinistries = (data) => {
  writeKey(KEYS.MINISTRIES, data);
  
  if (isSupabaseConfigured()) {
    const payload = data.map(m => ({
      id: m.id,
      name: m.name,
      color: m.color,
      roles: m.roles
    }));
    
    supabase
      .from("escala_ministries")
      .upsert(payload)
      .then(({ error }) => {
        if (error) console.error("Erro ao sincronizar ministérios com Supabase:", error);
      });
  }
  
  return true;
};

// --- VOLUNTÁRIOS ---
export const getVolunteers = () => {
  const localData = readKey(KEYS.VOLUNTEERS, initialVolunteers);
  
  if (isSupabaseConfigured()) {
    supabase
      .from("escala_volunteers")
      .select("*")
      .order("name", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(v => ({
            id: v.id,
            name: v.name,
            email: v.email || "",
            phone: v.phone || "",
            maxServices: v.max_services,
            roles: v.roles,
            blackouts: v.blackouts
          }));
          
          if (JSON.stringify(mapped) !== JSON.stringify(localData)) {
            writeKey(KEYS.VOLUNTEERS, mapped);
            window.dispatchEvent(new CustomEvent("escala-db-synced"));
          }
        }
      });
  }
  
  return localData;
};

export const saveVolunteers = (data) => {
  writeKey(KEYS.VOLUNTEERS, data);
  
  if (isSupabaseConfigured()) {
    const payload = data.map(v => ({
      id: v.id,
      name: v.name,
      email: v.email || null,
      phone: v.phone || null,
      max_services: v.maxServices || 4,
      roles: v.roles || [],
      blackouts: v.blackouts || []
    }));
    
    supabase
      .from("escala_volunteers")
      .upsert(payload)
      .then(({ error }) => {
        if (error) console.error("Erro ao sincronizar voluntários com Supabase:", error);
      });
  }
  
  return true;
};

// --- CULTOS (SERVICES) ---
export const getServices = () => {
  const localData = readKey(KEYS.SERVICES, initialServices);
  
  if (isSupabaseConfigured()) {
    supabase
      .from("escala_services")
      .select("*")
      .order("date", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(s => ({
            id: s.id,
            title: s.title,
            date: s.date,
            time: s.time,
            description: s.description || "",
            requiredRoles: s.required_roles,
            songs: s.songs,
            pollActive: s.poll_active,
            pollLimit: s.poll_limit,
            pollVotes: s.poll_votes
          }));
          
          if (JSON.stringify(mapped) !== JSON.stringify(localData)) {
            writeKey(KEYS.SERVICES, mapped);
            window.dispatchEvent(new CustomEvent("escala-db-synced"));
          }
        }
      });
  }
  
  return localData;
};

export const saveServices = (data) => {
  writeKey(KEYS.SERVICES, data);
  
  if (isSupabaseConfigured()) {
    const payload = data.map(s => ({
      id: s.id,
      title: s.title,
      date: s.date,
      time: s.time,
      description: s.description || null,
      required_roles: s.requiredRoles || [],
      songs: s.songs || [],
      poll_active: s.pollActive || false,
      poll_limit: s.pollLimit || 3,
      poll_votes: s.pollVotes || []
    }));
    
    supabase
      .from("escala_services")
      .upsert(payload)
      .then(({ error }) => {
        if (error) console.error("Erro ao sincronizar cultos com Supabase:", error);
      });
  }
  
  return true;
};

// --- ESCALAS (ASSIGNMENTS) ---
export const getAssignments = () => {
  const localData = readKey(KEYS.ASSIGNMENTS, initialAssignments);
  
  if (isSupabaseConfigured()) {
    supabase
      .from("escala_assignments")
      .select("*")
      .then(({ data, error }) => {
        if (!error && data && data.length > 0) {
          const mapped = data.map(a => ({
            id: a.id,
            serviceId: a.service_id,
            roleId: a.role_id,
            volunteerId: a.volunteer_id || "",
            status: a.status
          }));
          
          if (JSON.stringify(mapped) !== JSON.stringify(localData)) {
            writeKey(KEYS.ASSIGNMENTS, mapped);
            window.dispatchEvent(new CustomEvent("escala-db-synced"));
          }
        }
      });
  }
  
  return localData;
};

export const saveAssignments = (data) => {
  writeKey(KEYS.ASSIGNMENTS, data);
  
  if (isSupabaseConfigured()) {
    const payload = data.map(a => ({
      id: a.id,
      service_id: a.serviceId,
      role_id: a.roleId,
      volunteer_id: a.volunteerId || null,
      status: a.status
    }));
    
    supabase
      .from("escala_assignments")
      .upsert(payload)
      .then(({ error }) => {
        if (error) console.error("Erro ao sincronizar escalas com Supabase:", error);
      });
  }
  
  return true;
};

// --- BACKUP & RESTAURAÇÃO ---

// Gera o arquivo de Backup em JSON para Download
export const exportBackup = () => {
  const backupData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    ministries: getMinistries(),
    volunteers: getVolunteers(),
    services: getServices(),
    assignments: getAssignments()
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `escala_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
};

// Restaura o banco de dados a partir de um arquivo JSON
export const importBackup = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validação básica do formato de backup
    if (!parsed.ministries || !parsed.volunteers || !parsed.services || !parsed.assignments) {
      throw new Error("Arquivo de backup inválido: Faltam tabelas essenciais.");
    }

    saveMinistries(parsed.ministries);
    saveVolunteers(parsed.volunteers);
    saveServices(parsed.services);
    saveAssignments(parsed.assignments);
    
    return { success: true };
  } catch (error) {
    console.error("Falha ao restaurar backup", error);
    return { success: false, error: error.message };
  }
};

// Limpa tudo e reinicia com dados fictícios originais
export const resetToDefaults = () => {
  localStorage.removeItem(KEYS.MINISTRIES);
  localStorage.removeItem(KEYS.VOLUNTEERS);
  localStorage.removeItem(KEYS.SERVICES);
  localStorage.removeItem(KEYS.ASSIGNMENTS);
  
  if (isSupabaseConfigured()) {
    console.log("Limpando tabelas do Supabase...");
    supabase.from("escala_assignments").delete().neq("id", "placeholder").then(() => {
      supabase.from("escala_services").delete().neq("id", "placeholder").then(() => {
        supabase.from("escala_volunteers").delete().neq("id", "placeholder").then(() => {
          supabase.from("escala_ministries").delete().neq("id", "placeholder").then(() => {
            initializeStorage();
            window.location.reload();
          });
        });
      });
    });
  } else {
    initializeStorage();
    window.location.reload();
  }
};

