-- neurospace accounts: one profile per signed-in person, and their finished exercises.
-- Every row belongs to one auth user. Row-level security makes sure nobody reads or writes another person's rows.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 30),
  created_at timestamptz not null default now()
);

create table public.sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  exercise_id text not null,
  zone text not null check (zone in ('breath', 'balance', 'reach', 'ground', 'rest')),
  seconds integer not null check (seconds > 0 and seconds <= 3600),
  completed_at timestamptz not null default now()
);

create index sessions_user_completed_idx on public.sessions (user_id, completed_at);

alter table public.profiles enable row level security;
alter table public.sessions enable row level security;

create policy "Own profile" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "Own sessions" on public.sessions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
