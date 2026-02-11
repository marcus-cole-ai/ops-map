/**
 * Supabase sync operations
 * 
 * CRUD operations for all entity types that sync to Supabase.
 * All functions accept a Supabase client instance, allowing them
 * to work with Clerk-authenticated clients for RLS policy enforcement.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import type { Tables, TablesInsert, TablesUpdate, Database } from '@/types/database'

// Re-export types for convenience
export type Workspace = Tables<'workspaces'>
export type WorkspaceInsert = TablesInsert<'workspaces'>
export type WorkspaceUpdate = TablesUpdate<'workspaces'>

export type BusinessFunction = Tables<'functions'>
export type FunctionInsert = TablesInsert<'functions'>
export type FunctionUpdate = TablesUpdate<'functions'>

export type SubFunction = Tables<'sub_functions'>
export type SubFunctionInsert = TablesInsert<'sub_functions'>
export type SubFunctionUpdate = TablesUpdate<'sub_functions'>

export type CoreActivity = Tables<'core_activities'>
export type CoreActivityInsert = TablesInsert<'core_activities'>
export type CoreActivityUpdate = TablesUpdate<'core_activities'>

export type ChecklistItem = Tables<'checklist_items'>
export type ChecklistItemInsert = TablesInsert<'checklist_items'>
export type ChecklistItemUpdate = TablesUpdate<'checklist_items'>

export type Workflow = Tables<'workflows'>
export type WorkflowInsert = TablesInsert<'workflows'>
export type WorkflowUpdate = TablesUpdate<'workflows'>

export type Phase = Tables<'phases'>
export type PhaseInsert = TablesInsert<'phases'>
export type PhaseUpdate = TablesUpdate<'phases'>

export type Step = Tables<'steps'>
export type StepInsert = TablesInsert<'steps'>
export type StepUpdate = TablesUpdate<'steps'>

export type Person = Tables<'people'>
export type PersonInsert = TablesInsert<'people'>
export type PersonUpdate = TablesUpdate<'people'>

export type Role = Tables<'roles'>
export type RoleInsert = TablesInsert<'roles'>
export type RoleUpdate = TablesUpdate<'roles'>

export type Software = Tables<'software'>
export type SoftwareInsert = TablesInsert<'software'>
export type SoftwareUpdate = TablesUpdate<'software'>

type Client = SupabaseClient<Database>

// =============================================================================
// Workspaces CRUD
// =============================================================================

export async function fetchWorkspaces(client: Client, userId: string): Promise<Workspace[]> {
  const { data, error } = await client
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

export async function createWorkspace(client: Client, workspace: WorkspaceInsert): Promise<Workspace> {
  const { data, error } = await client
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

export async function updateWorkspace(client: Client, id: string, updates: WorkspaceUpdate): Promise<Workspace> {
  const { data, error } = await client
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

export async function deleteWorkspace(client: Client, id: string): Promise<void> {
  const { error } = await client
    .from('workspaces')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting workspace:', error)
    throw new Error(`Failed to delete workspace: ${error.message}`)
  }
}

// =============================================================================
// Functions CRUD
// =============================================================================

export async function fetchFunctions(client: Client, workspaceId: string): Promise<BusinessFunction[]> {
  const { data, error } = await client
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

export async function createFunction(client: Client, func: FunctionInsert): Promise<BusinessFunction> {
  const { data, error } = await client
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

export async function updateFunction(client: Client, id: string, updates: FunctionUpdate): Promise<BusinessFunction> {
  const { data, error } = await client
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

export async function deleteFunction(client: Client, id: string): Promise<void> {
  const { error } = await client
    .from('functions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting function:', error)
    throw new Error(`Failed to delete function: ${error.message}`)
  }
}

export async function updateFunctionOrder(client: Client, updates: { id: string; order_index: number }[]): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    client.from('functions').update({ order_index }).eq('id', id)
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

export async function createSubFunction(client: Client, subFunc: SubFunctionInsert): Promise<SubFunction> {
  const { data, error } = await client
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

export async function updateSubFunction(client: Client, id: string, updates: SubFunctionUpdate): Promise<SubFunction> {
  const { data, error } = await client
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

export async function deleteSubFunction(client: Client, id: string): Promise<void> {
  const { error } = await client
    .from('sub_functions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting sub-function:', error)
    throw new Error(`Failed to delete sub-function: ${error.message}`)
  }
}

export async function updateSubFunctionOrder(client: Client, updates: { id: string; order_index: number }[]): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    client.from('sub_functions').update({ order_index }).eq('id', id)
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

export async function createActivity(client: Client, activity: CoreActivityInsert): Promise<CoreActivity> {
  const { data, error } = await client
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

export async function updateActivity(client: Client, id: string, updates: CoreActivityUpdate): Promise<CoreActivity> {
  const { data, error } = await client
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

export async function deleteActivity(client: Client, id: string): Promise<void> {
  const { error } = await client
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

export async function createChecklistItem(client: Client, item: ChecklistItemInsert): Promise<ChecklistItem> {
  const { data, error } = await client
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

export async function updateChecklistItem(client: Client, id: string, updates: ChecklistItemUpdate): Promise<ChecklistItem> {
  const { data, error } = await client
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

export async function deleteChecklistItem(client: Client, id: string): Promise<void> {
  const { error } = await client
    .from('checklist_items')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting checklist item:', error)
    throw new Error(`Failed to delete checklist item: ${error.message}`)
  }
}

export async function updateChecklistItemOrder(client: Client, updates: { id: string; order_index: number }[]): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    client.from('checklist_items').update({ order_index }).eq('id', id)
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

export async function createWorkflow(client: Client, workflow: WorkflowInsert): Promise<Workflow> {
  const { data, error } = await client
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

export async function updateWorkflow(client: Client, id: string, updates: WorkflowUpdate): Promise<Workflow> {
  const { data, error } = await client
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

export async function deleteWorkflow(client: Client, id: string): Promise<void> {
  const { error } = await client
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

export async function createPhase(client: Client, phase: PhaseInsert): Promise<Phase> {
  const { data, error } = await client
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

export async function updatePhase(client: Client, id: string, updates: PhaseUpdate): Promise<Phase> {
  const { data, error } = await client
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

export async function deletePhase(client: Client, id: string): Promise<void> {
  const { error } = await client
    .from('phases')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting phase:', error)
    throw new Error(`Failed to delete phase: ${error.message}`)
  }
}

export async function updatePhaseOrder(client: Client, updates: { id: string; order_index: number }[]): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    client.from('phases').update({ order_index }).eq('id', id)
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

export async function createStep(client: Client, step: StepInsert): Promise<Step> {
  const { data, error } = await client
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

export async function updateStep(client: Client, id: string, updates: StepUpdate): Promise<Step> {
  const { data, error } = await client
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

export async function deleteStep(client: Client, id: string): Promise<void> {
  const { error } = await client
    .from('steps')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting step:', error)
    throw new Error(`Failed to delete step: ${error.message}`)
  }
}

export async function updateStepOrder(client: Client, updates: { id: string; order_index: number }[]): Promise<void> {
  const promises = updates.map(({ id, order_index }) =>
    client.from('steps').update({ order_index }).eq('id', id)
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

export async function createPerson(client: Client, person: PersonInsert): Promise<Person> {
  const { data, error } = await client
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

export async function updatePerson(client: Client, id: string, updates: PersonUpdate): Promise<Person> {
  const { data, error } = await client
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

export async function deletePerson(client: Client, id: string): Promise<void> {
  const { error } = await client.from('people').delete().eq('id', id)

  if (error) {
    console.error('Error deleting person:', error)
    throw new Error(`Failed to delete person: ${error.message}`)
  }
}

// =============================================================================
// Roles CRUD
// =============================================================================

export async function createRole(client: Client, role: RoleInsert): Promise<Role> {
  const { data, error } = await client
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

export async function updateRole(client: Client, id: string, updates: RoleUpdate): Promise<Role> {
  const { data, error } = await client
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

export async function deleteRole(client: Client, id: string): Promise<void> {
  const { error } = await client.from('roles').delete().eq('id', id)

  if (error) {
    console.error('Error deleting role:', error)
    throw new Error(`Failed to delete role: ${error.message}`)
  }
}

// =============================================================================
// Software CRUD
// =============================================================================

export async function createSoftware(client: Client, software: SoftwareInsert): Promise<Software> {
  const { data, error } = await client
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

export async function updateSoftware(client: Client, id: string, updates: SoftwareUpdate): Promise<Software> {
  const { data, error } = await client
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

export async function deleteSoftware(client: Client, id: string): Promise<void> {
  const { error } = await client.from('software').delete().eq('id', id)

  if (error) {
    console.error('Error deleting software:', error)
    throw new Error(`Failed to delete software: ${error.message}`)
  }
}
