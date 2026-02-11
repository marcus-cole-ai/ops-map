-- Create phases and steps tables for Ops Map
-- Phases group steps within a workflow; steps are individual SOP items

-- ============================================================
-- PHASES TABLE
-- ============================================================

create table public.phases (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  name text not null,
  order_index integer not null default 0
);

create index phases_workflow_id_idx on public.phases(workflow_id);

alter table public.phases enable row level security;

-- RLS: Chain through workflows → workspaces
create policy "Users can view phases in their workflows"
  on public.phases for select
  using (
    workflow_id in (
      select w.id from public.workflows w
      join public.workspaces ws on w.workspace_id = ws.id
      where ws.user_id = auth.uid()
    )
  );

create policy "Users can insert phases in their workflows"
  on public.phases for insert
  with check (
    workflow_id in (
      select w.id from public.workflows w
      join public.workspaces ws on w.workspace_id = ws.id
      where ws.user_id = auth.uid()
    )
  );

create policy "Users can update phases in their workflows"
  on public.phases for update
  using (
    workflow_id in (
      select w.id from public.workflows w
      join public.workspaces ws on w.workspace_id = ws.id
      where ws.user_id = auth.uid()
    )
  );

create policy "Users can delete phases in their workflows"
  on public.phases for delete
  using (
    workflow_id in (
      select w.id from public.workflows w
      join public.workspaces ws on w.workspace_id = ws.id
      where ws.user_id = auth.uid()
    )
  );

grant all on public.phases to authenticated;

-- ============================================================
-- STEPS TABLE
-- ============================================================

create table public.steps (
  id uuid primary key default gen_random_uuid(),
  phase_id uuid not null references public.phases(id) on delete cascade,
  name text not null,
  order_index integer not null default 0,
  sop_video_url text,
  sop_video_type text
);

create index steps_phase_id_idx on public.steps(phase_id);

alter table public.steps enable row level security;

-- RLS: Chain through phases → workflows → workspaces
create policy "Users can view steps in their phases"
  on public.steps for select
  using (
    phase_id in (
      select p.id from public.phases p
      join public.workflows w on p.workflow_id = w.id
      join public.workspaces ws on w.workspace_id = ws.id
      where ws.user_id = auth.uid()
    )
  );

create policy "Users can insert steps in their phases"
  on public.steps for insert
  with check (
    phase_id in (
      select p.id from public.phases p
      join public.workflows w on p.workflow_id = w.id
      join public.workspaces ws on w.workspace_id = ws.id
      where ws.user_id = auth.uid()
    )
  );

create policy "Users can update steps in their phases"
  on public.steps for update
  using (
    phase_id in (
      select p.id from public.phases p
      join public.workflows w on p.workflow_id = w.id
      join public.workspaces ws on w.workspace_id = ws.id
      where ws.user_id = auth.uid()
    )
  );

create policy "Users can delete steps in their phases"
  on public.steps for delete
  using (
    phase_id in (
      select p.id from public.phases p
      join public.workflows w on p.workflow_id = w.id
      join public.workspaces ws on w.workspace_id = ws.id
      where ws.user_id = auth.uid()
    )
  );

grant all on public.steps to authenticated;
