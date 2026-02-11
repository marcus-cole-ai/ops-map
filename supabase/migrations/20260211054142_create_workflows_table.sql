-- Create workflows table for Ops Map
-- Workflows define operational processes composed of phases and steps

create table public.workflows (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  published_at timestamptz
);

-- Index for fast lookup by workspace
create index workflows_workspace_id_idx on public.workflows(workspace_id);

-- Enable Row Level Security
alter table public.workflows enable row level security;

-- RLS Policy: Users can view workflows in their workspaces
create policy "Users can view workflows in their workspaces"
  on public.workflows
  for select
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert workflows in their workspaces
create policy "Users can insert workflows in their workspaces"
  on public.workflows
  for insert
  with check (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update workflows in their workspaces
create policy "Users can update workflows in their workspaces"
  on public.workflows
  for update
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete workflows in their workspaces
create policy "Users can delete workflows in their workspaces"
  on public.workflows
  for delete
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
grant all on public.workflows to authenticated;
