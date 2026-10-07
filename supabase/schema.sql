-- Supabase — schema.sql
-- ---------------------------------------------------------------------------
-- Site institucional + painel administrativo
-- Profissional: Bianca Martins — Transferência de Tecnologia e Propriedade
-- Intelectual.
--
-- Executar este script no SQL Editor do painel do Supabase
-- (Dashboard > SQL Editor), na ordem apresentada.
-- ---------------------------------------------------------------------------

-- ================================================================
-- 1. EXTENSÕES
-- PGCrypto habilita gen_random_uuid() para chaves primárias.
-- ================================================================
create extension if not exists "pgcrypto";

-- ================================================================
-- 2. ENUMS
-- ================================================================
do $$ begin
  create type article_category as enum (
    'transferencia-de-tecnologia',
    'propriedade-intelectual',
    'contratos-e-parcerias'
  );
exception when duplicate_object then null; end $$;


-- ================================================================
-- 3. TABELAS
-- ================================================================

-- Areas de atuacao / servicos ofertados.
create table if not exists public.services (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text not null unique,
  summary       text not null,             -- resumo curto (card)
  description   text not null,             -- descricao detalhada (pagina interna)
  audience      text default '',           -- publico-alvo (opcional)
  problems      text default '',           -- problemas resolvidos (opcional)
  scope         text default '',           -- escopo (opcional)
  icon          text default 'briefcase',  -- nome do icone Lucide (opcional)
  order_index   int  not null default 0,   -- ordem de exibicao
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Artigos / noticias / conteudos.
create table if not exists public.articles (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  slug            text not null unique,
  category        article_category not null,
  summary         text not null,                           -- resumo/lead
  content         text not null default '',                -- corpo (HTML semântico do editor)
  cover_image_url text not null default '',                -- capa via Supabase Storage
  is_published    boolean not null default false,          -- false = rascunho
  author          text not null default 'Bianca Martins',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Mensagens enviadas pelo formulario de contato do site.
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text default '',
  subject     text default '',
  message     text not null,
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Configuracoes editaveis pelo painel (contatos publicos exibidos no site).
-- Mantemos uma unica linha (id = 1) e a atualizamos pelo painel /admin.
create table if not exists public.site_settings (
  id              integer     primary key check (id = 1),
  whatsapp_link   text not null default 'https://wa.me/5511999999999',
  contact_email   text not null default 'contato@biancamartins.com.br',
  instagram_link  text not null default 'https://instagram.com/',
  linkedin_link   text not null default 'https://www.linkedin.com/',
  contact_address text not null default 'Londrina - PR & atendimento remoto para todo o pais',
  contact_hours   text not null default 'Segunda a sexta, das 9h as 18h',
  updated_at      timestamptz not null default now()
);

-- Garante que a configuracao exista (as alteracoes futuras sao UPDATE nesta linha).
insert into public.site_settings (id)
values (1)
on conflict (id) do nothing;

-- Migracao p/ instancias existentes: adiciona (se ainda nao existirem) as colunas
-- de endereco e horario editaveis pelo painel (nao remove valores, apenas preenche padrao).
alter table public.site_settings
  add column if not exists contact_address text not null default 'Londrina - PR & atendimento remoto para todo o pais';
alter table public.site_settings
  add column if not exists contact_hours text not null default 'Segunda a sexta, das 9h as 18h';

-- ================================================================
-- 4. TRIGGERS — atualizacao automatica de "updated_at"
-- ================================================================
create or replace function public.set_updated_at()
returns trigger as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$ language plpgsql;

drop trigger if exists trg_services_updated_at on public.services;
create trigger trg_services_updated_at
  before update on public.services
  for each row execute function public.set_updated_at();

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
  before update on public.articles
  for each row execute function public.set_updated_at();

drop trigger if exists trg_site_settings_updated_at on public.site_settings;
create trigger trg_site_settings_updated_at
  before update on public.site_settings
  for each row execute function public.set_updated_at();

-- Visualizacoes de paginas (Analytics / Business Intelligence).
-- Dados anonimizados: guarda apenas um hash do visitante (nunca o IP).
-- Acesso somente via service_role (servidor) — sem politicas publicas.
create table if not exists public.page_views (
  id            uuid        primary key default gen_random_uuid(),
  path          text        not null,                 -- rota visitada
  content_type  text        not null default 'page',  -- page | home | artigo | atuacao | contato | international
  content_id    uuid,                                 -- id do artigo/servico (quando aplicavel)
  content_slug  text,                                 -- slug do artigo/servico (quando aplicavel)
  content_title text,                                 -- titulo legivel (relatorios)
  session_hash  text,                                 -- hash anonimo do visitante (nunca o IP)
  referrer      text,                                 -- origem (host) opcional
  created_at    timestamptz not null default now()
);

-- ================================================================
-- 5. INDICES (performance de busca por slug)
-- ================================================================
create index if not exists idx_services_slug      on public.services (slug);
create index if not exists idx_articles_slug      on public.articles (slug);
create index if not exists idx_articles_published on public.articles (is_published, created_at desc);
create index if not exists idx_articles_category  on public.articles (category);

-- ================================================================
-- 6. ROW LEVEL SECURITY
-- Regras:
--   * Anonimos (site publico)  -> somente LEITURA.
--   * Autenticados (painel)    -> INSERT / UPDATE / DELETE
--      (via login Supabase Auth no painel /admin).
--   * O formulario publico de contato pode INSERT recados.
-- ================================================================
alter table public.services         enable row level security;
alter table public.articles         enable row level security;
alter table public.contact_messages enable row level security;
alter table public.site_settings    enable row level security;
alter table public.page_views       enable row level security;


-- SERVICES -----------------------------------------------------------------
drop policy if exists "services_public_read" on public.services;
create policy "services_public_read"
  on public.services for select
  using (true);

drop policy if exists "services_auth_all" on public.services;
create policy "services_auth_all"
  on public.services for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- ARTICLES -----------------------------------------------------------------
drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read"
  on public.articles for select
  using (is_published = true); -- publico so ve publicados

drop policy if exists "articles_auth_all" on public.articles;
create policy "articles_auth_all"
  on public.articles for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- CONTACT_MESSAGES ---------------------------------------------------------
-- Visitantes podem INSERIR recados pelo formulario. So autenticados leem/atualizam/apagam.
drop policy if exists "contact_insert_public" on public.contact_messages;
create policy "contact_insert_public"
  on public.contact_messages for insert
  with check (true);

drop policy if exists "contact_auth_select" on public.contact_messages;
create policy "contact_auth_select"
  on public.contact_messages for select
  using (auth.role() = 'authenticated');

drop policy if exists "contact_auth_update" on public.contact_messages;
create policy "contact_auth_update"
  on public.contact_messages for update
  using (auth.role() = 'authenticated');

drop policy if exists "contact_auth_delete" on public.contact_messages;
create policy "contact_auth_delete"
  on public.contact_messages for delete
  using (auth.role() = 'authenticated');

-- SITE_SETTINGS --------------------------------------------------------------
-- Todo visitante pode LER os contatos; somente autorizados/painel alteram.
drop policy if exists "site_settings_public_read" on public.site_settings;
create policy "site_settings_public_read"
  on public.site_settings for select
  using (true);

drop policy if exists "site_settings_auth_all" on public.site_settings;
create policy "site_settings_auth_all"
  on public.site_settings for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- PAGE_VIEWS (Analytics / BI) ------------------------------------------------
-- PRIVACIDADE: sem politicas abertas. Somente a service_role (servidor) le e
-- escreve (ela ignora RLS). Anonimos e usuarios autenticados ficam bloqueados.
drop policy if exists "page_views_public_read" on public.page_views;
drop policy if exists "page_views_anon_insert" on public.page_views;
drop policy if exists "page_views_auth_all"    on public.page_views;

-- ================================================================
-- 7. STORAGE — Bucket de capas de artigos
-- Tambem pode ser criado manualmente: Dashboard > Storage > New bucket.
-- ================================================================
insert into storage.buckets (id, name, public)
values ('article-covers', 'article-covers', true)
on conflict (id) do nothing;

drop policy if exists "article_covers_auth_upload" on storage.objects;
create policy "article_covers_auth_upload"
  on storage.objects for insert
  with check (bucket_id = 'article-covers' and auth.role() = 'authenticated');

drop policy if exists "article_covers_auth_update" on storage.objects;
create policy "article_covers_auth_update"
  on storage.objects for update
  using (bucket_id = 'article-covers' and auth.role() = 'authenticated');

drop policy if exists "article_covers_auth_delete" on storage.objects;
create policy "article_covers_auth_delete"
  on storage.objects for delete
  using (bucket_id = 'article-covers' and auth.role() = 'authenticated');

-- Leitura publica das imagens
drop policy if exists "article_covers_public_read" on storage.objects;
create policy "article_covers_public_read"
  on storage.objects for select
  using (bucket_id = 'article-covers');

-- ================================================================
-- 8. STORAGE — Bucket de uploads do painel (imagem do Hero etc.)
-- Publico para leitura; escrita apenas via service_role (Server Actions).
-- ================================================================
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

drop policy if exists "uploads_auth_upload" on storage.objects;
create policy "uploads_auth_upload"
  on storage.objects for insert
  with check (bucket_id = 'uploads' and auth.role() = 'authenticated');

drop policy if exists "uploads_auth_update" on storage.objects;
create policy "uploads_auth_update"
  on storage.objects for update
  using (bucket_id = 'uploads' and auth.role() = 'authenticated');

drop policy if exists "uploads_auth_delete" on storage.objects;
create policy "uploads_auth_delete"
  on storage.objects for delete
  using (bucket_id = 'uploads' and auth.role() = 'authenticated');

-- Leitura publica das imagens enviadas pelo painel
drop policy if exists "uploads_public_read" on storage.objects;
create policy "uploads_public_read"
  on storage.objects for select
  using (bucket_id = 'uploads');


-- ================================================================
-- 9. SEED — dados iniciais ilustrativos (executar apos as tabelas)
-- ================================================================

insert into public.services
  (title, slug, summary, description, audience, problems, scope, icon, order_index)
values
  (
    'Diagnostico de Propriedade Intelectual',
    'diagnostico-propriedade-intelectual',
    'Mapeamento do potencial inovador do seu ativo com auditoria de protegibilidade.',
    'Auditoria tecnico-juridica para identificar o melhor regime de protecao: patente, modelo de utilidade, marca, direito autoral ou segredo industrial. O processo inclui busca de anterioridade, analise de estado da tecnica e recomendacao estrategica documentada.',
    'Startups, universidades, pesquisadores e empresas de base tecnologica.',
    'Incerteza sobre o que pode ser protegido, risco de perda da novidade por divulgacao precoce e falta de visao do portifolio.',
    'Busca de anterioridade, analise de patenteabilidade, recomendacao documentada e roadmap de protecao.',
    'search-check',
    1
  ),
  (
    'Estruturacao de Portfolio Tecnologico',
    'estruturacao-portfolio-tecnologico',
    'Organizacao do acervo de ativos intangiveis em um portfolio estrategico.',
    'Estruturacao do portfolio de propriedade intelectual: inventario de ativos, classificacao estrategica, definicao de titularidade e gestao de prazos de vigencia e custos de manutencao, transformando PI em ativo gerido estrategicamente.',
    'Empresas e ICTs que acumulam ativos sem conhecer o proprio valor.',
    'Ativos intangiveis dispersos e subutilizados, custos de manutencao sem criterio e ausencia de governanca de PI.',
    'Inventario, governanca de PI, dashboard de prazos e rotinas de decisao.',
    'layers',
    2
  ),
  (
    'Conexao entre Pesquisa e Mercado',
    'conexao-pesquisa-mercado',
    'Pontes entre a academia, licenciamento e oportunidades de inovacao aberta.',
    'Atuacao como ponte entre quem gera conhecimento e quem gera mercado: oportunidades de inovacao aberta, negociacao de spin-off, parcerias tecnologicas e arranjos colaborativos entre ICTs e industria, com seguranca juridica desde o primeiro contato.',
    'Universidades, nucleos de inovacao tecnologica (NITs) e empresas que buscam tecnologias.',
    'Pesquisa sem destino comercial, distanciamento entre cientistas e empresas e parcerias informais.',
    'Prospeccao de parceiros, modelagem de vinculos e apoio a inovacao aberta.',
    'network',
    3
  ),
  (
    'Contratos e Transferencia de Tecnologia',
    'contratos-transferencia-tecnologia',
    'Negociacao e redacao de acordos de licenciamento e transferencia de tecnologia.',
    'Planejamento, redacao e negociacao de acordos de transferencia de tecnologia: licenciamentos, cessao de direitos, know-how, NDA e codesenvolvimento. Contratos sob medida que protegem o ativo, distribuem riscos e destravam valor.',
    'Empresas, universidades, inventores e investidores que precisam formalizar uso ou cessao de tecnologia.',
    'Contratos-padrao que nao refletem o negocio, conflitos de titularidade e remuneracao desestruturada.',
    'Licenciamento, cessao, NDA, remuneracao e escalonamento de royalties.',
    'file-signature',
    4
  )
on conflict (slug) do nothing;

-- ================================================================
-- 10. LANDING PAGE INTERNACIONAL (/international)
-- Seeds dos textos da página em inglês. O bucket de uploads e os
-- conteúdos são editáveis pelo painel (grupo "International").
-- ================================================================
insert into public.page_contents
  (section_key, badge_text, title, subtitle, description, quote_text,
   button_primary_label, button_primary_url,
   button_secondary_label, button_secondary_url, image_url)
values
  (
    'intl_hero', 'INTERNATIONAL CLIENTS',
    E'Protect your IP.\nEnter the Brazilian market.\nBuild innovation partnerships.',
    'Strategic legal and innovation support for foreign companies and international law firms navigating intellectual property, technology transfer and innovation opportunities in Brazil.',
    '',
    'Based in Brazil. Working across borders.',
    'Talk to Bianca', '#contact',
    'Explore our services', '#services',
    ''
  ),
  (
    'intl_trust', 'HOW WE HELP',
    'Three ways we support international clients', '', 
    'A focused practice built around intellectual property, market entry and innovation — delivered by a Brazilian team for clients working across jurisdictions.',
    '', '', '', '', '', ''
  ),
  (
    'intl_services', 'SERVICES',
    'How we can support your business in Brazil', '',
    'Entering a new market requires more than local knowledge. It requires a strategic understanding of how intellectual property, contracts, regulation and innovation interact.',
    '', '', '', '', '', ''
  ),
  (
    'intl_ip', 'INTELLECTUAL PROPERTY',
    'Protect your intellectual property in Brazil', '',
    'Brazil is one of the world''s major markets. Protecting your brand, technology and other intellectual assets locally should be part of your market-entry strategy.',
    '', 'Protect your IP in Brazil', '#contact', '', '', ''
  ),
  (
    'intl_market_entry', 'BRAZIL MARKET ENTRY',
    'Entering the Brazilian market?', '',
    'Brazil offers significant commercial and innovation opportunities, but navigating its legal, intellectual property and regulatory environment requires local expertise.',
    '', 'Discuss your Brazil market entry', '#contact', '', '', ''
  ),
  (
    'intl_innovation', 'INNOVATION & TECHNOLOGY TRANSFER',
    'Build innovation partnerships in Brazil', '',
    'Brazil has a diverse innovation ecosystem connecting companies, universities, research institutions, startups and technology-based organizations. We support companies seeking to establish or structure these relationships.',
    '', 'Discuss an innovation project', '#contact', '', '', ''
  ),
  (
    'intl_law_firms', 'FOR INTERNATIONAL LAW FIRMS',
    'Looking for Brazilian IP support for your clients?',
    'A reliable Brazilian partner for your international practice.',
    'We work with international law firms and intellectual property professionals that need reliable Brazilian support for their clients.',
    'Confidentiality, responsiveness and clear communication are central to our international work.',
    'Discuss a partnership', '#contact', '', '', ''
  ),
  (
    'intl_why', 'WHY BIANCA',
    'Why work with Bianca?', '',
    'A single point of contact combining Brazilian legal expertise, business sense and cross-border communication.',
    '', '', '', '', '', ''
  ),
  (
    'intl_process', 'HOW WE WORK',
    'A clear process for international clients', '',
    'A structured path from first conversation to implementation — you always know where you are and what comes next.',
    '', '', '', '', '', ''
  ),
  (
    'intl_about', 'ABOUT',
    'Brazilian expertise. International perspective.', '',
    'Bianca Martins is a Brazilian lawyer and consultant focused on Intellectual Property, Innovation and Technology Transfer. Her practice sits at the intersection of legal strategy, innovation ecosystems, intellectual property and technology partnerships. She supports companies and organizations dealing with the Brazilian market, helping them protect intellectual assets, structure strategic relationships and navigate innovation opportunities.',
    '', '', '', '', '', '/images/bianca-martins.jpg'
  ),
  (
    'intl_faq', 'FAQ',
    'Questions from international clients', '',
    'Common questions about protecting and commercializing intellectual property and building innovation partnerships in Brazil.',
    '', '', '', '', '', ''
  ),
  (
    'intl_cta', 'NEXT STEP',
    'Planning to enter or expand in Brazil?', '',
    'Let''s discuss your intellectual property, market-entry or innovation needs.',
    '', 'Talk to Bianca', '#contact', 'Send an inquiry', '#contact', ''
  )
on conflict (section_key) do nothing;

-- ================================================================
-- 10.1. SECAO "SOBRE MIM" (HOME) - totalmente editavel no painel
-- Colunas extras do bloco de formação acadêmica e seed da linha home_about.
-- ================================================================
alter table public.page_contents
  add column if not exists academic_title text,
  add column if not exists academic_items text;

insert into public.page_contents
  (section_key, badge_text, title, description, academic_title, academic_items, image_url)
values (
  'home_about',
  'SOBRE',
  E'Quem está por trás\nda ponte entre pesquisa e mercado',
  '<p>Por muito tempo, minha atuação girou em torno de propriedade intelectual. Foi nesse caminho que percebi um problema maior: empresas que querem inovar em parceria com universidades esbarram em um processo para o qual raramente estão preparadas, que é negociar projetos, definir contrapartidas, entender prazos e cláusulas que não aparecem em um contrato comercial comum.</p><p>Foi por isso que ampliei minha atuação. Hoje, ajudo empresas a estruturar e negociar projetos de transferência de tecnologia com universidades, do primeiro contato até a assinatura do contrato, para que a inovação não trave por falta de estrutura.</p><p>Se a sua empresa está buscando ou já iniciou uma parceria com universidade para um projeto de inovação, aqui eu ajudo com conteúdos sobre esse tema.</p>',
  'Formação acadêmica',
  '<p><strong>Universidade Estadual de Maringá (UEM)</strong><br />Mestre em Propriedade Intelectual, Transferência de Tecnologia para Inovação, Sandbox regulatório e inovação no setor público (2020 – 2024). Apoio à elaboração de legislação e normas internas sobre inovação.</p><p><strong>Universidade Estadual de Londrina (UEL)</strong><br />Graduada em Direito (2012 – 2017).</p>',
  '/images/bianca-martins.jpg'
)
on conflict (section_key) do nothing;

-- Artigos de exemplo
insert into public.articles
  (title, slug, category, summary, content, cover_image_url, is_published, author)
values
  (
    'O que e transferencia de tecnologia e por que sua empresa deveria se importar',
    'o-que-e-transferencia-de-tecnologia',
    'transferencia-de-tecnologia',
    'Entenda o conceito de transferencia de tecnologia, suas modalidades e por que ele e decisivo para empresas que querem inovar com seguranca.',
    '## O que e transferencia de tecnologia?\n\nA transferencia de tecnologia e o processo pelo qual conhecimentos, habilidades, tecnologias e ativos de propriedade intelectual passam de uma instituicao (como uma universidade) para outra (como uma empresa) para serem desenvolvidos e comercializados.\n\n## Por que isso importa?\n\nEm um mercado cada vez mais competitivo, a transferencia formal e a diferenca entre inovar com seguranca juridica ou depender de acordos informais repletos de riscos.\n\nEste e o primeiro texto de uma serie. Volte em breve ou fale comigo para saber mais.',
    '',
    true,
    'Bianca Martins'
  ),
  (
    'Propriedade Intelectual na pratica: do segredo industrial a patente',
    'propriedade-intelectual-na-pratica',
    'propriedade-intelectual',
    'Do que e publico ao que e segredo: saiba como escolher a estrategia de protecao certa para cada criacao.',
    '## Nao existe caminho unico\n\nCada ativo intelectual pede uma estrategia diferente. Enquanto a patente exige divulgacao e novidade, o segredo industrial protege justamente o que nao deve ser revelado.\n\n## Patente\n\nA patente garante exclusividade por um periodo em troca da divulgacao completa da invencao.\n\n## Segredo de negocio\n\nTem prazo indeterminado, mas exige medidas robustas de confidencialidade.',
    '',
    true,
    'Bianca Martins'
  ),
  (
    'Contratos de codesenvolvimento: o que negociar antes de assinar',
    'contratos-codesenvolvimento',
    'contratos-e-parcerias',
    'Empresas e ICTs estao cada vez mais desenvolvendo tecnologia juntas. Veja as clausulas que nao podem faltar.',
    '## O contexto\n\nOs contratos de codesenvolvimento entre empresa e ICT cresceram muito, impulsionados por editais e pela cultura de inovacao aberta.\n\n## Clausulas criticas\n\n1. Titularidade e divisao do resultado\n2. Regras de sigilo e uso de dados\n3. Exploracao comercial e royalties\n4. Propriedade intelectual pre-existente\n\n## Conclusao\n\nAntes de assinar, e fundamental alinhar quem e dono de que e como o resultado sera explorado.',
    '',
    false,
    'Bianca Martins'
  )
on conflict (slug) do nothing;

