import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Company,
  CompanyProfile,
  AISettings,
  GapAnalysis,
  Status,
  Function,
  SubFunction,
  CoreActivity,
  SubFunctionActivity,
  Workflow,
  Phase,
  Step,
  StepActivity,
  Person,
  Role,
  Software,
  ChecklistItem,
  Workspace,
} from '@/types'

// Generate unique IDs
const generateId = () => crypto.randomUUID()

// Default colors for functions
const FUNCTION_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#84CC16', // lime
  '#F97316', // orange
  '#6366F1', // indigo
]

// Default company profile for new workspaces
const defaultCompanyProfile: CompanyProfile = {
  industry: '',
  companyType: '',
  size: '',
  annualRevenue: '',
  targetMargin: 20,
  idealProject: '',
  serviceArea: '',
  specialties: [],
  challenges: '',
}

// Default AI settings
const defaultAISettings: AISettings = {
  preferredModel: 'gemini-flash',
}

// Create an empty workspace
const createEmptyWorkspace = (name: string, userId?: string): Workspace => {
  const id = generateId()
  return {
    id,
    name,
    createdAt: new Date(),
    userId, // Associate workspace with user
    company: {
      id: generateId(),
      name,
      createdAt: new Date(),
    },
    companyProfile: { ...defaultCompanyProfile },
    aiSettings: { ...defaultAISettings },
    gapAnalysisHistory: [],
    functions: [],
    subFunctions: [],
    coreActivities: [],
    subFunctionActivities: [],
    workflows: [],
    phases: [],
    steps: [],
    stepActivities: [],
    people: [],
    roles: [],
    software: [],
    checklistItems: [],
  }
}

interface OpsMapState {
  // Workspace management
  workspaces: Workspace[]
  activeWorkspaceId: string
  currentUserId: string | null  // Clerk user ID
  
  // Workspace actions
  getActiveWorkspace: () => Workspace
  addWorkspace: (name: string) => Workspace
  renameWorkspace: (id: string, name: string) => void
  deleteWorkspace: (id: string) => void
  switchWorkspace: (id: string) => void
  
  // User-scoped workspace actions
  setCurrentUserId: (userId: string) => void
  getUserWorkspaces: (userId: string) => Workspace[]
  createWorkspaceForUser: (name: string, userId: string) => Workspace
  
  // Company (operates on active workspace)
  company: Company | null
  setCompany: (company: Company) => void
  
  // Company Profile (for AI context)
  companyProfile: CompanyProfile | null
  setCompanyProfile: (profile: CompanyProfile) => void
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void
  
  // AI Settings
  aiSettings: AISettings | null
  setAISettings: (settings: AISettings) => void
  
  // Gap Analysis History
  gapAnalysisHistory: GapAnalysis[]
  addGapAnalysis: (analysis: GapAnalysis) => void
  markGapApplied: (analysisId: string, gapId: string) => void
  
  // Functions
  functions: Function[]
  addFunction: (name: string, description?: string) => Function
  updateFunction: (id: string, updates: Partial<Function>) => void
  deleteFunction: (id: string) => void
  reorderFunctions: (ids: string[]) => void
  setFunctionStatus: (id: string, status: Status) => void
  
  // Sub-Functions
  subFunctions: SubFunction[]
  addSubFunction: (functionId: string, name: string, description?: string) => SubFunction
  updateSubFunction: (id: string, updates: Partial<SubFunction>) => void
  deleteSubFunction: (id: string) => void
  reorderSubFunctions: (functionId: string, ids: string[]) => void
  setSubFunctionStatus: (id: string, status: Status) => void
  
  // Core Activities
  coreActivities: CoreActivity[]
  addCoreActivity: (name: string, description?: string) => CoreActivity
  updateCoreActivity: (id: string, updates: Partial<CoreActivity>) => void
  updateActivityVideo: (id: string, videoUrl: string | null, videoType: 'loom' | 'gdrive' | null) => void
  updateActivityRoles: (id: string, roleIds: string[]) => void
  updateActivityPeople: (id: string, ownerIds: string[]) => void
  updateActivitySoftware: (id: string, softwareIds: string[]) => void
  deleteCoreActivity: (id: string) => void
  setActivityStatus: (id: string, status: Status) => void
  publishActivity: (id: string) => void
  
  // Sub-Function <-> Activity Links
  subFunctionActivities: SubFunctionActivity[]
  linkActivityToSubFunction: (subFunctionId: string, activityId: string) => void
  unlinkActivityFromSubFunction: (subFunctionId: string, activityId: string) => void
  getActivitiesForSubFunction: (subFunctionId: string) => CoreActivity[]
  
  // Workflows
  workflows: Workflow[]
  addWorkflow: (name: string, description?: string) => Workflow
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void
  deleteWorkflow: (id: string) => void
  setWorkflowStatus: (id: string, status: Status) => void
  publishWorkflow: (id: string) => void
  statusFilter: Status[]
  setStatusFilter: (statuses: Status[]) => void
  filteredWorkflows: () => Workflow[]
  filteredActivities: () => CoreActivity[]
  
  // Phases
  phases: Phase[]
  addPhase: (workflowId: string, name: string) => Phase
  updatePhase: (id: string, updates: Partial<Phase>) => void
  deletePhase: (id: string) => void
  reorderPhases: (workflowId: string, ids: string[]) => void
  
  // Steps
  steps: Step[]
  addStep: (phaseId: string, name: string) => Step
  updateStep: (id: string, updates: Partial<Step>) => void
  deleteStep: (id: string) => void
  reorderSteps: (phaseId: string, ids: string[]) => void
  
  // Step <-> Activity Links
  stepActivities: StepActivity[]
  linkActivityToStep: (stepId: string, activityId: string) => void
  unlinkActivityFromStep: (stepId: string, activityId: string) => void
  getActivitiesForStep: (stepId: string) => CoreActivity[]
  getWorkflowsContainingActivity: (activityId: string) => Workflow[]
  
  // People
  people: Person[]
  addPerson: (name: string, email?: string) => Person
  updatePerson: (id: string, updates: Partial<Person>) => void
  deletePerson: (id: string) => void
  
  // Roles
  roles: Role[]
  addRole: (name: string, description?: string) => Role
  updateRole: (id: string, updates: Partial<Role>) => void
  deleteRole: (id: string) => void
  
  // Software
  software: Software[]
  addSoftware: (name: string, url?: string) => Software
  updateSoftware: (id: string, updates: Partial<Software>) => void
  deleteSoftware: (id: string) => void
  
  // Checklist Items
  checklistItems: ChecklistItem[]
  addChecklistItem: (activityId: string, text: string) => ChecklistItem
  updateChecklistItem: (id: string, updates: Partial<ChecklistItem>) => void
  deleteChecklistItem: (id: string) => void
  reorderChecklistItems: (activityId: string, ids: string[]) => void
  getChecklistForActivity: (activityId: string) => ChecklistItem[]
  
  // Utility
  clearAllData: () => void
  loadDemoData: () => void
  loadTemplate: (templateId: string) => void
}

// Helper to update the active workspace in the workspaces array
const updateActiveWorkspace = (
  state: OpsMapState,
  updater: (ws: Workspace) => Workspace
): Partial<OpsMapState> => {
  const workspaces = state.workspaces.map(ws =>
    ws.id === state.activeWorkspaceId ? updater(ws) : ws
  )
  const active = workspaces.find(ws => ws.id === state.activeWorkspaceId)!
  return {
    workspaces,
    // Sync computed properties
    company: active.company,
    companyProfile: active.companyProfile || null,
    aiSettings: active.aiSettings || null,
    gapAnalysisHistory: active.gapAnalysisHistory || [],
    functions: active.functions,
    subFunctions: active.subFunctions,
    coreActivities: active.coreActivities,
    subFunctionActivities: active.subFunctionActivities,
    workflows: active.workflows,
    phases: active.phases,
    steps: active.steps,
    stepActivities: active.stepActivities,
    people: active.people,
    roles: active.roles,
    software: active.software,
    checklistItems: active.checklistItems,
  }
}

// Get active workspace data for computed properties
const getActiveData = (workspaces: Workspace[], activeId: string) => {
  const active = workspaces.find(ws => ws.id === activeId)
  if (!active) {
    // Fallback to first workspace or create empty
    const first = workspaces[0] || createEmptyWorkspace('My Company')
    return {
      company: first.company,
      companyProfile: first.companyProfile || null,
      aiSettings: first.aiSettings || null,
      gapAnalysisHistory: first.gapAnalysisHistory || [],
      functions: first.functions,
      subFunctions: first.subFunctions,
      coreActivities: first.coreActivities,
      subFunctionActivities: first.subFunctionActivities,
      workflows: first.workflows,
      phases: first.phases,
      steps: first.steps,
      stepActivities: first.stepActivities,
      people: first.people,
      roles: first.roles,
      software: first.software,
      checklistItems: first.checklistItems,
    }
  }
  return {
    company: active.company,
    companyProfile: active.companyProfile || null,
    aiSettings: active.aiSettings || null,
    gapAnalysisHistory: active.gapAnalysisHistory || [],
    functions: active.functions,
    subFunctions: active.subFunctions,
    coreActivities: active.coreActivities,
    subFunctionActivities: active.subFunctionActivities,
    workflows: active.workflows,
    phases: active.phases,
    steps: active.steps,
    stepActivities: active.stepActivities,
    people: active.people,
    roles: active.roles,
    software: active.software,
    checklistItems: active.checklistItems,
  }
}

// Initial state with one default workspace
const defaultWorkspace = createEmptyWorkspace('My Company')
const initialWorkspaces = [defaultWorkspace]

export const useOpsMapStore = create<OpsMapState>()(
  persist(
    (set, get) => ({
      // Workspace management
      workspaces: initialWorkspaces,
      activeWorkspaceId: defaultWorkspace.id,
      currentUserId: null,
      
      getActiveWorkspace: () => {
        const state = get()
        return state.workspaces.find(ws => ws.id === state.activeWorkspaceId) || state.workspaces[0]
      },
      
      addWorkspace: (name) => {
        const state = get()
        const newWorkspace = createEmptyWorkspace(name, state.currentUserId || undefined)
        set(state => ({
          workspaces: [...state.workspaces, newWorkspace],
        }))
        return newWorkspace
      },
      
      // User-scoped workspace management
      setCurrentUserId: (userId) => {
        set({ currentUserId: userId })
      },
      
      getUserWorkspaces: (userId) => {
        const state = get()
        return state.workspaces.filter(ws => ws.userId === userId)
      },
      
      createWorkspaceForUser: (name, userId) => {
        const newWorkspace = createEmptyWorkspace(name, userId)
        set(state => ({
          workspaces: [...state.workspaces, newWorkspace],
        }))
        return newWorkspace
      },
      
      renameWorkspace: (id, name) => {
        set(state => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === id 
              ? { ...ws, name, company: { ...ws.company, name } }
              : ws
          ),
          // Update company if it's the active workspace
          company: state.activeWorkspaceId === id 
            ? { ...state.company!, name }
            : state.company,
        }))
      },
      
      deleteWorkspace: (id) => {
        const state = get()
        // Can't delete the last workspace
        if (state.workspaces.length <= 1) return
        
        const remainingWorkspaces = state.workspaces.filter(ws => ws.id !== id)
        const newActiveId = state.activeWorkspaceId === id 
          ? remainingWorkspaces[0].id 
          : state.activeWorkspaceId
        
        const activeData = getActiveData(remainingWorkspaces, newActiveId)
        
        set({
          workspaces: remainingWorkspaces,
          activeWorkspaceId: newActiveId,
          ...activeData,
        })
      },
      
      switchWorkspace: (id) => {
        const state = get()
        const workspace = state.workspaces.find(ws => ws.id === id)
        if (!workspace) return
        
        set({
          activeWorkspaceId: id,
          company: workspace.company,
          companyProfile: workspace.companyProfile || defaultCompanyProfile,
          aiSettings: workspace.aiSettings || defaultAISettings,
          gapAnalysisHistory: workspace.gapAnalysisHistory || [],
          functions: workspace.functions,
          subFunctions: workspace.subFunctions,
          coreActivities: workspace.coreActivities,
          subFunctionActivities: workspace.subFunctionActivities,
          workflows: workspace.workflows,
          phases: workspace.phases,
          steps: workspace.steps,
          stepActivities: workspace.stepActivities,
          people: workspace.people,
          roles: workspace.roles,
          software: workspace.software,
          checklistItems: workspace.checklistItems,
        })
      },
      
      // Company - computed from active workspace
      company: defaultWorkspace.company,
      setCompany: (company) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          company,
        })))
      },
      
      // Company Profile - for AI context
      companyProfile: defaultCompanyProfile,
      setCompanyProfile: (profile) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          companyProfile: profile,
        })))
      },
      updateCompanyProfile: (updates) => {
        set(state => {
          const current = state.companyProfile || defaultCompanyProfile
          return updateActiveWorkspace(state, ws => ({
            ...ws,
            companyProfile: { ...current, ...updates },
          }))
        })
      },
      
      // AI Settings
      aiSettings: defaultAISettings,
      setAISettings: (settings) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          aiSettings: settings,
        })))
      },
      
      // Gap Analysis History
      gapAnalysisHistory: [],
      addGapAnalysis: (analysis) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          gapAnalysisHistory: [...(ws.gapAnalysisHistory || []), analysis],
        })))
      },
      markGapApplied: (analysisId, gapId) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          gapAnalysisHistory: (ws.gapAnalysisHistory || []).map(a =>
            a.id === analysisId
              ? {
                  ...a,
                  gaps: a.gaps.map(g =>
                    g.id === gapId ? { ...g, applied: true } : g
                  ),
                }
              : a
          ),
        })))
      },
      
      // Functions - computed from active workspace
      functions: [],
      addFunction: (name, description) => {
        const state = get()
        const funcs = state.functions
        const newFunc: Function = {
          id: generateId(),
          companyId: state.company?.id || '',
          name,
          description,
          status: 'draft',
          orderIndex: funcs.length,
          color: FUNCTION_COLORS[funcs.length % FUNCTION_COLORS.length],
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          functions: [...ws.functions, newFunc],
        })))
        return newFunc
      },
      updateFunction: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          functions: ws.functions.map(f =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })))
      },
      deleteFunction: (id) => {
        set(state => {
          const subFuncIds = state.subFunctions
            .filter(sf => sf.functionId === id)
            .map(sf => sf.id)
          
          return updateActiveWorkspace(state, ws => ({
            ...ws,
            functions: ws.functions.filter(f => f.id !== id),
            subFunctions: ws.subFunctions.filter(sf => sf.functionId !== id),
            subFunctionActivities: ws.subFunctionActivities.filter(
              sfa => !subFuncIds.includes(sfa.subFunctionId)
            ),
          }))
        })
      },
      reorderFunctions: (ids) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          functions: ws.functions.map(f => ({
            ...f,
            orderIndex: ids.indexOf(f.id),
          })),
        })))
      },
      setFunctionStatus: (id, status) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          functions: ws.functions.map(f =>
            f.id === id ? { ...f, status } : f
          ),
        })))
      },
      
      // Sub-Functions
      subFunctions: [],
      addSubFunction: (functionId, name, description) => {
        const state = get()
        const subs = state.subFunctions.filter(sf => sf.functionId === functionId)
        const newSub: SubFunction = {
          id: generateId(),
          functionId,
          name,
          description,
          status: 'draft',
          orderIndex: subs.length,
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          subFunctions: [...ws.subFunctions, newSub],
        })))
        return newSub
      },
      updateSubFunction: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          subFunctions: ws.subFunctions.map(sf =>
            sf.id === id ? { ...sf, ...updates } : sf
          ),
        })))
      },
      deleteSubFunction: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          subFunctions: ws.subFunctions.filter(sf => sf.id !== id),
          subFunctionActivities: ws.subFunctionActivities.filter(
            sfa => sfa.subFunctionId !== id
          ),
        })))
      },
      reorderSubFunctions: (functionId, ids) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          subFunctions: ws.subFunctions.map(sf =>
            sf.functionId === functionId
              ? { ...sf, orderIndex: ids.indexOf(sf.id) }
              : sf
          ),
        })))
      },
      setSubFunctionStatus: (id, status) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          subFunctions: ws.subFunctions.map(sf =>
            sf.id === id ? { ...sf, status } : sf
          ),
        })))
      },
      
      // Core Activities
      coreActivities: [],
      addCoreActivity: (name, description) => {
        const state = get()
        const newActivity: CoreActivity = {
          id: generateId(),
          companyId: state.company?.id || '',
          name,
          description,
          status: 'draft',
          publishedAt: undefined,
          createdAt: new Date(),
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: [...ws.coreActivities, newActivity],
        })))
        return newActivity
      },
      updateCoreActivity: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: ws.coreActivities.map(a =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })))
      },
      updateActivityVideo: (id, videoUrl, videoType) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: ws.coreActivities.map(a =>
            a.id === id ? {
              ...a,
              videoUrl: videoUrl || undefined,
              videoType: videoType || undefined,
            } : a
          ),
        })))
      },
      updateActivityRoles: (id, roleIds) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: ws.coreActivities.map(a =>
            a.id === id ? {
              ...a,
              roleIds: roleIds.length > 0 ? roleIds : undefined,
              roleId: roleIds[0] || undefined,
            } : a
          ),
        })))
      },
      updateActivityPeople: (id, ownerIds) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: ws.coreActivities.map(a =>
            a.id === id ? {
              ...a,
              ownerIds: ownerIds.length > 0 ? ownerIds : undefined,
              ownerId: ownerIds[0] || undefined,
            } : a
          ),
        })))
      },
      updateActivitySoftware: (id, softwareIds) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: ws.coreActivities.map(a =>
            a.id === id ? {
              ...a,
              softwareIds: softwareIds.length > 0 ? softwareIds : undefined,
            } : a
          ),
        })))
      },
      deleteCoreActivity: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: ws.coreActivities.filter(a => a.id !== id),
          subFunctionActivities: ws.subFunctionActivities.filter(
            sfa => sfa.coreActivityId !== id
          ),
          stepActivities: ws.stepActivities.filter(
            sa => sa.coreActivityId !== id
          ),
          checklistItems: ws.checklistItems.filter(
            ci => ci.coreActivityId !== id
          ),
        })))
      },
      setActivityStatus: (id, status) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: ws.coreActivities.map(a =>
            a.id === id ? { ...a, status } : a
          ),
        })))
      },
      publishActivity: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          coreActivities: ws.coreActivities.map(a =>
            a.id === id ? { ...a, status: 'active', publishedAt: new Date() } : a
          ),
        })))
      },
      
      // Sub-Function <-> Activity Links
      subFunctionActivities: [],
      linkActivityToSubFunction: (subFunctionId, activityId) => {
        const state = get()
        const existing = state.subFunctionActivities.find(
          sfa => sfa.subFunctionId === subFunctionId && sfa.coreActivityId === activityId
        )
        if (existing) return
        const count = state.subFunctionActivities.filter(
          sfa => sfa.subFunctionId === subFunctionId
        ).length
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          subFunctionActivities: [
            ...ws.subFunctionActivities,
            { subFunctionId, coreActivityId: activityId, orderIndex: count },
          ],
        })))
      },
      unlinkActivityFromSubFunction: (subFunctionId, activityId) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          subFunctionActivities: ws.subFunctionActivities.filter(
            sfa => !(sfa.subFunctionId === subFunctionId && sfa.coreActivityId === activityId)
          ),
        })))
      },
      getActivitiesForSubFunction: (subFunctionId) => {
        const state = get()
        const links = state.subFunctionActivities
          .filter(sfa => sfa.subFunctionId === subFunctionId)
          .sort((a, b) => a.orderIndex - b.orderIndex)
        return links
          .map(l => state.coreActivities.find(a => a.id === l.coreActivityId)!)
          .filter(Boolean)
      },
      
      // Workflows
      workflows: [],
      addWorkflow: (name, description) => {
        const state = get()
        const newWorkflow: Workflow = {
          id: generateId(),
          companyId: state.company?.id || '',
          name,
          description,
          status: 'draft',
          publishedAt: undefined,
          createdAt: new Date(),
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          workflows: [...ws.workflows, newWorkflow],
        })))
        return newWorkflow
      },
      updateWorkflow: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          workflows: ws.workflows.map(w =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })))
      },
      deleteWorkflow: (id) => {
        set(state => {
          const phaseIds = state.phases.filter(p => p.workflowId === id).map(p => p.id)
          const stepIds = state.steps.filter(s => phaseIds.includes(s.phaseId)).map(s => s.id)
          
          return updateActiveWorkspace(state, ws => ({
            ...ws,
            workflows: ws.workflows.filter(w => w.id !== id),
            phases: ws.phases.filter(p => p.workflowId !== id),
            steps: ws.steps.filter(s => !phaseIds.includes(s.phaseId)),
            stepActivities: ws.stepActivities.filter(sa => !stepIds.includes(sa.stepId)),
          }))
        })
      },
      setWorkflowStatus: (id, status) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          workflows: ws.workflows.map(w =>
            w.id === id ? { ...w, status } : w
          ),
        })))
      },
      publishWorkflow: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          workflows: ws.workflows.map(w =>
            w.id === id ? { ...w, status: 'active', publishedAt: new Date() } : w
          ),
        })))
      },
      statusFilter: ['gap', 'draft', 'active'],
      setStatusFilter: (statuses) => {
        set({ statusFilter: statuses })
      },
      filteredWorkflows: () => {
        const state = get()
        return state.workflows.filter(w => state.statusFilter.includes(w.status))
      },
      filteredActivities: () => {
        const state = get()
        return state.coreActivities.filter(a => state.statusFilter.includes(a.status))
      },
      
      // Phases
      phases: [],
      addPhase: (workflowId, name) => {
        const state = get()
        const existing = state.phases.filter(p => p.workflowId === workflowId)
        const newPhase: Phase = {
          id: generateId(),
          workflowId,
          name,
          orderIndex: existing.length,
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          phases: [...ws.phases, newPhase],
        })))
        return newPhase
      },
      updatePhase: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          phases: ws.phases.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })))
      },
      deletePhase: (id) => {
        set(state => {
          const stepIds = state.steps.filter(s => s.phaseId === id).map(s => s.id)
          
          return updateActiveWorkspace(state, ws => ({
            ...ws,
            phases: ws.phases.filter(p => p.id !== id),
            steps: ws.steps.filter(s => s.phaseId !== id),
            stepActivities: ws.stepActivities.filter(sa => !stepIds.includes(sa.stepId)),
          }))
        })
      },
      reorderPhases: (workflowId, ids) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          phases: ws.phases.map(p =>
            p.workflowId === workflowId
              ? { ...p, orderIndex: ids.indexOf(p.id) }
              : p
          ),
        })))
      },
      
      // Steps
      steps: [],
      addStep: (phaseId, name) => {
        const state = get()
        const existing = state.steps.filter(s => s.phaseId === phaseId)
        const newStep: Step = {
          id: generateId(),
          phaseId,
          name,
          orderIndex: existing.length,
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          steps: [...ws.steps, newStep],
        })))
        return newStep
      },
      updateStep: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          steps: ws.steps.map(s =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })))
      },
      deleteStep: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          steps: ws.steps.filter(s => s.id !== id),
          stepActivities: ws.stepActivities.filter(sa => sa.stepId !== id),
        })))
      },
      reorderSteps: (phaseId, ids) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          steps: ws.steps.map(s =>
            s.phaseId === phaseId ? { ...s, orderIndex: ids.indexOf(s.id) } : s
          ),
        })))
      },
      
      // Step <-> Activity Links
      stepActivities: [],
      linkActivityToStep: (stepId, activityId) => {
        const state = get()
        const existing = state.stepActivities.find(
          sa => sa.stepId === stepId && sa.coreActivityId === activityId
        )
        if (existing) return
        const count = state.stepActivities.filter(sa => sa.stepId === stepId).length
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          stepActivities: [
            ...ws.stepActivities,
            { stepId, coreActivityId: activityId, orderIndex: count },
          ],
        })))
      },
      unlinkActivityFromStep: (stepId, activityId) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          stepActivities: ws.stepActivities.filter(
            sa => !(sa.stepId === stepId && sa.coreActivityId === activityId)
          ),
        })))
      },
      getActivitiesForStep: (stepId) => {
        const state = get()
        const links = state.stepActivities
          .filter(sa => sa.stepId === stepId)
          .sort((a, b) => a.orderIndex - b.orderIndex)
        return links
          .map(l => state.coreActivities.find(a => a.id === l.coreActivityId)!)
          .filter(Boolean)
      },
      getWorkflowsContainingActivity: (activityId) => {
        const state = get()
        const workflowIds = new Set<string>()
        state.stepActivities
          .filter(sa => sa.coreActivityId === activityId)
          .forEach(sa => {
            const step = state.steps.find(s => s.id === sa.stepId)
            if (!step) return
            const phase = state.phases.find(p => p.id === step.phaseId)
            if (!phase) return
            workflowIds.add(phase.workflowId)
          })
        return state.workflows.filter(w => workflowIds.has(w.id))
      },
      
      // People
      people: [],
      addPerson: (name, email) => {
        const state = get()
        const newPerson: Person = {
          id: generateId(),
          companyId: state.company?.id || '',
          name,
          email,
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          people: [...ws.people, newPerson],
        })))
        return newPerson
      },
      updatePerson: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          people: ws.people.map(p =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })))
      },
      deletePerson: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          people: ws.people.filter(p => p.id !== id),
          coreActivities: ws.coreActivities.map(a =>
            a.ownerId === id ? { ...a, ownerId: undefined } : a
          ),
        })))
      },
      
      // Roles
      roles: [],
      addRole: (name, description) => {
        const state = get()
        const newRole: Role = {
          id: generateId(),
          companyId: state.company?.id || '',
          name,
          description,
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          roles: [...ws.roles, newRole],
        })))
        return newRole
      },
      updateRole: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          roles: ws.roles.map(r =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })))
      },
      deleteRole: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          roles: ws.roles.filter(r => r.id !== id),
          coreActivities: ws.coreActivities.map(a =>
            a.roleId === id ? { ...a, roleId: undefined } : a
          ),
          people: ws.people.map(p =>
            p.roleId === id ? { ...p, roleId: undefined } : p
          ),
        })))
      },
      
      // Software
      software: [],
      addSoftware: (name, url) => {
        const state = get()
        const newSoftware: Software = {
          id: generateId(),
          companyId: state.company?.id || '',
          name,
          url,
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          software: [...ws.software, newSoftware],
        })))
        return newSoftware
      },
      updateSoftware: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          software: ws.software.map(s =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })))
      },
      deleteSoftware: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          software: ws.software.filter(s => s.id !== id),
        })))
      },
      
      // Checklist Items
      checklistItems: [],
      addChecklistItem: (activityId, text) => {
        const state = get()
        const existing = state.checklistItems.filter(
          ci => ci.coreActivityId === activityId
        )
        const newItem: ChecklistItem = {
          id: generateId(),
          coreActivityId: activityId,
          text,
          orderIndex: existing.length,
          completed: false,
        }
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          checklistItems: [...ws.checklistItems, newItem],
        })))
        return newItem
      },
      updateChecklistItem: (id, updates) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          checklistItems: ws.checklistItems.map(ci =>
            ci.id === id ? { ...ci, ...updates } : ci
          ),
        })))
      },
      deleteChecklistItem: (id) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          checklistItems: ws.checklistItems.filter(ci => ci.id !== id),
        })))
      },
      reorderChecklistItems: (activityId, ids) => {
        set(state => updateActiveWorkspace(state, ws => ({
          ...ws,
          checklistItems: ws.checklistItems.map(ci =>
            ci.coreActivityId === activityId
              ? { ...ci, orderIndex: ids.indexOf(ci.id) }
              : ci
          ),
        })))
      },
      getChecklistForActivity: (activityId) => {
        return get()
          .checklistItems.filter(ci => ci.coreActivityId === activityId)
          .sort((a, b) => a.orderIndex - b.orderIndex)
      },

      // Utility functions
      clearAllData: () => {
        const state = get()
        const emptyWorkspace = createEmptyWorkspace('My Company')
        emptyWorkspace.id = state.activeWorkspaceId // Keep same ID to preserve reference
        
        set(state => ({
          workspaces: state.workspaces.map(ws =>
            ws.id === state.activeWorkspaceId ? emptyWorkspace : ws
          ),
          company: emptyWorkspace.company,
          functions: [],
          subFunctions: [],
          coreActivities: [],
          subFunctionActivities: [],
          workflows: [],
          phases: [],
          steps: [],
          stepActivities: [],
          people: [],
          roles: [],
          software: [],
          checklistItems: [],
        }))
      },

      loadDemoData: () => {
        const state = get()
        const companyId = generateId()
        
        // First clear the current workspace
        set(state => {
          const emptyWorkspace = createEmptyWorkspace('Summit Construction Co.')
          emptyWorkspace.id = state.activeWorkspaceId
          emptyWorkspace.company.name = 'Summit Construction Co.'
          
          return {
            workspaces: state.workspaces.map(ws =>
              ws.id === state.activeWorkspaceId ? emptyWorkspace : ws
            ),
            company: emptyWorkspace.company,
            functions: [],
            subFunctions: [],
            coreActivities: [],
            subFunctionActivities: [],
            workflows: [],
            phases: [],
            steps: [],
            stepActivities: [],
            people: [],
            roles: [],
            software: [],
            checklistItems: [],
          }
        })

        // Add roles first
        const roleMap: Record<string, string> = {}
        const roles = [
          { name: 'Owner', description: 'Business owner and final decision maker' },
          { name: 'Project Manager', description: 'Oversees project execution' },
          { name: 'Sales Rep', description: 'Handles client acquisition' },
          { name: 'Designer', description: 'Creates project designs' },
          { name: 'Estimator', description: 'Builds estimates and proposals' },
          { name: 'Admin', description: 'Handles administrative tasks' },
        ]
        roles.forEach(r => {
          const role = get().addRole(r.name, r.description)
          roleMap[r.name] = role.id
        })

        // Add people
        const peopleData = [
          { name: 'Mike Johnson', email: 'mike@summit.com', role: 'Owner' },
          { name: 'Sarah Chen', email: 'sarah@summit.com', role: 'Project Manager' },
          { name: 'Tom Williams', email: 'tom@summit.com', role: 'Sales Rep' },
          { name: 'Lisa Garcia', email: 'lisa@summit.com', role: 'Designer' },
          { name: 'James Brown', email: 'james@summit.com', role: 'Estimator' },
        ]
        peopleData.forEach(p => {
          const person = get().addPerson(p.name, p.email)
          if (roleMap[p.role]) {
            get().updatePerson(person.id, { roleId: roleMap[p.role] })
          }
        })

        // Add software
        const softwareData = [
          { name: 'HubSpot', url: 'https://hubspot.com' },
          { name: 'BuilderTrend', url: 'https://buildertrend.com' },
          { name: 'QuickBooks', url: 'https://quickbooks.com' },
          { name: 'Chief Architect', url: 'https://chiefarchitect.com' },
          { name: 'Google Workspace', url: 'https://workspace.google.com' },
        ]
        softwareData.forEach(s => get().addSoftware(s.name, s.url))

        // Add functions and sub-functions
        const functionsData: Array<{
          name: string
          description: string
          color: string
          status: Status
          subs: string[]
        }> = [
          { name: 'Marketing', description: 'Lead generation and brand awareness', color: '#3B82F6', status: 'active', subs: ['Brand Awareness', 'Lead Generation', 'Content Marketing', 'Referral Program'] },
          { name: 'Sales', description: 'Converting leads to clients', color: '#10B981', status: 'active', subs: ['Lead Qualification', 'Discovery', 'Proposal Delivery', 'Contract Signing'] },
          { name: 'Design', description: 'Project design and planning', color: '#F59E0B', status: 'draft', subs: ['Initial Concepts', 'Design Development', 'Selections', 'Final Plans'] },
          { name: 'Estimating', description: 'Pricing and proposals', color: '#EF4444', status: 'gap', subs: ['Material Takeoff', 'Labor Estimation', 'Vendor Quotes', 'Proposal Building'] },
          { name: 'Production', description: 'Project execution and delivery', color: '#8B5CF6', status: 'draft', subs: ['Pre-Construction', 'Rough-In', 'Finishes', 'Punch List'] },
          { name: 'Finance', description: 'Accounting and cash flow', color: '#EC4899', status: 'active', subs: ['Invoicing', 'Collections', 'Payroll', 'Job Costing'] },
          { name: 'Administration', description: 'Operations and support', color: '#06B6D4', status: 'gap', subs: ['Scheduling', 'Permits', 'Insurance', 'HR'] },
        ]

        const subFunctionMap: Record<string, string> = {}
        const subStatusCycle: Status[] = ['active', 'draft', 'gap']
        functionsData.forEach((f, fIndex) => {
          const func = get().addFunction(f.name, f.description)
          get().updateFunction(func.id, { color: f.color, status: f.status })
          f.subs.forEach((subName, subIndex) => {
            const sub = get().addSubFunction(func.id, subName)
            get().updateSubFunction(sub.id, { status: subStatusCycle[(fIndex + subIndex) % subStatusCycle.length] })
            subFunctionMap[subName] = sub.id
          })
        })

        // Add activities and link to sub-functions
        const activitiesData: Record<string, string[]> = {
          'Lead Generation': ['Run social media ads', 'Post to Houzz', 'Send email newsletter', 'Host open house'],
          'Discovery': ['Schedule discovery call', 'Conduct site visit', 'Document client requirements', 'Review budget expectations'],
          'Proposal Delivery': ['Present proposal in person', 'Walk through scope', 'Answer questions', 'Handle objections'],
          'Pre-Construction': ['Order materials', 'Schedule subcontractors', 'Create project schedule', 'Hold pre-con meeting'],
          'Punch List': ['Create punch list', 'Complete punch items', 'Schedule final walk', 'Obtain sign-off'],
        }
        const activityVideoMap: Record<string, { url: string; type: 'loom' | 'gdrive' }> = {
          'Run social media ads': {
            url: 'https://www.loom.com/share/3f3a1c9d4b1e4e1c8a7d2c9b5a1f2c3d',
            type: 'loom',
          },
          'Schedule discovery call': {
            url: 'https://drive.google.com/file/d/1a2B3c4D5e6F7g8H9i0JkLmNoPqRstuV/view',
            type: 'gdrive',
          },
        }

        Object.entries(activitiesData).forEach(([subFuncName, activities]) => {
          const subFuncId = subFunctionMap[subFuncName]
          if (subFuncId) {
            activities.forEach((actName, actIndex) => {
              const activity = get().addCoreActivity(actName)
              const status = subStatusCycle[(actIndex + activities.length) % subStatusCycle.length]
              get().updateCoreActivity(activity.id, { status })
              const video = activityVideoMap[actName]
              if (video) {
                get().updateActivityVideo(activity.id, video.url, video.type)
              }
              get().linkActivityToSubFunction(subFuncId, activity.id)
            })
          }
        })

        // Add workflows
        const workflowData = {
          name: 'Client Journey',
          description: 'End-to-end client experience from lead to completion',
          phases: [
            { name: 'Lead', steps: ['Capture lead info', 'Send intro email', 'Qualify lead'] },
            { name: 'Discovery', steps: ['Schedule call', 'Conduct site visit', 'Document needs'] },
            { name: 'Proposal', steps: ['Build estimate', 'Create proposal', 'Present to client'] },
            { name: 'Contract', steps: ['Send contract', 'Collect deposit', 'Schedule kickoff'] },
            { name: 'Production', steps: ['Pre-construction', 'Execute work', 'Quality checks'] },
            { name: 'Completion', steps: ['Final walk', 'Collect final payment', 'Request review'] },
          ],
        }

        const workflow = get().addWorkflow(workflowData.name, workflowData.description)
        get().updateWorkflow(workflow.id, { status: 'active', publishedAt: new Date() })
        workflowData.phases.forEach(phaseData => {
          const phase = get().addPhase(workflow.id, phaseData.name)
          phaseData.steps.forEach(stepName => {
            get().addStep(phase.id, stepName)
          })
        })

        // Add second workflow
        const workflow2Data = {
          name: 'Sales Process',
          description: 'Converting leads to signed contracts',
          phases: [
            { name: 'Qualify', steps: ['Review lead source', 'Check budget fit', 'Assess project scope'] },
            { name: 'Discover', steps: ['Schedule discovery', 'Site visit', 'Document requirements'] },
            { name: 'Propose', steps: ['Build estimate', 'Package proposal', 'Present'] },
            { name: 'Close', steps: ['Handle objections', 'Negotiate terms', 'Sign contract'] },
          ],
        }

        const workflow2 = get().addWorkflow(workflow2Data.name, workflow2Data.description)
        get().updateWorkflow(workflow2.id, { status: 'draft' })
        workflow2Data.phases.forEach(phaseData => {
          const phase = get().addPhase(workflow2.id, phaseData.name)
          phaseData.steps.forEach(stepName => {
            get().addStep(phase.id, stepName)
          })
        })
      },

      loadTemplate: (templateId: string) => {
        // Dynamic import to avoid circular dependencies
        import('@/lib/templates').then(({ getTemplate }) => {
          const template = getTemplate(templateId)
          if (!template) return

          const state = get()
          
          // Clear and set company
          set(state => {
            const emptyWorkspace = createEmptyWorkspace(template.data.companyName)
            emptyWorkspace.id = state.activeWorkspaceId
            
            return {
              workspaces: state.workspaces.map(ws =>
                ws.id === state.activeWorkspaceId ? emptyWorkspace : ws
              ),
              company: emptyWorkspace.company,
              functions: [],
              subFunctions: [],
              coreActivities: [],
              subFunctionActivities: [],
              workflows: [],
              phases: [],
              steps: [],
              stepActivities: [],
              people: [],
              roles: [],
              software: [],
              checklistItems: [],
            }
          })

          // Add roles
          template.data.roles.forEach(r => {
            get().addRole(r.name, r.description)
          })

          // Add functions, sub-functions, and activities
          template.data.functions.forEach(funcData => {
            const func = get().addFunction(funcData.name, funcData.description)
            get().updateFunction(func.id, { color: funcData.color })
            
            funcData.subFunctions.forEach(subData => {
              const sub = get().addSubFunction(func.id, subData.name)
              
              subData.activities.forEach(actName => {
                const activity = get().addCoreActivity(actName)
                get().linkActivityToSubFunction(sub.id, activity.id)
              })
            })
          })

          // Add workflows
          template.data.workflows.forEach(wfData => {
            const workflow = get().addWorkflow(wfData.name, wfData.description)
            
            wfData.phases.forEach(phaseData => {
              const phase = get().addPhase(workflow.id, phaseData.name)
              
              phaseData.steps.forEach(stepName => {
                get().addStep(phase.id, stepName)
              })
            })
          })
        })
      },
    }),
    {
      name: 'ops-map-storage',
      version: 3, // Bump version to handle status fields
      migrate: (persistedState: any, version: number) => {
        if (version < 3) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const normalizeStatus = (items: any[] = []) =>
            items.map(item => ({
              ...item,
              status: item.status || 'draft',
            }))

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const normalizePublishedAt = (items: any[] = []) =>
            items.map(item => ({
              ...item,
              publishedAt: item.publishedAt,
            }))

          if (persistedState.workspaces) {
            persistedState.workspaces = persistedState.workspaces.map((ws: Workspace) => ({
              ...ws,
              functions: normalizeStatus(ws.functions),
              subFunctions: normalizeStatus(ws.subFunctions),
              coreActivities: normalizePublishedAt(normalizeStatus(ws.coreActivities)),
              workflows: normalizePublishedAt(normalizeStatus(ws.workflows)),
            }))
          } else {
            persistedState.functions = normalizeStatus(persistedState.functions)
            persistedState.subFunctions = normalizeStatus(persistedState.subFunctions)
            persistedState.coreActivities = normalizePublishedAt(normalizeStatus(persistedState.coreActivities))
            persistedState.workflows = normalizePublishedAt(normalizeStatus(persistedState.workflows))
          }
          if (!persistedState.statusFilter) {
            persistedState.statusFilter = ['gap', 'draft', 'active']
          }
        }
        if (version < 2) {
          // Migrate from single-workspace to multi-workspace
          const oldState = persistedState as any
          
          // Create first workspace from existing data
          const firstWorkspace: Workspace = {
            id: generateId(),
            name: oldState.company?.name || 'My Company',
            createdAt: oldState.company?.createdAt || new Date(),
            company: oldState.company || {
              id: generateId(),
              name: 'My Company',
              createdAt: new Date(),
            },
            functions: oldState.functions || [],
            subFunctions: oldState.subFunctions || [],
            coreActivities: oldState.coreActivities || [],
            subFunctionActivities: oldState.subFunctionActivities || [],
            workflows: oldState.workflows || [],
            phases: oldState.phases || [],
            steps: oldState.steps || [],
            stepActivities: oldState.stepActivities || [],
            people: oldState.people || [],
            roles: oldState.roles || [],
            software: oldState.software || [],
            checklistItems: oldState.checklistItems || [],
          }
          
          return {
            ...oldState,
            workspaces: [firstWorkspace],
            activeWorkspaceId: firstWorkspace.id,
          }
        }
        return persistedState
      },
    }
  )
)
