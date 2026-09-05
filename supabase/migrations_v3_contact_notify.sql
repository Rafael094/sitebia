-- ============================================================================
-- Migration v3 — Envio de e-mails de contato + anti-spam
--
-- 1. site_settings.contact_recipient_email
--    E-mail de DESTINO para onde Bianca recebe as mensagens do formulário do
--    site (editável no painel /admin/configuracoes). Se ficar vazio cai no
--    padrão (contact_email) e, por fim, em SMTP_USER do .env.local.
--
-- 2. tabela contact_rate_limits
--    Rate limiting por IP (3 envios / hora). Mantida apenas pelo servidor
--    (service_role) — público NUNCA lê/escreve nela.
--
-- Executar no SQL Editor do painel Supabase.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Coluna de e-mail de destino das notificações
-- ---------------------------------------------------------------------------
alter table public.site_settings
  add column if not exists contact_recipient_email text not null default '';

-- ---------------------------------------------------------------------------
-- 2. Tabela de controle de envio por IP (anti-spam)
-- ---------------------------------------------------------------------------
create table if not exists public.contact_rate_limits (
  ip           text primary key,
  window_start timestamptz not null default now(),  -- início da janela de 1h
  count        int          not null default 1
);

-- Restringe qualquer acesso anônimo; somente a service_role (servidor) opera.
alter table public.contact_rate_limits enable row level security;
drop policy if exists "contact_rate_limits_anon_block" on public.contact_rate_limits;
-- Sem políticas abertas: bloqueia anon/authenticated, libera apenas service_role.
