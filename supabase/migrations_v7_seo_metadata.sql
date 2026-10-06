-- ================================================================
-- v7 — SEO dinâmico editável (DeepSeek) em todas as tabelas de conteúdo
-- ----------------------------------------------------------------
-- Adiciona a coluna `seo_metadata` (jsonb) em services, articles e
-- page_contents. O objeto guardado é:
--   { meta_title, meta_description, meta_keywords,
--     og_title, og_description, og_image, source, generated_at }
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- ================================================================

-- 1) Coluna jsonb (fonte única de verdade do SEO editável)
alter table public.services
  add column if not exists seo_metadata jsonb not null default '{}'::jsonb;

alter table public.articles
  add column if not exists seo_metadata jsonb not null default '{}'::jsonb;

alter table public.page_contents
  add column if not exists seo_metadata jsonb not null default '{}'::jsonb;

-- 2) Compatibilidade: meta_title dedicado nos artigos (o restante vive no jsonb)
alter table public.articles
  add column if not exists meta_title text;

-- 3) Backfill: aproveita o que já existe (meta_description / tags dos artigos)
update public.articles
set seo_metadata = jsonb_strip_nulls(
      jsonb_build_object(
        'meta_description', nullif(meta_description, ''),
        'meta_keywords', case
          when tags is null or array_length(tags, 1) is null then null
          else array_to_string(tags, ', ')
        end,
        'source', 'auto'
      )
    )
where (meta_description is not null or array_length(tags, 1) is not null)
  and (seo_metadata is null or seo_metadata = '{}'::jsonb);

-- 4) Índices GIN para consultas por chave de SEO (filtros futuros no painel)
create index if not exists idx_services_seo_metadata
  on public.services using gin (seo_metadata);
create index if not exists idx_articles_seo_metadata
  on public.articles using gin (seo_metadata);
create index if not exists idx_page_contents_seo_metadata
  on public.page_contents using gin (seo_metadata);

-- 5) Documentação inline
comment on column public.services.seo_metadata is
  'SEO editável (DeepSeek): meta_title, meta_description, meta_keywords, og_*';
comment on column public.articles.seo_metadata is
  'SEO editável (DeepSeek): meta_title, meta_description, meta_keywords, og_*';
comment on column public.page_contents.seo_metadata is
  'SEO editável (DeepSeek): meta_title, meta_description, meta_keywords, og_*';
