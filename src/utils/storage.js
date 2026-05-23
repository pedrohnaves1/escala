// -------------------------------------------------------------
// ESCALA STORAGE UTILITIES - LOCALSTORAGE SYNC & BACKUP
// -------------------------------------------------------------

import {
  initialMinistries,
  initialVolunteers,
  initialServices,
  initialAssignments
} from "./mockData";

const KEYS = {
  MINISTRIES: "escala_ministries",
  VOLUNTEERS: "escala_volunteers",
  SERVICES: "escala_services",
  ASSIGNMENTS: "escala_assignments"
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
};

// Funções Genéricas de Leitura e Escrita
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

// --- MINISTÉRIOS ---
export const getMinistries = () => readKey(KEYS.MINISTRIES, initialMinistries);
export const saveMinistries = (data) => writeKey(KEYS.MINISTRIES, data);

// --- VOLUNTÁRIOS ---
export const getVolunteers = () => readKey(KEYS.VOLUNTEERS, initialVolunteers);
export const saveVolunteers = (data) => writeKey(KEYS.VOLUNTEERS, data);

// --- CULTOS ---
export const getServices = () => readKey(KEYS.SERVICES, initialServices);
export const saveServices = (data) => writeKey(KEYS.SERVICES, data);

// --- ESCALAS (ASSIGNMENTS) ---
export const getAssignments = () => readKey(KEYS.ASSIGNMENTS, initialAssignments);
export const saveAssignments = (data) => writeKey(KEYS.ASSIGNMENTS, data);

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
  initializeStorage();
  window.location.reload();
};
