-- ============================================================================
-- Migration v9 — Analytics / Business Intelligence (BI)
-- ----------------------------------------------------------------------------
-- Cria a tabela de rastreamento de acessos `page_views`, que alimenta o painel
-- "Analytics & BI" do admin.
--
-- Privacidade (LGPD):
--   * NÃO guardamos IP em texto puro. Registramos apenas um hash anônimo
--     (SHA-256 sobre IP + User-Agent + salt do servidor), impossível de
--     reverter para o IP original. Serve só para contar visitantes únicos.
--   * Nenhuma política pública de leitura/escrita: somente a service_role
--     (usada nos Route Handlers do servidor) acessa esta tabela.
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- Executar no SQL Editor do painel Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabela de visualizações
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id            uuid        primary key default gen_random_uuid(),
  path          text        not null,                 -- rota visitada (ex.: /conteudos/meu-artigo)
  content_type  text        not null default 'page',  -- page | home | artigo | atuacao | contato | international
  content_id    uuid,                                 -- id do artigo/serviço (quando aplicável)
  content_slug  text,                                 -- slug do artigo/serviço (quando aplicável)
  content_title text,                                 -- título legível (para relatórios rápidos)
  session_hash  text,                                 -- hash anônimo do visitante (nunca o IP)
  referrer      text,                                 -- origem (opcional, anonimizada a host)
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Índices para as consultas do dashboard (série temporal + agrupamentos)
-- ---------------------------------------------------------------------------
create index if not exists idx_page_views_created_at
  on public.page_views (created_at desc);
create index if not exists idx_page_views_content_type
  on public.page_views (content_type);
create index if not exists idx_page_views_content_id
  on public.page_views (content_id);
create index if not exists idx_page_views_path
  on public.page_views (path);
create index if not exists idx_page_views_session_hash
  on public.page_views (session_hash);

-- ---------------------------------------------------------------------------
-- 3. RLS — bloqueia anon/authenticated; apenas a service_role (servidor) opera
-- ---------------------------------------------------------------------------
alter table public.page_views enable row level security;

-- Remove qualquer política aberta (defesa contra execuções anteriores).
drop policy if exists "page_views_public_read" on public.page_views;
drop policy if exists "page_views_anon_insert" on public.page_views;
drop policy if exists "page_views_auth_all" on public.page_views;

-- Sem políticas abertas => só a service_role (que ignora RLS) lê e escreve.

comment on table  public.page_views is
  'Visualizações de páginas (Analytics/BI). Dados anonimizados; acesso apenas via service_role.';
comment on column public.page_views.session_hash is
  'Hash SHA-256 anônimo (IP+UA+salt). Nunca armazena o IP em texto puro.';
comment on column public.page_views.content_type is
  'Tipo de conteúdo: page | home | artigo | atuacao | contato | international.';
