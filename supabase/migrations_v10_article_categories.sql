-- ============================================================================
-- Migration v10 — Categorias de conteúdo editáveis pelo painel
--
-- 1. Cria a tabela public.article_categories.
-- 2. Semeia as três categorias atuais (sem alterar os artigos existentes).
-- 3. Converte articles.category de ENUM para TEXT, permitindo novos slugs.
-- 4. Vincula articles.category à tabela (FK com ON UPDATE CASCADE).
-- 5. Configura RLS: leitura pública / escrita apenas para autenticados.
--
-- Executar no SQL Editor do painel Supabase.
-- Depois, recarregue /admin/conteudos/categorias.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Tabela de categorias
-- ---------------------------------------------------------------------------
create table if not exists public.article_categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  label       text not null,
  description text not null default '',
  order_index int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 2. Categorias atuais (seed idempotente)
-- ---------------------------------------------------------------------------
insert into public.article_categories
  (slug, label, description, order_index, is_active)
values
  (
    'transferencia-de-tecnologia',
    'Transferência de Tecnologia',
    'Licenciamento, cessão e inovação aberta.',
    10,
    true
  ),
  (
    'propriedade-intelectual',
    'Propriedade Intelectual',
    'Patentes, marcas, direitos autorais e segredos.',
    20,
    true
  ),
  (
    'contratos-e-parcerias',
    'Contratos & Parcerias',
    'Acordos, codesenvolvimento e parcerias de P&D.',
    30,
    true
  )
on conflict (slug) do nothing;

-- Preserva qualquer categoria que já exista em artigos e não esteja no seed.
insert into public.article_categories
  (slug, label, description, order_index, is_active)
select distinct
  a.category::text,
  initcap(replace(a.category::text, '-', ' ')),
  '',
  100,
  true
from public.articles a
where a.category is not null
  and btrim(a.category::text) <> ''
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- 3. articles.category: ENUM -> TEXT
-- ---------------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'articles'
      and column_name = 'category'
      and udt_name = 'article_category'
  ) then
    alter table public.articles
      alter column category type text using category::text;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 4. FK: artigos apontam para a categoria editável
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'articles_category_fk'
      and conrelid = 'public.articles'::regclass
  ) then
    alter table public.articles
      add constraint articles_category_fk
      foreign key (category)
      references public.article_categories (slug)
      on update cascade
      on delete restrict;
  end if;
end $$;

-- ---------------------------------------------------------------------------
-- 5. Índices, RLS e updated_at
-- ---------------------------------------------------------------------------
create index if not exists idx_article_categories_order
  on public.article_categories (order_index, label);

alter table public.article_categories enable row level security;

drop policy if exists "article_categories_public_read" on public.article_categories;
create policy "article_categories_public_read"
  on public.article_categories for select
  using (true);

drop policy if exists "article_categories_auth_all" on public.article_categories;
create policy "article_categories_auth_all"
  on public.article_categories for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create or replace function public.set_updated_at()
returns trigger as $fn$
begin
  new.updated_at = now();
  return new;
end;
$fn$ language plpgsql;

drop trigger if exists trg_article_categories_updated_at
  on public.article_categories;
create trigger trg_article_categories_updated_at
  before update on public.article_categories
  for each row execute function public.set_updated_at();

-- Garante que a API do Supabase enxergue a tabela imediatamente.
notify pgrst, 'reload schema';
