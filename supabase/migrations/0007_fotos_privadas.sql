-- =====================================================================
-- 0007_fotos_privadas.sql
-- YL Nutrición · Bucket privado para fotos de progreso y de comidas.
--
-- Las fotos son el dato más sensible que guarda la app. El bucket es
-- privado y cada usuario solo puede tocar su propia carpeta:
--   user-photos/<auth.uid()>/progress/...
--   user-photos/<auth.uid()>/meal/...
-- La app nunca recibe una URL pública; pide URLs firmadas y temporales.
-- =====================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('user-photos', 'user-photos', false, 8388608, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Solo la carpeta propia. `storage.foldername(name)[1]` es el primer segmento de la ruta.
drop policy if exists "user_photos_select_own" on storage.objects;
create policy "user_photos_select_own" on storage.objects
  for select to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "user_photos_insert_own" on storage.objects;
create policy "user_photos_insert_own" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'user-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "user_photos_update_own" on storage.objects;
create policy "user_photos_update_own" on storage.objects
  for update to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "user_photos_delete_own" on storage.objects;
create policy "user_photos_delete_own" on storage.objects
  for delete to authenticated
  using (bucket_id = 'user-photos' and (storage.foldername(name))[1] = auth.uid()::text);
