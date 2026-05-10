-- Olys V2.2 - Fase 6: security, storage, RLS and Admin baseline.
-- This migration is intentionally additive and fail-closed.

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin')),
  granted_by uuid references auth.users(id) on delete set null,
  granted_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  target_table text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.user_roles enable row level security;
alter table public.admin_audit_log enable row level security;

do $$
declare
  target_table text;
begin
  foreach target_table in array array['profiles', 'items', 'sub_items', 'inbox', 'habit_logs']
  loop
    if to_regclass('public.' || target_table) is not null then
      execute format('alter table public.%I enable row level security', target_table);
    end if;
  end loop;
end $$;

create or replace function public.is_admin(check_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = check_user_id
      and role = 'admin'
  );
$$;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'Users can read their own roles') then
    create policy "Users can read their own roles" on public.user_roles
      for select using (user_id = auth.uid());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'user_roles' and policyname = 'Admins can manage roles') then
    create policy "Admins can manage roles" on public.user_roles
      for all using (public.is_admin()) with check (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_audit_log' and policyname = 'Admins can read audit log') then
    create policy "Admins can read audit log" on public.admin_audit_log
      for select using (public.is_admin());
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'admin_audit_log' and policyname = 'Admins can insert audit log') then
    create policy "Admins can insert audit log" on public.admin_audit_log
      for insert with check (public.is_admin(actor_user_id));
  end if;
end $$;

do $$
declare
  target_table text;
  owner_column text;
begin
  foreach target_table in array array['profiles', 'items', 'sub_items', 'inbox', 'habit_logs']
  loop
    if to_regclass('public.' || target_table) is null then
      continue;
    end if;

    owner_column := case when target_table = 'profiles' then 'id' else 'user_id' end;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = target_table and policyname = target_table || ' owner select') then
      execute format('create policy %I on public.%I for select using (%I = auth.uid())', target_table || ' owner select', target_table, owner_column);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = target_table and policyname = target_table || ' owner insert') then
      execute format('create policy %I on public.%I for insert with check (%I = auth.uid())', target_table || ' owner insert', target_table, owner_column);
    end if;

    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = target_table and policyname = target_table || ' owner update') then
      execute format('create policy %I on public.%I for update using (%I = auth.uid()) with check (%I = auth.uid())', target_table || ' owner update', target_table, owner_column, owner_column);
    end if;

    if target_table <> 'profiles' and not exists (select 1 from pg_policies where schemaname = 'public' and tablename = target_table and policyname = target_table || ' owner delete') then
      execute format('create policy %I on public.%I for delete using (%I = auth.uid())', target_table || ' owner delete', target_table, owner_column);
    end if;
  end loop;
end $$;

insert into storage.buckets (id, name, public)
values ('media', 'media', false)
on conflict (id) do update set public = false;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can read own media') then
    create policy "Users can read own media" on storage.objects
      for select using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload own media') then
    create policy "Users can upload own media" on storage.objects
      for insert with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update own media') then
    create policy "Users can update own media" on storage.objects
      for update using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text)
      with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete own media') then
    create policy "Users can delete own media" on storage.objects
      for delete using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
  end if;
end $$;
