
-- 1. Create a public bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

-- 2. Set up security policies

-- Allow public access to view avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Allow authenticated users to upload their own avatar
create policy "Users can upload their own avatar."
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' and
    auth.uid() = (storage.foldername(name))[1]::uuid
  );

-- Allow users to update their own avatar
create policy "Users can update their own avatar."
  on storage.objects for update
  using (
    bucket_id = 'avatars' and
    auth.uid() = (storage.foldername(name))[1]::uuid
  );
