-- ================================================================
-- Migracao v4 — Bucket publico de uploads do painel
-- Cria o bucket "uploads" no Supabase Storage e as politicas de acesso
-- usadas pelo input de arquivo da imagem do Hero (campo IMAGE_FILE).
-- Idempotente: pode ser executada mais de uma vez sem efeito colateral.
-- ================================================================

-- Bucket publico (leitura aberta, escrita via service_role / autenticado).
insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Upload/atualizacao/exclusao por usuario autenticado (painel).
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

-- Leitura publica das imagens enviadas pelo painel.
drop policy if exists "uploads_public_read" on storage.objects;
create policy "uploads_public_read"
  on storage.objects for select
  using (bucket_id = 'uploads');
