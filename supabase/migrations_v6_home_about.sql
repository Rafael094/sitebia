-- ================================================================
-- Supabase: migracao v6 — secao "Sobre mim" (home_about) 100% editavel
-- ----------------------------------------------------------------
-- Torna editavel pelo painel todo o bloco "Sobre" da Home:
--   badge_text      -> rotulo "SOBRE"
--   title           -> titulo (quebras de linha viram <br/>; **texto** fica dourado)
--   description     -> paragrafos do texto de apresentacao (texto rico/HTML)
--   academic_title  -> titulo do bloco de formacao academica (NOVO)
--   academic_items  -> itens da formacao academica em HTML (NOVO)
--   image_url       -> fotografia profissional (upload pelo painel)
--
-- Idempotente: pode rodar mais de uma vez sem erro.
-- Nao sobrescreve conteudo ja editado: apos garantir a linha, apenas
-- preenche os campos academic_* quando estiverem vazios.
--
-- Execute no SQL Editor do Supabase (Dashboard > SQL Editor).
-- Requer a tabela public.page_contents (migrations_v2_sections_seo.sql).
-- ================================================================

create extension if not exists "pgcrypto";

-- 1) Colunas novas do bloco de formacao academica.
alter table public.page_contents
  add column if not exists academic_title text,
  add column if not exists academic_items text;

-- 2) Garante a linha home_about (cria com o texto atual se ainda nao existir).
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

-- 3) Completa apenas os campos novos quando ainda estiverem vazios.
update public.page_contents set
  academic_title = coalesce(nullif(academic_title, ''), 'Formação acadêmica'),
  academic_items = coalesce(
    nullif(academic_items, ''),
    '<p><strong>Universidade Estadual de Maringá (UEM)</strong><br />Mestre em Propriedade Intelectual, Transferência de Tecnologia para Inovação, Sandbox regulatório e inovação no setor público (2020 – 2024). Apoio à elaboração de legislação e normas internas sobre inovação.</p><p><strong>Universidade Estadual de Londrina (UEL)</strong><br />Graduada em Direito (2012 – 2017).</p>'
  )
where section_key = 'home_about';
