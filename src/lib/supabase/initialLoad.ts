/**
 * Initial data load from Supabase
 * 
 * Fetches all workspace data for a user on app load and transforms it
 * to the local store format. Handles merge with localStorage if needed.
 */

import { supabase } from './client'
import type { Workspace, CompanyProfile, AISettings } from '@/types'
import type { Tables } from '@/types/database'

// Supabase row types
type DbWorkspace = Tables<'workspaces'>
type DbFunction = Tables<'functions'>
type DbSubFunction = Tables<'sub_functions'>
type DbCoreActivity = Tables<'core_activities'>
type DbChecklistItem = Tables<'checklist_items'>
type DbWorkflow = Tables<'workflows'>
type DbPhase = Tables<'phases'>
type DbStep = Tables<'steps'>
type DbPerson = Tables<'people'>
type DbRole = Tables<'roles'>
type DbSoftware = Tables<'software'>

// Junction table types
type DbSubFunctionActivity = Tables<'sub_function_activities'>
type DbStepActivity = Tables<'step_activities'>

/**
 * Fetch all workspace data from Supabase for a user
 */
export async function loadUserWorkspaces(userId: string): Promise<Workspace[]> {
  // 1. Fetch all workspaces for this user
  const { data: dbWorkspaces, error: wsError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (wsError) {
    console.error('Error loading workspaces:', wsError)
    throw new Error(`Failed to load workspaces: ${wsError.message}`)
  }

  if (!dbWorkspaces || dbWorkspaces.length === 0) {
    return []
  }

  // 2. For each workspace, load all related data
  const workspaces = await Promise.all(
    dbWorkspaces.map(ws => loadFullWorkspace(ws))
  )

  return workspaces
}

/**
 * Load all data for a single workspace and transform to local format
 */
async function loadFullWorkspace(dbWorkspace: DbWorkspace): Promise<Workspace> {
  const workspaceId = dbWorkspace.id

  // Fetch all entities in parallel
  const [
    functionsResult,
    activitiesResult,
    workflowsResult,
    peopleResult,
    rolesResult,
    softwareResult,
  ] = await Promise.all([
    supabase.from('functions').select('*').eq('workspace_id', workspaceId).order('order_index'),
    supabase.from('core_activities').select('*').eq('workspace_id', workspaceId).order('created_at'),
    supabase.from('workflows').select('*').eq('workspace_id', workspaceId).order('created_at'),
    supabase.from('people').select('*').eq('workspace_id', workspaceId).order('name'),
    supabase.from('roles').select('*').eq('workspace_id', workspaceId).order('name'),
    supabase.from('software').select('*').eq('workspace_id', workspaceId).order('name'),
  ])

  const functions = (functionsResult.data ?? []) as DbFunction[]
  const activities = (activitiesResult.data ?? []) as DbCoreActivity[]
  const workflows = (workflowsResult.data ?? []) as DbWorkflow[]
  const people = (peopleResult.data ?? []) as DbPerson[]
  const roles = (rolesResult.data ?? []) as DbRole[]
  const software = (softwareResult.data ?? []) as DbSoftware[]

  // Fetch nested entities (sub-functions, phases, steps, checklist items)
  const functionIds = functions.map(f => f.id)
  const activityIds = activities.map(a => a.id)
  const workflowIds = workflows.map(w => w.id)

  const [subFunctionsResult, checklistResult] = await Promise.all([
    functionIds.length > 0
      ? supabase.from('sub_functions').select('*').in('function_id', functionIds).order('order_index')
      : Promise.resolve({ data: [] }),
    activityIds.length > 0
      ? supabase.from('checklist_items').select('*').in('activity_id', activityIds).order('order_index')
      : Promise.resolve({ data: [] }),
  ])

  const subFunctions = (subFunctionsResult.data ?? []) as DbSubFunction[]
  const checklistItems = (checklistResult.data ?? []) as DbChecklistItem[]

  // Fetch phases and then steps
  const phasesResult = workflowIds.length > 0
    ? await supabase.from('phases').select('*').in('workflow_id', workflowIds).order('order_index')
    : { data: [] }
  const phases = (phasesResult.data ?? []) as DbPhase[]

  const phaseIds = phases.map(p => p.id)
  const stepsResult = phaseIds.length > 0
    ? await supabase.from('steps').select('*').in('phase_id', phaseIds).order('order_index')
    : { data: [] }
  const steps = (stepsResult.data ?? []) as DbStep[]

  // Fetch junction tables
  const subFunctionIds = subFunctions.map(sf => sf.id)
  const stepIds = steps.map(s => s.id)

  const [subFuncActivitiesResult, stepActivitiesResult] = await Promise.all([
    subFunctionIds.length > 0
      ? supabase.from('sub_function_activities').select('*').in('sub_function_id', subFunctionIds)
      : Promise.resolve({ data: [] }),
    stepIds.length > 0
      ? supabase.from('step_activities').select('*').in('step_id', stepIds)
      : Promise.resolve({ data: [] }),
  ])

  const subFunctionActivities = (subFuncActivitiesResult.data ?? []) as DbSubFunctionActivity[]
  const stepActivities = (stepActivitiesResult.data ?? []) as DbStepActivity[]

  // Transform to local format
  return transformToLocalWorkspace(dbWorkspace, {
    functions,
    subFunctions,
    activities,
    checklistItems,
    workflows,
    phases,
    steps,
    people,
    roles,
    software,
    subFunctionActivities,
    stepActivities,
  })
}

/**
 * Transform Supabase data to local store format
 */
function transformToLocalWorkspace(
  dbWorkspace: DbWorkspace,
  data: {
    functions: DbFunction[]
    subFunctions: DbSubFunction[]
    activities: DbCoreActivity[]
    checklistItems: DbChecklistItem[]
    workflows: DbWorkflow[]
    phases: DbPhase[]
    steps: DbStep[]
    people: DbPerson[]
    roles: DbRole[]
    software: DbSoftware[]
    subFunctionActivities: DbSubFunctionActivity[]
    stepActivities: DbStepActivity[]
  }
): Workspace {
  // Cast through unknown for JSON columns (Supabase returns generic Json type)
  const companyProfile = dbWorkspace.company_profile
    ? (dbWorkspace.company_profile as unknown as CompanyProfile)
    : undefined
  const aiSettings = dbWorkspace.ai_settings
    ? (dbWorkspace.ai_settings as unknown as AISettings)
    : undefined

  return {
    id: dbWorkspace.id,
    name: dbWorkspace.name,
    createdAt: new Date(dbWorkspace.created_at),
    userId: dbWorkspace.user_id,
    company: {
      id: dbWorkspace.id, // Use workspace id as company id
      name: dbWorkspace.name,
      createdAt: new Date(dbWorkspace.created_at),
    },
    companyProfile,
    aiSettings,
    gapAnalysisHistory: [], // Not stored in Supabase yet
    functions: data.functions.map(f => ({
      id: f.id,
      companyId: dbWorkspace.id,
      name: f.name,
      description: f.description ?? undefined,
      status: f.status as 'gap' | 'draft' | 'active' | 'archived',
      orderIndex: f.order_index,
      color: f.color ?? '#3B82F6',
    })),
    subFunctions: data.subFunctions.map(sf => ({
      id: sf.id,
      functionId: sf.function_id,
      name: sf.name,
      description: sf.description ?? undefined,
      status: sf.status as 'gap' | 'draft' | 'active' | 'archived',
      orderIndex: sf.order_index,
    })),
    coreActivities: data.activities.map(a => ({
      id: a.id,
      companyId: dbWorkspace.id,
      name: a.name,
      description: a.description ?? undefined,
      fullDescription: a.full_description ?? undefined,
      status: a.status as 'gap' | 'draft' | 'active' | 'archived',
      videoUrl: a.video_url ?? undefined,
      videoType: a.video_type as 'loom' | 'gdrive' | undefined,
      checklistTrigger: a.checklist_trigger ?? undefined,
      checklistEndState: a.checklist_end_state ?? undefined,
      publishedAt: a.published_at ? new Date(a.published_at) : undefined,
      createdAt: new Date(a.created_at),
    })),
    subFunctionActivities: data.subFunctionActivities.map(sfa => ({
      subFunctionId: sfa.sub_function_id,
      coreActivityId: sfa.activity_id,
      orderIndex: 0, // Order not stored in junction table
    })),
    workflows: data.workflows.map(w => ({
      id: w.id,
      companyId: dbWorkspace.id,
      name: w.name,
      description: w.description ?? undefined,
      status: w.status as 'gap' | 'draft' | 'active' | 'archived',
      publishedAt: w.published_at ? new Date(w.published_at) : undefined,
      createdAt: new Date(w.created_at),
    })),
    phases: data.phases.map(p => ({
      id: p.id,
      workflowId: p.workflow_id,
      name: p.name,
      orderIndex: p.order_index,
    })),
    steps: data.steps.map(s => ({
      id: s.id,
      phaseId: s.phase_id,
      name: s.name,
      orderIndex: s.order_index,
      sopVideoUrl: s.sop_video_url ?? undefined,
      sopVideoType: s.sop_video_type as 'loom' | 'gdrive' | undefined,
    })),
    stepActivities: data.stepActivities.map(sa => ({
      stepId: sa.step_id,
      coreActivityId: sa.activity_id,
      orderIndex: 0, // Order not stored in junction table
    })),
    people: data.people.map(p => ({
      id: p.id,
      companyId: dbWorkspace.id,
      name: p.name,
      email: p.email ?? undefined,
      roleId: p.role_id ?? undefined,
      reportsTo: p.reports_to ?? undefined,
      title: p.title ?? undefined,
    })),
    roles: data.roles.map(r => ({
      id: r.id,
      companyId: dbWorkspace.id,
      name: r.name,
      description: r.description ?? undefined,
    })),
    software: data.software.map(s => ({
      id: s.id,
      companyId: dbWorkspace.id,
      name: s.name,
      url: s.url ?? undefined,
    })),
    checklistItems: data.checklistItems.map(ci => ({
      id: ci.id,
      coreActivityId: ci.activity_id,
      text: ci.text,
      orderIndex: ci.order_index,
      completed: ci.completed ?? false,
      videoUrl: ci.video_url ?? undefined,
    })),
  }
}

/**
 * Merge Supabase workspaces with local workspaces
 * Strategy: Supabase is source of truth for synced data
 * - Keep local-only workspaces (no userId or different userId)
 * - Replace workspaces that exist in both with Supabase version
 */
export function mergeWorkspaces(
  localWorkspaces: Workspace[],
  supabaseWorkspaces: Workspace[],
  userId: string
): Workspace[] {
  // Create a set of Supabase workspace IDs for quick lookup
  const supabaseIds = new Set(supabaseWorkspaces.map(ws => ws.id))

  // Keep local workspaces that:
  // 1. Don't belong to this user (no userId or different userId)
  // 2. Don't exist in Supabase (local-only, not yet synced)
  const localOnly = localWorkspaces.filter(ws => {
    // If workspace has a different user or no user, keep it
    if (ws.userId && ws.userId !== userId) return true
    // If workspace belongs to this user but isn't in Supabase, it might be new
    // For safety, if it exists in Supabase, use Supabase version
    if (supabaseIds.has(ws.id)) return false
    // Local workspace not in Supabase - keep it (will sync on next save)
    return true
  })

  // Combine: Supabase workspaces (source of truth) + local-only
  return [...supabaseWorkspaces, ...localOnly]
}
