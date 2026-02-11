-- Create junction tables for many-to-many relationships
-- Links activities to sub_functions, steps, roles, people, and software

-- ============================================================
-- SUB_FUNCTION_ACTIVITIES (links sub_functions to core_activities)
-- ============================================================

create table public.sub_function_activities (
  sub_function_id uuid not null references public.sub_functions(id) on delete cascade,
  activity_id uuid not null references public.core_activities(id) on delete cascade,
  primary key (sub_function_id, activity_id)
);

create index sub_function_activities_activity_idx on public.sub_function_activities(activity_id);
alter table public.sub_function_activities enable row level security;

create policy "sub_function_activities_select" on public.sub_function_activities for select
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "sub_function_activities_insert" on public.sub_function_activities for insert
  with check (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "sub_function_activities_delete" on public.sub_function_activities for delete
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

grant all on public.sub_function_activities to authenticated;

-- ============================================================
-- STEP_ACTIVITIES (links steps to core_activities)
-- ============================================================

create table public.step_activities (
  step_id uuid not null references public.steps(id) on delete cascade,
  activity_id uuid not null references public.core_activities(id) on delete cascade,
  primary key (step_id, activity_id)
);

create index step_activities_activity_idx on public.step_activities(activity_id);
alter table public.step_activities enable row level security;

create policy "step_activities_select" on public.step_activities for select
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "step_activities_insert" on public.step_activities for insert
  with check (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "step_activities_delete" on public.step_activities for delete
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

grant all on public.step_activities to authenticated;

-- ============================================================
-- ACTIVITY_ROLES (links core_activities to roles)
-- ============================================================

create table public.activity_roles (
  activity_id uuid not null references public.core_activities(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  primary key (activity_id, role_id)
);

create index activity_roles_role_idx on public.activity_roles(role_id);
alter table public.activity_roles enable row level security;

create policy "activity_roles_select" on public.activity_roles for select
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "activity_roles_insert" on public.activity_roles for insert
  with check (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "activity_roles_delete" on public.activity_roles for delete
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

grant all on public.activity_roles to authenticated;

-- ============================================================
-- ACTIVITY_PEOPLE (links core_activities to people)
-- ============================================================

create table public.activity_people (
  activity_id uuid not null references public.core_activities(id) on delete cascade,
  person_id uuid not null references public.people(id) on delete cascade,
  primary key (activity_id, person_id)
);

create index activity_people_person_idx on public.activity_people(person_id);
alter table public.activity_people enable row level security;

create policy "activity_people_select" on public.activity_people for select
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "activity_people_insert" on public.activity_people for insert
  with check (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "activity_people_delete" on public.activity_people for delete
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

grant all on public.activity_people to authenticated;

-- ============================================================
-- ACTIVITY_SOFTWARE (links core_activities to software)
-- ============================================================

create table public.activity_software (
  activity_id uuid not null references public.core_activities(id) on delete cascade,
  software_id uuid not null references public.software(id) on delete cascade,
  primary key (activity_id, software_id)
);

create index activity_software_software_idx on public.activity_software(software_id);
alter table public.activity_software enable row level security;

create policy "activity_software_select" on public.activity_software for select
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "activity_software_insert" on public.activity_software for insert
  with check (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

create policy "activity_software_delete" on public.activity_software for delete
  using (activity_id in (select id from public.core_activities where workspace_id in 
    (select id from public.workspaces where user_id = auth.uid())));

grant all on public.activity_software to authenticated;
