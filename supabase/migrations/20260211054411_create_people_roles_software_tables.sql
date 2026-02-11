-- Create roles, software, and people tables for Ops Map
-- Note: roles/software created first as people references roles

-- ============================================================
-- ROLES TABLE
-- ============================================================

create table public.roles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text
);

create index roles_workspace_id_idx on public.roles(workspace_id);
alter table public.roles enable row level security;

create policy "Users can view roles in their workspaces"
  on public.roles for select
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can insert roles in their workspaces"
  on public.roles for insert
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can update roles in their workspaces"
  on public.roles for update
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can delete roles in their workspaces"
  on public.roles for delete
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

grant all on public.roles to authenticated;

-- ============================================================
-- SOFTWARE TABLE
-- ============================================================

create table public.software (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  url text
);

create index software_workspace_id_idx on public.software(workspace_id);
alter table public.software enable row level security;

create policy "Users can view software in their workspaces"
  on public.software for select
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can insert software in their workspaces"
  on public.software for insert
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can update software in their workspaces"
  on public.software for update
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can delete software in their workspaces"
  on public.software for delete
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

grant all on public.software to authenticated;

-- ============================================================
-- PEOPLE TABLE
-- ============================================================

create table public.people (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  email text,
  title text,
  role_id uuid references public.roles(id) on delete set null,
  reports_to uuid references public.people(id) on delete set null
);

create index people_workspace_id_idx on public.people(workspace_id);
create index people_role_id_idx on public.people(role_id);
create index people_reports_to_idx on public.people(reports_to);
alter table public.people enable row level security;

create policy "Users can view people in their workspaces"
  on public.people for select
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can insert people in their workspaces"
  on public.people for insert
  with check (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can update people in their workspaces"
  on public.people for update
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

create policy "Users can delete people in their workspaces"
  on public.people for delete
  using (workspace_id in (select id from public.workspaces where user_id = auth.uid()));

grant all on public.people to authenticated;
