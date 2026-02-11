-- Create sub_functions table for Ops Map
-- Sub-functions are subdivisions within a function

create table public.sub_functions (
  id uuid primary key default gen_random_uuid(),
  function_id uuid not null references public.functions(id) on delete cascade,
  name text not null,
  description text,
  status text not null default 'active',
  order_index integer not null default 0
);

-- Index for fast lookup by function
create index sub_functions_function_id_idx on public.sub_functions(function_id);

-- Enable Row Level Security
alter table public.sub_functions enable row level security;

-- RLS Policy: Users can view sub_functions in their workspaces (via functions)
create policy "Users can view sub_functions in their workspaces"
  on public.sub_functions
  for select
  using (
    function_id in (
      select f.id from public.functions f
      join public.workspaces w on f.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can insert sub_functions in their workspaces
create policy "Users can insert sub_functions in their workspaces"
  on public.sub_functions
  for insert
  with check (
    function_id in (
      select f.id from public.functions f
      join public.workspaces w on f.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can update sub_functions in their workspaces
create policy "Users can update sub_functions in their workspaces"
  on public.sub_functions
  for update
  using (
    function_id in (
      select f.id from public.functions f
      join public.workspaces w on f.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- RLS Policy: Users can delete sub_functions in their workspaces
create policy "Users can delete sub_functions in their workspaces"
  on public.sub_functions
  for delete
  using (
    function_id in (
      select f.id from public.functions f
      join public.workspaces w on f.workspace_id = w.id
      where w.user_id = auth.uid()
    )
  );

-- Grant access to authenticated users
grant all on public.sub_functions to authenticated;
