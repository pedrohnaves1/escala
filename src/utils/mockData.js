// -------------------------------------------------------------
// ESCALA MOCK DATA - DADOS DE TESTE INICIAIS REALISTAS
// -------------------------------------------------------------

export const initialMinistries = [
  {
    id: "louvor",
    name: "Ministério de Louvor",
    color: "#8b5cf6",
    roles: [
      { id: "lider", name: "Líder de Louvor" },
      { id: "teclado", name: "Teclado" },
      { id: "violao", name: "Violão" },
      { id: "baixo", name: "Baixo" },
      { id: "bateria", name: "Bateria" },
      { id: "vocal", name: "Vocal" },
      { id: "vocalback", name: "Vocal Back" }
    ]
  },
  {
    id: "midia",
    name: "Mídia & Som",
    color: "#0ea5e9",
    roles: [
      { id: "som", name: "Operador de Som" },
      { id: "projecao", name: "Projeção/Slides" },
      { id: "transmissao", name: "Transmissão/Câmera" }
    ]
  },
  {
    id: "diaconato",
    name: "Diaconato e Recepção",
    color: "#10b981",
    roles: [
      { id: "recepcao", name: "Recepcionista" },
      { id: "diacono", name: "Diácono de Serviço" },
      { id: "apoio", name: "Apoio Técnico" }
    ]
  },
  {
    id: "infantil",
    name: "Ministério Infantil",
    color: "#f59e0b",
    roles: [
      { id: "professor", name: "Professor Kids" },
      { id: "auxiliar", name: "Auxiliar Infantil" }
    ]
  },
  {
    id: "danca",
    name: "Ministério de Dança",
    color: "#ec4899",
    roles: [
      { id: "coreografo", name: "Coreógrafo(a)" },
      { id: "dançarino", name: "Dançarino(a) / Ministro" }
    ]
  }
];

export const initialVolunteers = [
  {
    id: "v1",
    name: "João Silva",
    email: "joao.silva@email.com",
    phone: "(11) 99888-1122",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "louvor", roleId: "lider" },
      { ministryId: "louvor", roleId: "violao" }
    ],
    blackouts: ["2026-06-10", "2026-06-11", "2026-06-12"] // Indisponível nestas datas
  },
  {
    id: "v2",
    name: "Mariana Souza",
    email: "mariana.souza@email.com",
    phone: "(11) 99777-3344",
    maxMonthlyServices: 3,
    skills: [
      { ministryId: "louvor", roleId: "teclado" },
      { ministryId: "louvor", roleId: "vocal" }
    ],
    blackouts: []
  },
  {
    id: "v3",
    name: "Lucas Pereira",
    email: "lucas.pereira@email.com",
    phone: "(11) 99666-5566",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "louvor", roleId: "bateria" }
    ],
    blackouts: []
  },
  {
    id: "v4",
    name: "Pedro Santos",
    email: "pedro.santos@email.com",
    phone: "(11) 99555-7788",
    maxMonthlyServices: 4,
    skills: [
      { ministryId: "midia", roleId: "som" },
      { ministryId: "midia", roleId: "transmissao" }
    ],
    blackouts: []
  },
  {
    id: "v5",
    name: "Camila Lima",
    email: "camila.lima@email.com",
    phone: "(11) 99444-9900",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "midia", roleId: "projecao" },
      { ministryId: "diaconato", roleId: "recepcao" }
    ],
    blackouts: []
  },
  {
    id: "v6",
    name: "Mateus Costa",
    email: "mateus.costa@email.com",
    phone: "(11) 99333-1133",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "louvor", roleId: "baixo" },
      { ministryId: "louvor", roleId: "violao" }
    ],
    blackouts: ["2026-05-24"] // Indisponível no culto de domingo próximo
  },
  {
    id: "v7",
    name: "Beatriz Oliveira",
    email: "beatriz.oliveira@email.com",
    phone: "(11) 99222-2244",
    maxMonthlyServices: 3,
    skills: [
      { ministryId: "louvor", roleId: "vocal" },
      { ministryId: "louvor", roleId: "lider" }
    ],
    blackouts: []
  },
  {
    id: "v8",
    name: "Felipe Rodrigues",
    email: "felipe.rodrigues@email.com",
    phone: "(11) 99111-3355",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "diaconato", roleId: "diacono" },
      { ministryId: "diaconato", roleId: "recepcao" }
    ],
    blackouts: []
  },
  {
    id: "v9",
    name: "Gabriela Mendes",
    email: "gabriela.mendes@email.com",
    phone: "(11) 99000-4466",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "infantil", roleId: "professor" }
    ],
    blackouts: []
  },
  {
    id: "v10",
    name: "Rodrigo Almeida",
    email: "rodrigo.almeida@email.com",
    phone: "(11) 98999-5577",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "infantil", roleId: "auxiliar" },
      { ministryId: "diaconato", roleId: "recepcao" }
    ],
    blackouts: []
  },
  {
    id: "v11",
    name: "Aline Santana",
    email: "aline.santana@email.com",
    phone: "(11) 98888-6688",
    maxMonthlyServices: 3,
    skills: [
      { ministryId: "louvor", roleId: "violao" },
      { ministryId: "louvor", roleId: "vocal" }
    ],
    blackouts: []
  },
  {
    id: "v12",
    name: "Thiago Nogueira",
    email: "thiago.nogueira@email.com",
    phone: "(11) 98777-7799",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "midia", roleId: "som" }
    ],
    blackouts: []
  },
  {
    id: "v13",
    name: "Juliana Castro",
    email: "juliana.castro@email.com",
    phone: "(11) 98666-8800",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "diaconato", roleId: "recepcao" },
      { ministryId: "diaconato", roleId: "diacono" }
    ],
    blackouts: []
  },
  {
    id: "v14",
    name: "André Jesus",
    email: "andre.jesus@email.com",
    phone: "(11) 98555-9911",
    maxMonthlyServices: 3,
    skills: [
      { ministryId: "infantil", roleId: "professor" },
      { ministryId: "infantil", roleId: "auxiliar" }
    ],
    blackouts: []
  },
  {
    id: "v15",
    name: "Paula Vieira",
    email: "paula.vieira@email.com",
    phone: "(11) 98444-2233",
    maxMonthlyServices: 2,
    skills: [
      { ministryId: "louvor", roleId: "teclado" },
      { ministryId: "louvor", roleId: "vocal" }
    ],
    blackouts: []
  }
];

// Cultos / Eventos agendados
export const initialServices = [
  {
    id: "s1",
    title: "Culto de Domingo - Manhã",
    date: "2026-05-24", // Data próxima do local time (2026-05-22 é sexta, 24 é domingo)
    time: "09:00",
    description: "Culto de Celebração de Domingo de Manhã - Série de Mensagens sobre Família.",
    requiredRoles: [
      { ministryId: "louvor", roleId: "lider" },
      { ministryId: "louvor", roleId: "teclado" },
      { ministryId: "louvor", roleId: "violao" },
      { ministryId: "louvor", roleId: "baixo" },
      { ministryId: "louvor", roleId: "bateria" },
      { ministryId: "louvor", roleId: "vocal" },
      { ministryId: "midia", roleId: "som" },
      { ministryId: "midia", roleId: "projecao" },
      { ministryId: "midia", roleId: "transmissao" },
      { ministryId: "diaconato", roleId: "recepcao" },
      { ministryId: "diaconato", roleId: "diacono" },
      { ministryId: "infantil", roleId: "professor" },
      { ministryId: "infantil", roleId: "auxiliar" }
    ],
    setlist: [
      { id: "m1", title: "A Casa É Sua", key: "G", link: "https://www.cifraclub.com.br/casa-worship/a-casa-e-sua/" },
      { id: "m2", title: "O Escudo", key: "Em", link: "https://www.cifraclub.com.br/grupo-logos/o-escudo/" },
      { id: "m3", title: "Bondade de Deus", key: "A", link: "https://www.cifraclub.com.br/isaias-saad/bondade-de-deus/" }
    ]
  },
  {
    id: "s2",
    title: "Culto de Domingo - Noite",
    date: "2026-05-24",
    time: "18:00",
    description: "Culto Evangelístico de Domingo à Noite.",
    requiredRoles: [
      { ministryId: "louvor", roleId: "lider" },
      { ministryId: "louvor", roleId: "teclado" },
      { ministryId: "louvor", roleId: "violao" },
      { ministryId: "louvor", roleId: "bateria" },
      { ministryId: "louvor", roleId: "vocal" },
      { ministryId: "midia", roleId: "som" },
      { ministryId: "midia", roleId: "projecao" },
      { ministryId: "diaconato", roleId: "recepcao" },
      { ministryId: "diaconato", roleId: "recepcao" },
      { ministryId: "diaconato", roleId: "diacono" }
    ],
    setlist: [
      { id: "m4", title: "Porque Ele Vive", key: "A", link: "https://www.cifraclub.com.br/harpa-crista/porque-ele-vive/" },
      { id: "m5", title: "Caminho no Deserto", key: "C", link: "https://www.cifraclub.com.br/soraya-moraes/caminho-no-deserto/" }
    ]
  },
  {
    id: "s3",
    title: "Culto de Jovens - Sábado",
    date: "2026-05-30",
    time: "19:30",
    description: "Culto Mensal da Juventude - Conexão Jovem.",
    requiredRoles: [
      { ministryId: "louvor", roleId: "lider" },
      { ministryId: "louvor", roleId: "violao" },
      { ministryId: "louvor", roleId: "baixo" },
      { ministryId: "louvor", roleId: "bateria" },
      { ministryId: "midia", roleId: "som" },
      { ministryId: "midia", roleId: "projecao" },
      { ministryId: "diaconato", roleId: "recepcao" }
    ],
    setlist: [
      { id: "m6", title: "Eu Também (100 bilhões de vezes)", key: "F", link: "https://www.cifraclub.com.br/kemuel/eu-tambem-100-bilhoes-de-vezes/" },
      { id: "m7", title: "Ruínas", key: "D", link: "https://www.cifraclub.com.br/marcos-almeida/ruinas/" }
    ]
  },
  {
    id: "s4",
    title: "Culto de Ensino - Quarta-feira",
    date: "2026-05-27",
    time: "20:00",
    description: "Estudo Bíblico Semanal e Reunião de Oração.",
    requiredRoles: [
      { ministryId: "louvor", roleId: "violao" },
      { ministryId: "midia", roleId: "som" },
      { ministryId: "diaconato", roleId: "recepcao" }
    ],
    setlist: []
  }
];

// Atribuições iniciais da escala (Assignments)
export const initialAssignments = [
  // Domingo Manhã (s1)
  { serviceId: "s1", ministryId: "louvor", roleId: "lider", volunteerId: "v1", status: "confirmed" },
  { serviceId: "s1", ministryId: "louvor", roleId: "teclado", volunteerId: "v2", status: "confirmed" },
  { serviceId: "s1", ministryId: "louvor", roleId: "violao", volunteerId: "v11", status: "pending" },
  { serviceId: "s1", ministryId: "louvor", roleId: "bateria", volunteerId: "v3", status: "confirmed" },
  { serviceId: "s1", ministryId: "midia", roleId: "som", volunteerId: "v4", status: "confirmed" },
  { serviceId: "s1", ministryId: "midia", roleId: "projecao", volunteerId: "v5", status: "pending" },
  { serviceId: "s1", ministryId: "diaconato", roleId: "recepcao", volunteerId: "v8", status: "confirmed" },
  { serviceId: "s1", ministryId: "infantil", roleId: "professor", volunteerId: "v9", status: "confirmed" },
  
  // Domingo Noite (s2)
  { serviceId: "s2", ministryId: "louvor", roleId: "lider", volunteerId: "v7", status: "confirmed" },
  { serviceId: "s2", ministryId: "louvor", roleId: "teclado", volunteerId: "v15", status: "pending" },
  { serviceId: "s2", ministryId: "midia", roleId: "som", volunteerId: "v12", status: "confirmed" },
  { serviceId: "s2", ministryId: "diaconato", roleId: "diacono", volunteerId: "v13", status: "pending" }
];
