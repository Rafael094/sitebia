-- ================================================================
-- v8 — SEO por PÁGINA (metadados do <head> de rotas estáticas)
-- ----------------------------------------------------------------
-- As colunas `seo_metadata` (v7) cobrem conteúdos individuais
-- (services, articles) e blocos de seção (page_contents). Faltava
-- o SEO da PÁGINA inteira de rotas como "/", "/atuacao",
-- "/conteudos", "/contato" e "/international".
--
-- Esta tabela guarda exatamente o mesmo objeto SeoMetadata:
--   { meta_title, meta_description, meta_keywords,
--     og_title, og_description, og_image, source, generated_at }
--
-- A coluna `page_key` é a chave estável da rota (a URL relativa).
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ================================================================

create table if not exists public.page_seo (
  page_key     text primary key,
  seo_metadata jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

comment on table public.page_seo is
  'SEO editável (DeepSeek) por página estática do site (/, /atuacao, /conteudos, /contato, /international).';
comment on column public.page_seo.page_key is
  'Chave estável da rota — a própria URL relativa (ex.: "/", "/atuacao").';
comment on column public.page_seo.seo_metadata is
  'No mesmo formato de services/articles/page_contents: meta_title, meta_description, meta_keywords, og_*';

-- Linhas iniciais (sem dados de SEO — o painel/site usa o fallback do código
-- até o admin gravar algo). O INSERT garante que o registro já exista.
insert into public.page_seo (page_key)
values
  ('/'),
  ('/atuacao'),
  ('/conteudos'),
  ('/contato'),
  ('/international')
on conflict (page_key) do nothing;

-- Trigger padrão de updated_at (a função já existe desde o schema base).
drop trigger if exists trg_page_seo_updated_at on public.page_seo;
create trigger trg_page_seo_updated_at
  before update on public.page_seo
  for each row execute function public.set_updated_at();

-- Índice GIN para consultas por chave de SEO (filtros futuros no painel).
create index if not exists idx_page_seo_seo_metadata
  on public.page_seo using gin (seo_metadata);

-- RLS: visitantes leem (o <head> público precisa dos metadados);
-- somente autenticados gravam.
alter table public.page_seo enable row level security;

drop policy if exists "page_seo_public_read" on public.page_seo;
create policy "page_seo_public_read"
  on public.page_seo for select
  using (true);

drop policy if exists "page_seo_auth_all" on public.page_seo;
create policy "page_seo_auth_all"
  on public.page_seo for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');
