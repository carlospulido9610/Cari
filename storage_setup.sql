-- Create the storage bucket 'product-images'
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- Allow public access to view images
create policy "Public Access"
  on storage.objects for select
  using ( bucket_id = 'product-images' );

-- Allow authenticated users to upload images
create policy "Authenticated Upload"
  on storage.objects for insert
  with check ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- Allow authenticated users to update images
create policy "Authenticated Update"
  on storage.objects for update
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );

-- Allow authenticated users to delete images
create policy "Authenticated Delete"
  on storage.objects for delete
  using ( bucket_id = 'product-images' and auth.role() = 'authenticated' );
