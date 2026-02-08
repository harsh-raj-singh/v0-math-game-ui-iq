-- Profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- Game stats table (one row per user)
create table if not exists public.game_stats (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  total_problems integer default 0,
  total_correct integer default 0,
  best_streak integer default 0,
  total_sessions integer default 0,
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.game_stats enable row level security;

drop policy if exists "game_stats_select_own" on public.game_stats;
create policy "game_stats_select_own" on public.game_stats for select using (auth.uid() = user_id);

drop policy if exists "game_stats_insert_own" on public.game_stats;
create policy "game_stats_insert_own" on public.game_stats for insert with check (auth.uid() = user_id);

drop policy if exists "game_stats_update_own" on public.game_stats;
create policy "game_stats_update_own" on public.game_stats for update using (auth.uid() = user_id);

drop policy if exists "game_stats_delete_own" on public.game_stats;
create policy "game_stats_delete_own" on public.game_stats for delete using (auth.uid() = user_id);

-- User settings table (one row per user)
create table if not exists public.user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  operations text[] default array['addition', 'subtraction', 'multiplication', 'division'],
  theme text default 'dark',
  tts_enabled boolean default true,
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.user_settings enable row level security;

drop policy if exists "user_settings_select_own" on public.user_settings;
create policy "user_settings_select_own" on public.user_settings for select using (auth.uid() = user_id);

drop policy if exists "user_settings_insert_own" on public.user_settings;
create policy "user_settings_insert_own" on public.user_settings for insert with check (auth.uid() = user_id);

drop policy if exists "user_settings_update_own" on public.user_settings;
create policy "user_settings_update_own" on public.user_settings for update using (auth.uid() = user_id);

drop policy if exists "user_settings_delete_own" on public.user_settings;
create policy "user_settings_delete_own" on public.user_settings for delete using (auth.uid() = user_id);

-- Trigger to auto-create profile, game_stats, and user_settings on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;

  insert into public.game_stats (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
