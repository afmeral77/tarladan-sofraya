-- Product photos may be uploaded or removed only by the signed-in producer
-- whose UUID owns the first folder segment. Public read is provided by the
-- public bucket; no anonymous write/update/delete permission is introduced.

drop policy if exists "tfs_product_images_insert_own_prefix" on storage.objects;
drop policy if exists "tfs_product_images_update_own_prefix" on storage.objects;
drop policy if exists "tfs_product_images_delete_own_prefix" on storage.objects;

create policy "tfs_product_images_insert_own_prefix"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_profile_role('producer'::public.profile_role))
  );

create policy "tfs_product_images_update_own_prefix"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_profile_role('producer'::public.profile_role))
  )
  with check (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_profile_role('producer'::public.profile_role))
  );

create policy "tfs_product_images_delete_own_prefix"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'product-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select private.is_profile_role('producer'::public.profile_role))
  );
