-- Migration: Clerk Third-Party Auth Integration
-- Drop all policies first, alter column, then recreate with auth.jwt()->>'sub'

-- ============================================================================
-- STEP 1: DROP ALL POLICIES (exact names from original migrations)
-- ============================================================================

-- Workspaces
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can insert their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can delete their own workspaces" ON public.workspaces;

-- Functions
DROP POLICY IF EXISTS "Users can view functions in their workspaces" ON public.functions;
DROP POLICY IF EXISTS "Users can insert functions in their workspaces" ON public.functions;
DROP POLICY IF EXISTS "Users can update functions in their workspaces" ON public.functions;
DROP POLICY IF EXISTS "Users can delete functions in their workspaces" ON public.functions;

-- Sub-functions
DROP POLICY IF EXISTS "Users can view sub_functions in their workspaces" ON public.sub_functions;
DROP POLICY IF EXISTS "Users can insert sub_functions in their workspaces" ON public.sub_functions;
DROP POLICY IF EXISTS "Users can update sub_functions in their workspaces" ON public.sub_functions;
DROP POLICY IF EXISTS "Users can delete sub_functions in their workspaces" ON public.sub_functions;

-- Core activities
DROP POLICY IF EXISTS "Users can view core_activities in their workspaces" ON public.core_activities;
DROP POLICY IF EXISTS "Users can insert core_activities in their workspaces" ON public.core_activities;
DROP POLICY IF EXISTS "Users can update core_activities in their workspaces" ON public.core_activities;
DROP POLICY IF EXISTS "Users can delete core_activities in their workspaces" ON public.core_activities;

-- Checklist items
DROP POLICY IF EXISTS "Users can view checklist_items in their workspaces" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can insert checklist_items in their workspaces" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can update checklist_items in their workspaces" ON public.checklist_items;
DROP POLICY IF EXISTS "Users can delete checklist_items in their workspaces" ON public.checklist_items;

-- Workflows
DROP POLICY IF EXISTS "Users can view workflows in their workspaces" ON public.workflows;
DROP POLICY IF EXISTS "Users can insert workflows in their workspaces" ON public.workflows;
DROP POLICY IF EXISTS "Users can update workflows in their workspaces" ON public.workflows;
DROP POLICY IF EXISTS "Users can delete workflows in their workspaces" ON public.workflows;

-- Phases
DROP POLICY IF EXISTS "Users can view phases in their workflows" ON public.phases;
DROP POLICY IF EXISTS "Users can insert phases in their workflows" ON public.phases;
DROP POLICY IF EXISTS "Users can update phases in their workflows" ON public.phases;
DROP POLICY IF EXISTS "Users can delete phases in their workflows" ON public.phases;

-- Steps
DROP POLICY IF EXISTS "Users can view steps in their phases" ON public.steps;
DROP POLICY IF EXISTS "Users can insert steps in their phases" ON public.steps;
DROP POLICY IF EXISTS "Users can update steps in their phases" ON public.steps;
DROP POLICY IF EXISTS "Users can delete steps in their phases" ON public.steps;

-- People
DROP POLICY IF EXISTS "Users can view people in their workspaces" ON public.people;
DROP POLICY IF EXISTS "Users can insert people in their workspaces" ON public.people;
DROP POLICY IF EXISTS "Users can update people in their workspaces" ON public.people;
DROP POLICY IF EXISTS "Users can delete people in their workspaces" ON public.people;

-- Roles
DROP POLICY IF EXISTS "Users can view roles in their workspaces" ON public.roles;
DROP POLICY IF EXISTS "Users can insert roles in their workspaces" ON public.roles;
DROP POLICY IF EXISTS "Users can update roles in their workspaces" ON public.roles;
DROP POLICY IF EXISTS "Users can delete roles in their workspaces" ON public.roles;

-- Software
DROP POLICY IF EXISTS "Users can view software in their workspaces" ON public.software;
DROP POLICY IF EXISTS "Users can insert software in their workspaces" ON public.software;
DROP POLICY IF EXISTS "Users can update software in their workspaces" ON public.software;
DROP POLICY IF EXISTS "Users can delete software in their workspaces" ON public.software;

-- Junction tables
DROP POLICY IF EXISTS "sub_function_activities_select" ON public.sub_function_activities;
DROP POLICY IF EXISTS "sub_function_activities_insert" ON public.sub_function_activities;
DROP POLICY IF EXISTS "sub_function_activities_delete" ON public.sub_function_activities;

DROP POLICY IF EXISTS "step_activities_select" ON public.step_activities;
DROP POLICY IF EXISTS "step_activities_insert" ON public.step_activities;
DROP POLICY IF EXISTS "step_activities_delete" ON public.step_activities;

DROP POLICY IF EXISTS "activity_roles_select" ON public.activity_roles;
DROP POLICY IF EXISTS "activity_roles_insert" ON public.activity_roles;
DROP POLICY IF EXISTS "activity_roles_delete" ON public.activity_roles;

DROP POLICY IF EXISTS "activity_people_select" ON public.activity_people;
DROP POLICY IF EXISTS "activity_people_insert" ON public.activity_people;
DROP POLICY IF EXISTS "activity_people_delete" ON public.activity_people;

DROP POLICY IF EXISTS "activity_software_select" ON public.activity_software;
DROP POLICY IF EXISTS "activity_software_insert" ON public.activity_software;
DROP POLICY IF EXISTS "activity_software_delete" ON public.activity_software;

-- ============================================================================
-- STEP 2: ALTER WORKSPACES TABLE
-- ============================================================================

ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_user_id_fkey;
ALTER TABLE public.workspaces ALTER COLUMN user_id TYPE text;

-- ============================================================================
-- STEP 3: RECREATE ALL POLICIES WITH auth.jwt()->>'sub'
-- ============================================================================

-- Workspaces
CREATE POLICY "Users can view their own workspaces"
  ON public.workspaces FOR SELECT
  USING ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can insert their own workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can update their own workspaces"
  ON public.workspaces FOR UPDATE
  USING ((SELECT auth.jwt()->>'sub') = user_id)
  WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can delete their own workspaces"
  ON public.workspaces FOR DELETE
  USING ((SELECT auth.jwt()->>'sub') = user_id);

-- Functions
CREATE POLICY "Users can view functions in their workspaces"
  ON public.functions FOR SELECT
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can insert functions in their workspaces"
  ON public.functions FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can update functions in their workspaces"
  ON public.functions FOR UPDATE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can delete functions in their workspaces"
  ON public.functions FOR DELETE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

-- Sub-functions
CREATE POLICY "Users can view sub_functions in their workspaces"
  ON public.sub_functions FOR SELECT
  USING (function_id IN (SELECT f.id FROM public.functions f JOIN public.workspaces w ON f.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can insert sub_functions in their workspaces"
  ON public.sub_functions FOR INSERT
  WITH CHECK (function_id IN (SELECT f.id FROM public.functions f JOIN public.workspaces w ON f.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can update sub_functions in their workspaces"
  ON public.sub_functions FOR UPDATE
  USING (function_id IN (SELECT f.id FROM public.functions f JOIN public.workspaces w ON f.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can delete sub_functions in their workspaces"
  ON public.sub_functions FOR DELETE
  USING (function_id IN (SELECT f.id FROM public.functions f JOIN public.workspaces w ON f.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

-- Core activities
CREATE POLICY "Users can view core_activities in their workspaces"
  ON public.core_activities FOR SELECT
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can insert core_activities in their workspaces"
  ON public.core_activities FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can update core_activities in their workspaces"
  ON public.core_activities FOR UPDATE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can delete core_activities in their workspaces"
  ON public.core_activities FOR DELETE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

-- Checklist items
CREATE POLICY "Users can view checklist_items in their workspaces"
  ON public.checklist_items FOR SELECT
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can insert checklist_items in their workspaces"
  ON public.checklist_items FOR INSERT
  WITH CHECK (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can update checklist_items in their workspaces"
  ON public.checklist_items FOR UPDATE
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can delete checklist_items in their workspaces"
  ON public.checklist_items FOR DELETE
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

-- Workflows
CREATE POLICY "Users can view workflows in their workspaces"
  ON public.workflows FOR SELECT
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can insert workflows in their workspaces"
  ON public.workflows FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can update workflows in their workspaces"
  ON public.workflows FOR UPDATE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can delete workflows in their workspaces"
  ON public.workflows FOR DELETE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

-- Phases
CREATE POLICY "Users can view phases in their workflows"
  ON public.phases FOR SELECT
  USING (workflow_id IN (SELECT wf.id FROM public.workflows wf JOIN public.workspaces w ON wf.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can insert phases in their workflows"
  ON public.phases FOR INSERT
  WITH CHECK (workflow_id IN (SELECT wf.id FROM public.workflows wf JOIN public.workspaces w ON wf.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can update phases in their workflows"
  ON public.phases FOR UPDATE
  USING (workflow_id IN (SELECT wf.id FROM public.workflows wf JOIN public.workspaces w ON wf.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can delete phases in their workflows"
  ON public.phases FOR DELETE
  USING (workflow_id IN (SELECT wf.id FROM public.workflows wf JOIN public.workspaces w ON wf.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

-- Steps
CREATE POLICY "Users can view steps in their phases"
  ON public.steps FOR SELECT
  USING (phase_id IN (SELECT p.id FROM public.phases p JOIN public.workflows wf ON p.workflow_id = wf.id JOIN public.workspaces w ON wf.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can insert steps in their phases"
  ON public.steps FOR INSERT
  WITH CHECK (phase_id IN (SELECT p.id FROM public.phases p JOIN public.workflows wf ON p.workflow_id = wf.id JOIN public.workspaces w ON wf.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can update steps in their phases"
  ON public.steps FOR UPDATE
  USING (phase_id IN (SELECT p.id FROM public.phases p JOIN public.workflows wf ON p.workflow_id = wf.id JOIN public.workspaces w ON wf.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "Users can delete steps in their phases"
  ON public.steps FOR DELETE
  USING (phase_id IN (SELECT p.id FROM public.phases p JOIN public.workflows wf ON p.workflow_id = wf.id JOIN public.workspaces w ON wf.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

-- People
CREATE POLICY "Users can view people in their workspaces"
  ON public.people FOR SELECT
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can insert people in their workspaces"
  ON public.people FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can update people in their workspaces"
  ON public.people FOR UPDATE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can delete people in their workspaces"
  ON public.people FOR DELETE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

-- Roles
CREATE POLICY "Users can view roles in their workspaces"
  ON public.roles FOR SELECT
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can insert roles in their workspaces"
  ON public.roles FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can update roles in their workspaces"
  ON public.roles FOR UPDATE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can delete roles in their workspaces"
  ON public.roles FOR DELETE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

-- Software
CREATE POLICY "Users can view software in their workspaces"
  ON public.software FOR SELECT
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can insert software in their workspaces"
  ON public.software FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can update software in their workspaces"
  ON public.software FOR UPDATE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

CREATE POLICY "Users can delete software in their workspaces"
  ON public.software FOR DELETE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE (SELECT auth.jwt()->>'sub') = user_id));

-- Junction: sub_function_activities
CREATE POLICY "sub_function_activities_select"
  ON public.sub_function_activities FOR SELECT
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "sub_function_activities_insert"
  ON public.sub_function_activities FOR INSERT
  WITH CHECK (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "sub_function_activities_delete"
  ON public.sub_function_activities FOR DELETE
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

-- Junction: step_activities
CREATE POLICY "step_activities_select"
  ON public.step_activities FOR SELECT
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "step_activities_insert"
  ON public.step_activities FOR INSERT
  WITH CHECK (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "step_activities_delete"
  ON public.step_activities FOR DELETE
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

-- Junction: activity_roles
CREATE POLICY "activity_roles_select"
  ON public.activity_roles FOR SELECT
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "activity_roles_insert"
  ON public.activity_roles FOR INSERT
  WITH CHECK (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "activity_roles_delete"
  ON public.activity_roles FOR DELETE
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

-- Junction: activity_people
CREATE POLICY "activity_people_select"
  ON public.activity_people FOR SELECT
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "activity_people_insert"
  ON public.activity_people FOR INSERT
  WITH CHECK (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "activity_people_delete"
  ON public.activity_people FOR DELETE
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

-- Junction: activity_software
CREATE POLICY "activity_software_select"
  ON public.activity_software FOR SELECT
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "activity_software_insert"
  ON public.activity_software FOR INSERT
  WITH CHECK (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));

CREATE POLICY "activity_software_delete"
  ON public.activity_software FOR DELETE
  USING (activity_id IN (SELECT a.id FROM public.core_activities a JOIN public.workspaces w ON a.workspace_id = w.id WHERE (SELECT auth.jwt()->>'sub') = w.user_id));
