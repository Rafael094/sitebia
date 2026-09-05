-- ================================================================
-- CORRIGIDO - Supabase: SEO nos artigos + conteudo dinamico de secoes
-- ----------------------------------------------------------------
-- Idempotente: pode rodar mais de uma vez sem erro.
-- Seguro rodar de novo mesmo se uma versao anterior falhou no meio.
-- Seeds em UTF-8 normal (acentuacao limpa).
-- ================================================================

create extension if not exists "pgcrypto";

-- 1) SEO nos artigos
alter table public.articles
  add column if not exists meta_description text,
  add column if not exists tags text[] default '{}';

-- Indice das tags (GIN = correto p/ text[]). Nao existe section_key em articles.
create index if not exists idx_articles_tags on public.articles using gin (tags);

-- 2) Tabela page_contents
create table if not exists public.page_contents (
  id uuid primary key default gen_random_uuid(),
  section_key varchar(100) not null unique,
  badge_text text,
  title text,
  subtitle text,
  description text,
  quote_text text,
  button_primary_label text,
  button_primary_url text,
  button_secondary_label text,
  button_secondary_url text,
  badge_extra_title text,
  badge_extra_sub text,
  image_url text,
  updated_at timestamptz not null default now()
);

alter table public.page_contents
  add column if not exists subtitle text,
  add column if not exists quote_text text,
  add column if not exists button_primary_label text,
  add column if not exists button_primary_url text,
  add column if not exists button_secondary_label text,
  add column if not exists button_secondary_url text,
  add column if not exists badge_extra_title text,
  add column if not exists badge_extra_sub text,
  add column if not exists image_url text;

drop trigger if exists trg_page_contents_updated_at on public.page_contents;
create trigger trg_page_contents_updated_at
  before update on public.page_contents
  for each row execute function public.set_updated_at();

create index if not exists idx_page_contents_key on public.page_contents (section_key);

-- 3) RLS
alter table public.page_contents enable row level security;

drop policy if exists "page_contents_public_read" on public.page_contents;
create policy "page_contents_public_read"
  on public.page_contents for select using (true);

drop policy if exists "page_contents_auth_all" on public.page_contents;
create policy "page_contents_auth_all"
  on public.page_contents for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- 4) Seeds - carga inicial (nunca sobrescreve o que o admin editou)
insert into public.page_contents
  (section_key, badge_text, title, subtitle, description, quote_text,
   button_primary_label, button_primary_url, button_secondary_label,
   button_secondary_url, badge_extra_title, badge_extra_sub, image_url)
values (
  'home_hero',
  'CONSULTORIA & ASSESSORIA ESTRATÉGICA',
  'TRANSFERÊNCIA DE TECNOLOGIA E **PROPRIEDADE INTELECTUAL**',
  'Transformo pesquisa e inovação em negócios seguros.',
  'Do diagnóstico da proteção ao contrato que destrava valor entre universidades, empresas e pesquisadores.',
  '“Inovar sem proteger é construir sobre areia. Estruturei cada etapa para que a sua tecnologia gere valor — com segurança jurídica.”',
  'Agendar diagnóstico', '/contato',
  'Conhecer a atuação', '/atuacao',
  '+10 ANOS', 'dedicados a PI & inovação', '/images/1702302801691.jpg'
)
on conflict (section_key) do nothing;

-- HOME - services overview (cabecalho)
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'home_services_header', 'O QUE EU FAÇO',
  'ATUAÇÃO SOB MEDIDA PARA O CICLO DE VIDA DA INOVAÇÃO',
  'Da primeira avaliação de patenteabilidade até o contrato que licencia a tecnologia, conduzo cada etapa com rigor técnico e visão de negócio.'
)
on conflict (section_key) do nothing;

-- HOME - journey (cabecalho)
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'home_journey_header', 'COMO POSSO AJUDAR',
  'UMA JORNADA CLARA, DO ATIVO AO CONTRATO',
  'Cada projeto passa por etapas estruturadas — você sabe exatamente em que ponto está e para onde vamos.'
)
on conflict (section_key) do nothing;

-- HOME - CTA
insert into public.page_contents
  (section_key, badge_text, title, description,
   button_primary_label, button_primary_url, button_secondary_label)
values (
  'home_cta', 'CONTATO',
  'PRONTA PARA ESTRUTURAR A PROTEÇÃO E A TRANSFERÊNCIA DA SUA TECNOLOGIA?',
  'Vamos conversar sobre o seu caso em um diagnóstico inicial — sem compromisso.',
  'Agendar uma conversa', '/contato', 'WhatsApp direto'
)
on conflict (section_key) do nothing;


-- Pagina /atuacao - hero
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'page_services_header', 'ATUAÇÃO',
  'ESTRATÉGIA COMPLETA PARA PROTEGER E TRANSFERIR TECNOLOGIA',
  'Cada projeto é endereçado por um especialista que une técnica jurídica e visão de negócio.'
)
on conflict (section_key) do nothing;

-- Pagina /conteudos - hero
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'page_articles_header', 'CONTEÚDOS',
  'REFLEXÕES, ANÁLISES E NOTAS TÉCNICAS',
  'Conteúdo relevante para quem inova, protege e transfere tecnologia — produzido por quem vive esse mercado todos os dias.'
)
on conflict (section_key) do nothing;

-- Pagina /contato - hero
insert into public.page_contents (section_key, badge_text, title, description)
values (
  'page_contact_header', 'CONTATO',
  'VAMOS CONVERSAR SOBRE A SUA TECNOLOGIA?',
  'Conte um pouco sobre o seu projeto, inovação ou parceria.'
)
on conflict (section_key) do nothing;

-- HOME - sobre (ancora/titulo; o corpo da Home About.tsx permanece)
insert into public.page_contents (section_key, badge_text, title)
values ('home_about', 'SOBRE', 'Bianca Martins')
on conflict (section_key) do nothing;

