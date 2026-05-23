-- -------------------------------------------------------------
-- ESCALA SAAS - SUPABASE POSTGRESQL SCHEMA
-- -------------------------------------------------------------

-- Habilitar Row Level Security


-- 1. Tabela de Ministérios
CREATE TABLE IF NOT EXISTS public.escala_ministries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    roles JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Voluntários (Membros)
CREATE TABLE IF NOT EXISTS public.escala_volunteers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    max_services INTEGER DEFAULT 4,
    roles JSONB NOT NULL DEFAULT '[]'::jsonb,
    blackouts JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Cultos e Eventos
CREATE TABLE IF NOT EXISTS public.escala_services (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    description TEXT,
    required_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
    songs JSONB NOT NULL DEFAULT '[]'::jsonb,
    poll_active BOOLEAN DEFAULT FALSE,
    poll_limit INTEGER DEFAULT 3,
    poll_votes JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Escalas (Assignments)
CREATE TABLE IF NOT EXISTS public.escala_assignments (
    id TEXT PRIMARY KEY,
    service_id TEXT NOT NULL REFERENCES public.escala_services(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL,
    volunteer_id TEXT REFERENCES public.escala_volunteers(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- -------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Para o estágio 1, vamos permitir acesso irrestrito de leitura/escrita 
-- autenticado para facilitar a integração, e depois aplicar isolamento.
-- -------------------------------------------------------------

ALTER TABLE public.escala_ministries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_volunteers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso Público Temporário (Facilidade de Integração do Protótipo)
CREATE POLICY "Permitir leitura para todos" ON public.escala_ministries FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON public.escala_ministries FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura para todos" ON public.escala_volunteers FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON public.escala_volunteers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura para todos" ON public.escala_services FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON public.escala_services FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Permitir leitura para todos" ON public.escala_assignments FOR SELECT USING (true);
CREATE POLICY "Permitir escrita para todos" ON public.escala_assignments FOR ALL USING (true) WITH CHECK (true);
