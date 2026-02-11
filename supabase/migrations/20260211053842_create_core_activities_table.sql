-- Create core_activities table for Ops Map
-- Core activities are the fundamental operational tasks linked to a workspace

create table public.core_activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  full_description text,
  status text not null default 'draft',
  video_url text,
  video_type text,
  checklist_trigger text,
  checklist_end_state text,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

-- Index for fast lookup by workspace
create index core_activities_workspace_id_idx on public.core_activities(workspace_id);

-- Enable Row Level Security
alter table public.core_activities enable row level security;

-- RLS Policy: Users can view activities in their workspaces
create policy "Users can view core_activities in their workspaces"
  on public.core_activities
  for select
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert activities in their workspaces
create policy "Users can insert core_activities in their workspaces"
  on public.core_activities
  for insert
  with check (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update activities in their workspaces
create policy "Users can update core_activities in their workspaces"
  on public.core_activities
  for update
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete activities in their workspaces
create policy "Users can delete core_activities in their workspaces"
  on public.core_activities
  for delete
  using (
    workspace_id in (
      select id from public.workspaces where user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
grant all on public.core_activities to authenticated;
