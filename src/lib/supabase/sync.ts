import { supabase } from './client'
import type { Tables, TablesInsert, TablesUpdate } from '@/types/database'

// Type aliases for workspaces
export type Workspace = Tables<'workspaces'>
export type WorkspaceInsert = TablesInsert<'workspaces'>
export type WorkspaceUpdate = TablesUpdate<'workspaces'>

/**
 * Fetch all workspaces for a user
 */
export async function fetchWorkspaces(userId: string): Promise<Workspace[]> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workspaces:', error)
    throw new Error(`Failed to fetch workspaces: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new workspace
 */
export async function createWorkspace(
  workspace: WorkspaceInsert
): Promise<Workspace> {
  const { data, error } = await supabase
    .from('workspaces')
    .insert(workspace)
    .select()
    .single()

  if (error) {
    console.error('Error creating workspace:', error)
    throw new Error(`Failed to create workspace: ${error.message}`)
  }

  return data
}

/**
 * Update an existing workspace
 */
export async function updateWorkspace(
  id: string,
  updates: WorkspaceUpdate
): Promise<Workspace> {
  const { data, error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating workspace:', error)
    throw new Error(`Failed to update workspace: ${error.message}`)
  }

  return data
}

/**
 * Delete a workspace by ID
 */
export async function deleteWorkspace(id: string): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting workspace:', error)
    throw new Error(`Failed to delete workspace: ${error.message}`)
  }
}

/**
 * Fetch a single workspace by ID
 */
export async function fetchWorkspaceById(id: string): Promise<Workspace | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    console.error('Error fetching workspace:', error)
    throw new Error(`Failed to fetch workspace: ${error.message}`)
  }

  return data
}

// =============================================================================
// Functions CRUD
// =============================================================================

export type BusinessFunction = Tables<'functions'>
export type FunctionInsert = TablesInsert<'functions'>
export type FunctionUpdate = TablesUpdate<'functions'>

/**
 * Fetch all functions for a workspace, ordered by order_index
 */
export async function fetchFunctions(workspaceId: string): Promise<BusinessFunction[]> {
  const { data, error } = await supabase
    .from('functions')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching functions:', error)
    throw new Error(`Failed to fetch functions: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new function
 */
export async function createFunction(func: FunctionInsert): Promise<BusinessFunction> {
  const { data, error } = await supabase
    .from('functions')
    .insert(func)
    .select()
    .single()

  if (error) {
    console.error('Error creating function:', error)
    throw new Error(`Failed to create function: ${error.message}`)
  }

  return data
}

/**
 * Update an existing function
 */
export async function updateFunction(
  id: string,
  updates: FunctionUpdate
): Promise<BusinessFunction> {
  const { data, error } = await supabase
    .from('functions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating function:', error)
    throw new Error(`Failed to update function: ${error.message}`)
  }

  return data
}

/**
 * Delete a function by ID
 */
export async function deleteFunction(id: string): Promise<void> {
  const { error } = await supabase
    .from('functions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting function:', error)
    throw new Error(`Failed to delete function: ${error.message}`)
  }
}

/**
 * Update order_index for multiple functions (batch reorder)
 */
export async function updateFunctionOrder(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  // Supabase doesn't support batch updates natively, so we use Promise.all
  const promises = updates.map(({ id, order_index }) =>
    supabase.from('functions').update({ order_index }).eq('id', id)
  )

  const results = await Promise.all(promises)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    console.error('Error updating function order:', failed.error)
    throw new Error(`Failed to update function order: ${failed.error.message}`)
  }
}

// =============================================================================
// Sub-Functions CRUD
// =============================================================================

export type SubFunction = Tables<'sub_functions'>
export type SubFunctionInsert = TablesInsert<'sub_functions'>
export type SubFunctionUpdate = TablesUpdate<'sub_functions'>

/**
 * Fetch all sub-functions for a function, ordered by order_index
 */
export async function fetchSubFunctions(functionId: string): Promise<SubFunction[]> {
  const { data, error } = await supabase
    .from('sub_functions')
    .select('*')
    .eq('function_id', functionId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching sub-functions:', error)
    throw new Error(`Failed to fetch sub-functions: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new sub-function
 */
export async function createSubFunction(subFunc: SubFunctionInsert): Promise<SubFunction> {
  const { data, error } = await supabase
    .from('sub_functions')
    .insert(subFunc)
    .select()
    .single()

  if (error) {
    console.error('Error creating sub-function:', error)
    throw new Error(`Failed to create sub-function: ${error.message}`)
  }

  return data
}

/**
 * Update an existing sub-function
 */
export async function updateSubFunction(
  id: string,
  updates: SubFunctionUpdate
): Promise<SubFunction> {
  const { data, error } = await supabase
    .from('sub_functions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating sub-function:', error)
    throw new Error(`Failed to update sub-function: ${error.message}`)
  }

  return data
}

/**
 * Delete a sub-function by ID
 */
export async function deleteSubFunction(id: string): Promise<void> {
  const { error } = await supabase
    .from('sub_functions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting sub-function:', error)
    throw new Error(`Failed to delete sub-function: ${error.message}`)
  }
}

/**
 * Update order_index for multiple sub-functions (batch reorder)
 */
export async function updateSubFunctionOrder(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    supabase.from('sub_functions').update({ order_index }).eq('id', id)
  )

  const results = await Promise.all(promises)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    console.error('Error updating sub-function order:', failed.error)
    throw new Error(`Failed to update sub-function order: ${failed.error.message}`)
  }
}

// =============================================================================
// Core Activities CRUD
// =============================================================================

export type CoreActivity = Tables<'core_activities'>
export type CoreActivityInsert = TablesInsert<'core_activities'>
export type CoreActivityUpdate = TablesUpdate<'core_activities'>

/**
 * Fetch all activities for a workspace
 */
export async function fetchActivities(workspaceId: string): Promise<CoreActivity[]> {
  const { data, error } = await supabase
    .from('core_activities')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching activities:', error)
    throw new Error(`Failed to fetch activities: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new activity
 */
export async function createActivity(activity: CoreActivityInsert): Promise<CoreActivity> {
  const { data, error } = await supabase
    .from('core_activities')
    .insert(activity)
    .select()
    .single()

  if (error) {
    console.error('Error creating activity:', error)
    throw new Error(`Failed to create activity: ${error.message}`)
  }

  return data
}

/**
 * Update an existing activity
 */
export async function updateActivity(
  id: string,
  updates: CoreActivityUpdate
): Promise<CoreActivity> {
  const { data, error } = await supabase
    .from('core_activities')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating activity:', error)
    throw new Error(`Failed to update activity: ${error.message}`)
  }

  return data
}

/**
 * Delete an activity by ID
 */
export async function deleteActivity(id: string): Promise<void> {
  const { error } = await supabase
    .from('core_activities')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting activity:', error)
    throw new Error(`Failed to delete activity: ${error.message}`)
  }
}

// =============================================================================
// Checklist Items CRUD
// =============================================================================

export type ChecklistItem = Tables<'checklist_items'>
export type ChecklistItemInsert = TablesInsert<'checklist_items'>
export type ChecklistItemUpdate = TablesUpdate<'checklist_items'>

/**
 * Fetch all checklist items for an activity, ordered by order_index
 */
export async function fetchChecklistItems(activityId: string): Promise<ChecklistItem[]> {
  const { data, error } = await supabase
    .from('checklist_items')
    .select('*')
    .eq('activity_id', activityId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching checklist items:', error)
    throw new Error(`Failed to fetch checklist items: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new checklist item
 */
export async function createChecklistItem(item: ChecklistItemInsert): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from('checklist_items')
    .insert(item)
    .select()
    .single()

  if (error) {
    console.error('Error creating checklist item:', error)
    throw new Error(`Failed to create checklist item: ${error.message}`)
  }

  return data
}

/**
 * Update an existing checklist item
 */
export async function updateChecklistItem(
  id: string,
  updates: ChecklistItemUpdate
): Promise<ChecklistItem> {
  const { data, error } = await supabase
    .from('checklist_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating checklist item:', error)
    throw new Error(`Failed to update checklist item: ${error.message}`)
  }

  return data
}

/**
 * Delete a checklist item by ID
 */
export async function deleteChecklistItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('checklist_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting checklist item:', error)
    throw new Error(`Failed to delete checklist item: ${error.message}`)
  }
}

/**
 * Update order_index for multiple checklist items (batch reorder)
 */
export async function updateChecklistItemOrder(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    supabase.from('checklist_items').update({ order_index }).eq('id', id)
  )

  const results = await Promise.all(promises)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    console.error('Error updating checklist item order:', failed.error)
    throw new Error(`Failed to update checklist item order: ${failed.error.message}`)
  }
}

// =============================================================================
// Workflows CRUD
// =============================================================================

export type Workflow = Tables<'workflows'>
export type WorkflowInsert = TablesInsert<'workflows'>
export type WorkflowUpdate = TablesUpdate<'workflows'>

/**
 * Fetch all workflows for a workspace
 */
export async function fetchWorkflows(workspaceId: string): Promise<Workflow[]> {
  const { data, error } = await supabase
    .from('workflows')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching workflows:', error)
    throw new Error(`Failed to fetch workflows: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new workflow
 */
export async function createWorkflow(workflow: WorkflowInsert): Promise<Workflow> {
  const { data, error } = await supabase
    .from('workflows')
    .insert(workflow)
    .select()
    .single()

  if (error) {
    console.error('Error creating workflow:', error)
    throw new Error(`Failed to create workflow: ${error.message}`)
  }

  return data
}

/**
 * Update an existing workflow
 */
export async function updateWorkflow(
  id: string,
  updates: WorkflowUpdate
): Promise<Workflow> {
  const { data, error } = await supabase
    .from('workflows')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating workflow:', error)
    throw new Error(`Failed to update workflow: ${error.message}`)
  }

  return data
}

/**
 * Delete a workflow by ID
 */
export async function deleteWorkflow(id: string): Promise<void> {
  const { error } = await supabase
    .from('workflows')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting workflow:', error)
    throw new Error(`Failed to delete workflow: ${error.message}`)
  }
}

// =============================================================================
// Phases CRUD
// =============================================================================

export type Phase = Tables<'phases'>
export type PhaseInsert = TablesInsert<'phases'>
export type PhaseUpdate = TablesUpdate<'phases'>

/**
 * Fetch all phases for a workflow, ordered by order_index
 */
export async function fetchPhases(workflowId: string): Promise<Phase[]> {
  const { data, error } = await supabase
    .from('phases')
    .select('*')
    .eq('workflow_id', workflowId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching phases:', error)
    throw new Error(`Failed to fetch phases: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new phase
 */
export async function createPhase(phase: PhaseInsert): Promise<Phase> {
  const { data, error } = await supabase
    .from('phases')
    .insert(phase)
    .select()
    .single()

  if (error) {
    console.error('Error creating phase:', error)
    throw new Error(`Failed to create phase: ${error.message}`)
  }

  return data
}

/**
 * Update an existing phase
 */
export async function updatePhase(
  id: string,
  updates: PhaseUpdate
): Promise<Phase> {
  const { data, error } = await supabase
    .from('phases')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating phase:', error)
    throw new Error(`Failed to update phase: ${error.message}`)
  }

  return data
}

/**
 * Delete a phase by ID
 */
export async function deletePhase(id: string): Promise<void> {
  const { error } = await supabase
    .from('phases')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting phase:', error)
    throw new Error(`Failed to delete phase: ${error.message}`)
  }
}

/**
 * Update order_index for multiple phases (batch reorder)
 */
export async function updatePhaseOrder(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    supabase.from('phases').update({ order_index }).eq('id', id)
  )

  const results = await Promise.all(promises)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    console.error('Error updating phase order:', failed.error)
    throw new Error(`Failed to update phase order: ${failed.error.message}`)
  }
}

// =============================================================================
// Steps CRUD
// =============================================================================

export type Step = Tables<'steps'>
export type StepInsert = TablesInsert<'steps'>
export type StepUpdate = TablesUpdate<'steps'>

/**
 * Fetch all steps for a phase, ordered by order_index
 */
export async function fetchSteps(phaseId: string): Promise<Step[]> {
  const { data, error } = await supabase
    .from('steps')
    .select('*')
    .eq('phase_id', phaseId)
    .order('order_index', { ascending: true })

  if (error) {
    console.error('Error fetching steps:', error)
    throw new Error(`Failed to fetch steps: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new step
 */
export async function createStep(step: StepInsert): Promise<Step> {
  const { data, error } = await supabase
    .from('steps')
    .insert(step)
    .select()
    .single()

  if (error) {
    console.error('Error creating step:', error)
    throw new Error(`Failed to create step: ${error.message}`)
  }

  return data
}

/**
 * Update an existing step
 */
export async function updateStep(
  id: string,
  updates: StepUpdate
): Promise<Step> {
  const { data, error } = await supabase
    .from('steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating step:', error)
    throw new Error(`Failed to update step: ${error.message}`)
  }

  return data
}

/**
 * Delete a step by ID
 */
export async function deleteStep(id: string): Promise<void> {
  const { error } = await supabase
    .from('steps')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting step:', error)
    throw new Error(`Failed to delete step: ${error.message}`)
  }
}

/**
 * Update order_index for multiple steps (batch reorder)
 */
export async function updateStepOrder(
  updates: { id: string; order_index: number }[]
): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    supabase.from('steps').update({ order_index }).eq('id', id)
  )

  const results = await Promise.all(promises)
  const failed = results.find((r) => r.error)
  if (failed?.error) {
    console.error('Error updating step order:', failed.error)
    throw new Error(`Failed to update step order: ${failed.error.message}`)
  }
}

// =============================================================================
// People CRUD
// =============================================================================

export type Person = Tables<'people'>
export type PersonInsert = TablesInsert<'people'>
export type PersonUpdate = TablesUpdate<'people'>

/**
 * Fetch all people for a workspace
 */
export async function fetchPeople(workspaceId: string): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching people:', error)
    throw new Error(`Failed to fetch people: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new person
 */
export async function createPerson(person: PersonInsert): Promise<Person> {
  const { data, error } = await supabase
    .from('people')
    .insert(person)
    .select()
    .single()

  if (error) {
    console.error('Error creating person:', error)
    throw new Error(`Failed to create person: ${error.message}`)
  }

  return data
}

/**
 * Update an existing person
 */
export async function updatePerson(id: string, updates: PersonUpdate): Promise<Person> {
  const { data, error } = await supabase
    .from('people')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating person:', error)
    throw new Error(`Failed to update person: ${error.message}`)
  }

  return data
}

/**
 * Delete a person by ID
 */
export async function deletePerson(id: string): Promise<void> {
  const { error } = await supabase.from('people').delete().eq('id', id)

  if (error) {
    console.error('Error deleting person:', error)
    throw new Error(`Failed to delete person: ${error.message}`)
  }
}

// =============================================================================
// Roles CRUD
// =============================================================================

export type Role = Tables<'roles'>
export type RoleInsert = TablesInsert<'roles'>
export type RoleUpdate = TablesUpdate<'roles'>

/**
 * Fetch all roles for a workspace
 */
export async function fetchRoles(workspaceId: string): Promise<Role[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching roles:', error)
    throw new Error(`Failed to fetch roles: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new role
 */
export async function createRole(role: RoleInsert): Promise<Role> {
  const { data, error } = await supabase
    .from('roles')
    .insert(role)
    .select()
    .single()

  if (error) {
    console.error('Error creating role:', error)
    throw new Error(`Failed to create role: ${error.message}`)
  }

  return data
}

/**
 * Update an existing role
 */
export async function updateRole(id: string, updates: RoleUpdate): Promise<Role> {
  const { data, error } = await supabase
    .from('roles')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating role:', error)
    throw new Error(`Failed to update role: ${error.message}`)
  }

  return data
}

/**
 * Delete a role by ID
 */
export async function deleteRole(id: string): Promise<void> {
  const { error } = await supabase.from('roles').delete().eq('id', id)

  if (error) {
    console.error('Error deleting role:', error)
    throw new Error(`Failed to delete role: ${error.message}`)
  }
}

// =============================================================================
// Software CRUD
// =============================================================================

export type Software = Tables<'software'>
export type SoftwareInsert = TablesInsert<'software'>
export type SoftwareUpdate = TablesUpdate<'software'>

/**
 * Fetch all software for a workspace
 */
export async function fetchSoftware(workspaceId: string): Promise<Software[]> {
  const { data, error } = await supabase
    .from('software')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching software:', error)
    throw new Error(`Failed to fetch software: ${error.message}`)
  }

  return data ?? []
}

/**
 * Create a new software entry
 */
export async function createSoftware(software: SoftwareInsert): Promise<Software> {
  const { data, error } = await supabase
    .from('software')
    .insert(software)
    .select()
    .single()

  if (error) {
    console.error('Error creating software:', error)
    throw new Error(`Failed to create software: ${error.message}`)
  }

  return data
}

/**
 * Update an existing software entry
 */
export async function updateSoftware(id: string, updates: SoftwareUpdate): Promise<Software> {
  const { data, error } = await supabase
    .from('software')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating software:', error)
    throw new Error(`Failed to update software: ${error.message}`)
  }

  return data
}

/**
 * Delete a software entry by ID
 */
export async function deleteSoftware(id: string): Promise<void> {
  const { error } = await supabase.from('software').delete().eq('id', id)

  if (error) {
    console.error('Error deleting software:', error)
    throw new Error(`Failed to delete software: ${error.message}`)
  }
}
