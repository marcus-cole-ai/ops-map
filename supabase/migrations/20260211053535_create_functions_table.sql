-- Create functions table for Ops Map
-- Functions represent business areas/departments within a workspace

create table public.functions (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active',
  order_index integer not null default 0,
  color text
);

-- Index for fast lookup by workspace
create index functions_workspace_id_idx on public.functions(workspace_id);

-- Enable Row Level Security
alter table public.functions enable row level security;

-- RLS Policy: Users can view functions in their workspaces
create policy "Users can view functions in their workspaces"
  on public.functions
  for select
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert functions in their workspaces
create policy "Users can insert functions in their workspaces"
  on public.functions
  for insert
  with check (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update functions in their workspaces
create policy "Users can update functions in their workspaces"
  on public.functions
  for update
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete functions in their workspaces
create policy "Users can delete functions in their workspaces"
  on public.functions
  for delete
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
grant all on public.functions to authenticated;
