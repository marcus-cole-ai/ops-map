-- Create workspaces table for Ops Map
-- Each workspace belongs to a user and contains their entire ops map configuration

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  company_profile jsonb not null default '{}'::jsonb,
  ai_settings jsonb not null default '{}'::jsonb
);

-- Index for fast lookup by user
create index workspaces_user_id_idx on public.workspaces(user_id);

-- Enable Row Level Security
alter table public.workspaces enable row level security;

-- RLS Policy: Users can only see their own workspaces
create policy "Users can view their own workspaces"
  on public.workspaces
  for select
  using (auth.uid() = user_id);

-- RLS Policy: Users can only insert their own workspaces
create policy "Users can insert their own workspaces"
  on public.workspaces
  for insert
  with check (auth.uid() = user_id);

-- RLS Policy: Users can only update their own workspaces
create policy "Users can update their own workspaces"
  on public.workspaces
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- RLS Policy: Users can only delete their own workspaces
create policy "Users can delete their own workspaces"
  on public.workspaces
  for delete
  using (auth.uid() = user_id);

-- Grant access to authenticated users
grant all on public.workspaces to authenticated;
grant usage on schema public to authenticated;
