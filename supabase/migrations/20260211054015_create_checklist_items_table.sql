-- Create checklist_items table for Ops Map
-- Checklist items belong to core activities

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.core_activities(id) on delete cascade,
  text text not null,
  order_index integer not null default 0,
  completed boolean not null default false,
  video_url text
);

-- Index for fast lookup by activity
create index checklist_items_activity_id_idx on public.checklist_items(activity_id);

-- Enable Row Level Security
alter table public.checklist_items enable row level security;

-- RLS Policy: Users can view checklist items in their workspaces (through activities→workspaces chain)
create policy "Users can view checklist_items in their workspaces"
  on public.checklist_items
  for select
  using (
    activity_id in (
      select ca.id from public.core_activities ca
      join public.workspaces w on ca.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert checklist items in their workspaces
create policy "Users can insert checklist_items in their workspaces"
  on public.checklist_items
  for insert
  with check (
    activity_id in (
      select ca.id from public.core_activities ca
      join public.workspaces w on ca.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update checklist items in their workspaces
create policy "Users can update checklist_items in their workspaces"
  on public.checklist_items
  for update
  using (
    activity_id in (
      select ca.id from public.core_activities ca
      join public.workspaces w on ca.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete checklist items in their workspaces
create policy "Users can delete checklist_items in their workspaces"
  on public.checklist_items
  for delete
  using (
    activity_id in (
      select ca.id from public.core_activities ca
      join public.workspaces w on ca.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
grant all on public.checklist_items to authenticated;
