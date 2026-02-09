import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type {
  Company,
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

interface OpsMapState {
  // Company
  company: Company | null
  setCompany: (company: Company) => void
  
  // Functions
  functions: Function[]
  addFunction: (name: string, description?: string) => Function
  updateFunction: (id: string, updates: Partial<Function>) => void
  deleteFunction: (id: string) => void
  reorderFunctions: (ids: string[]) => void
  
  // Sub-Functions
  subFunctions: SubFunction[]
  addSubFunction: (functionId: string, name: string, description?: string) => SubFunction
  updateSubFunction: (id: string, updates: Partial<SubFunction>) => void
  deleteSubFunction: (id: string) => void
  reorderSubFunctions: (functionId: string, ids: string[]) => void
  
  // Core Activities
  coreActivities: CoreActivity[]
  addCoreActivity: (name: string, description?: string) => CoreActivity
  updateCoreActivity: (id: string, updates: Partial<CoreActivity>) => void
  deleteCoreActivity: (id: string) => void
  
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
}

export const useOpsMapStore = create<OpsMapState>()(
  persist(
    (set, get) => ({
      // Company
      company: {
        id: generateId(),
        name: 'My Company',
        createdAt: new Date(),
      },
      setCompany: (company) => set({ company }),
      
      // Functions
      functions: [],
      addFunction: (name, description) => {
        const funcs = get().functions
        const newFunc: Function = {
          id: generateId(),
          companyId: get().company?.id || '',
          name,
          description,
          orderIndex: funcs.length,
          color: FUNCTION_COLORS[funcs.length % FUNCTION_COLORS.length],
        }
        set({ functions: [...funcs, newFunc] })
        return newFunc
      },
      updateFunction: (id, updates) => {
        set({
          functions: get().functions.map((f) =>
            f.id === id ? { ...f, ...updates } : f
          ),
        })
      },
      deleteFunction: (id) => {
        // Also delete related sub-functions and their activity links
        const subFuncIds = get().subFunctions.filter(sf => sf.functionId === id).map(sf => sf.id)
        set({
          functions: get().functions.filter((f) => f.id !== id),
          subFunctions: get().subFunctions.filter((sf) => sf.functionId !== id),
          subFunctionActivities: get().subFunctionActivities.filter(
            (sfa) => !subFuncIds.includes(sfa.subFunctionId)
          ),
        })
      },
      reorderFunctions: (ids) => {
        set({
          functions: get().functions.map((f) => ({
            ...f,
            orderIndex: ids.indexOf(f.id),
          })),
        })
      },
      
      // Sub-Functions
      subFunctions: [],
      addSubFunction: (functionId, name, description) => {
        const subs = get().subFunctions.filter((sf) => sf.functionId === functionId)
        const newSub: SubFunction = {
          id: generateId(),
          functionId,
          name,
          description,
          orderIndex: subs.length,
        }
        set({ subFunctions: [...get().subFunctions, newSub] })
        return newSub
      },
      updateSubFunction: (id, updates) => {
        set({
          subFunctions: get().subFunctions.map((sf) =>
            sf.id === id ? { ...sf, ...updates } : sf
          ),
        })
      },
      deleteSubFunction: (id) => {
        set({
          subFunctions: get().subFunctions.filter((sf) => sf.id !== id),
          subFunctionActivities: get().subFunctionActivities.filter(
            (sfa) => sfa.subFunctionId !== id
          ),
        })
      },
      reorderSubFunctions: (functionId, ids) => {
        set({
          subFunctions: get().subFunctions.map((sf) =>
            sf.functionId === functionId
              ? { ...sf, orderIndex: ids.indexOf(sf.id) }
              : sf
          ),
        })
      },
      
      // Core Activities
      coreActivities: [],
      addCoreActivity: (name, description) => {
        const newActivity: CoreActivity = {
          id: generateId(),
          companyId: get().company?.id || '',
          name,
          description,
          createdAt: new Date(),
        }
        set({ coreActivities: [...get().coreActivities, newActivity] })
        return newActivity
      },
      updateCoreActivity: (id, updates) => {
        set({
          coreActivities: get().coreActivities.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        })
      },
      deleteCoreActivity: (id) => {
        set({
          coreActivities: get().coreActivities.filter((a) => a.id !== id),
          subFunctionActivities: get().subFunctionActivities.filter(
            (sfa) => sfa.coreActivityId !== id
          ),
          stepActivities: get().stepActivities.filter(
            (sa) => sa.coreActivityId !== id
          ),
          checklistItems: get().checklistItems.filter(
            (ci) => ci.coreActivityId !== id
          ),
        })
      },
      
      // Sub-Function <-> Activity Links
      subFunctionActivities: [],
      linkActivityToSubFunction: (subFunctionId, activityId) => {
        const existing = get().subFunctionActivities.find(
          (sfa) => sfa.subFunctionId === subFunctionId && sfa.coreActivityId === activityId
        )
        if (existing) return
        const count = get().subFunctionActivities.filter(
          (sfa) => sfa.subFunctionId === subFunctionId
        ).length
        set({
          subFunctionActivities: [
            ...get().subFunctionActivities,
            { subFunctionId, coreActivityId: activityId, orderIndex: count },
          ],
        })
      },
      unlinkActivityFromSubFunction: (subFunctionId, activityId) => {
        set({
          subFunctionActivities: get().subFunctionActivities.filter(
            (sfa) =>
              !(sfa.subFunctionId === subFunctionId && sfa.coreActivityId === activityId)
          ),
        })
      },
      getActivitiesForSubFunction: (subFunctionId) => {
        const links = get()
          .subFunctionActivities.filter((sfa) => sfa.subFunctionId === subFunctionId)
          .sort((a, b) => a.orderIndex - b.orderIndex)
        const activities = get().coreActivities
        return links.map((l) => activities.find((a) => a.id === l.coreActivityId)!).filter(Boolean)
      },
      
      // Workflows
      workflows: [],
      addWorkflow: (name, description) => {
        const newWorkflow: Workflow = {
          id: generateId(),
          companyId: get().company?.id || '',
          name,
          description,
          createdAt: new Date(),
        }
        set({ workflows: [...get().workflows, newWorkflow] })
        return newWorkflow
      },
      updateWorkflow: (id, updates) => {
        set({
          workflows: get().workflows.map((w) =>
            w.id === id ? { ...w, ...updates } : w
          ),
        })
      },
      deleteWorkflow: (id) => {
        const phaseIds = get().phases.filter(p => p.workflowId === id).map(p => p.id)
        const stepIds = get().steps.filter(s => phaseIds.includes(s.phaseId)).map(s => s.id)
        set({
          workflows: get().workflows.filter((w) => w.id !== id),
          phases: get().phases.filter((p) => p.workflowId !== id),
          steps: get().steps.filter((s) => !phaseIds.includes(s.phaseId)),
          stepActivities: get().stepActivities.filter((sa) => !stepIds.includes(sa.stepId)),
        })
      },
      
      // Phases
      phases: [],
      addPhase: (workflowId, name) => {
        const existing = get().phases.filter((p) => p.workflowId === workflowId)
        const newPhase: Phase = {
          id: generateId(),
          workflowId,
          name,
          orderIndex: existing.length,
        }
        set({ phases: [...get().phases, newPhase] })
        return newPhase
      },
      updatePhase: (id, updates) => {
        set({
          phases: get().phases.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })
      },
      deletePhase: (id) => {
        const stepIds = get().steps.filter(s => s.phaseId === id).map(s => s.id)
        set({
          phases: get().phases.filter((p) => p.id !== id),
          steps: get().steps.filter((s) => s.phaseId !== id),
          stepActivities: get().stepActivities.filter((sa) => !stepIds.includes(sa.stepId)),
        })
      },
      reorderPhases: (workflowId, ids) => {
        set({
          phases: get().phases.map((p) =>
            p.workflowId === workflowId
              ? { ...p, orderIndex: ids.indexOf(p.id) }
              : p
          ),
        })
      },
      
      // Steps
      steps: [],
      addStep: (phaseId, name) => {
        const existing = get().steps.filter((s) => s.phaseId === phaseId)
        const newStep: Step = {
          id: generateId(),
          phaseId,
          name,
          orderIndex: existing.length,
        }
        set({ steps: [...get().steps, newStep] })
        return newStep
      },
      updateStep: (id, updates) => {
        set({
          steps: get().steps.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })
      },
      deleteStep: (id) => {
        set({
          steps: get().steps.filter((s) => s.id !== id),
          stepActivities: get().stepActivities.filter((sa) => sa.stepId !== id),
        })
      },
      reorderSteps: (phaseId, ids) => {
        set({
          steps: get().steps.map((s) =>
            s.phaseId === phaseId ? { ...s, orderIndex: ids.indexOf(s.id) } : s
          ),
        })
      },
      
      // Step <-> Activity Links
      stepActivities: [],
      linkActivityToStep: (stepId, activityId) => {
        const existing = get().stepActivities.find(
          (sa) => sa.stepId === stepId && sa.coreActivityId === activityId
        )
        if (existing) return
        const count = get().stepActivities.filter((sa) => sa.stepId === stepId).length
        set({
          stepActivities: [
            ...get().stepActivities,
            { stepId, coreActivityId: activityId, orderIndex: count },
          ],
        })
      },
      unlinkActivityFromStep: (stepId, activityId) => {
        set({
          stepActivities: get().stepActivities.filter(
            (sa) => !(sa.stepId === stepId && sa.coreActivityId === activityId)
          ),
        })
      },
      getActivitiesForStep: (stepId) => {
        const links = get()
          .stepActivities.filter((sa) => sa.stepId === stepId)
          .sort((a, b) => a.orderIndex - b.orderIndex)
        const activities = get().coreActivities
        return links.map((l) => activities.find((a) => a.id === l.coreActivityId)!).filter(Boolean)
      },
      
      // People
      people: [],
      addPerson: (name, email) => {
        const newPerson: Person = {
          id: generateId(),
          companyId: get().company?.id || '',
          name,
          email,
        }
        set({ people: [...get().people, newPerson] })
        return newPerson
      },
      updatePerson: (id, updates) => {
        set({
          people: get().people.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        })
      },
      deletePerson: (id) => {
        set({
          people: get().people.filter((p) => p.id !== id),
          coreActivities: get().coreActivities.map((a) =>
            a.ownerId === id ? { ...a, ownerId: undefined } : a
          ),
        })
      },
      
      // Roles
      roles: [],
      addRole: (name, description) => {
        const newRole: Role = {
          id: generateId(),
          companyId: get().company?.id || '',
          name,
          description,
        }
        set({ roles: [...get().roles, newRole] })
        return newRole
      },
      updateRole: (id, updates) => {
        set({
          roles: get().roles.map((r) =>
            r.id === id ? { ...r, ...updates } : r
          ),
        })
      },
      deleteRole: (id) => {
        set({
          roles: get().roles.filter((r) => r.id !== id),
          coreActivities: get().coreActivities.map((a) =>
            a.roleId === id ? { ...a, roleId: undefined } : a
          ),
          people: get().people.map((p) =>
            p.roleId === id ? { ...p, roleId: undefined } : p
          ),
        })
      },
      
      // Software
      software: [],
      addSoftware: (name, url) => {
        const newSoftware: Software = {
          id: generateId(),
          companyId: get().company?.id || '',
          name,
          url,
        }
        set({ software: [...get().software, newSoftware] })
        return newSoftware
      },
      updateSoftware: (id, updates) => {
        set({
          software: get().software.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })
      },
      deleteSoftware: (id) => {
        set({ software: get().software.filter((s) => s.id !== id) })
      },
      
      // Checklist Items
      checklistItems: [],
      addChecklistItem: (activityId, text) => {
        const existing = get().checklistItems.filter(
          (ci) => ci.coreActivityId === activityId
        )
        const newItem: ChecklistItem = {
          id: generateId(),
          coreActivityId: activityId,
          text,
          orderIndex: existing.length,
          completed: false,
        }
        set({ checklistItems: [...get().checklistItems, newItem] })
        return newItem
      },
      updateChecklistItem: (id, updates) => {
        set({
          checklistItems: get().checklistItems.map((ci) =>
            ci.id === id ? { ...ci, ...updates } : ci
          ),
        })
      },
      deleteChecklistItem: (id) => {
        set({ checklistItems: get().checklistItems.filter((ci) => ci.id !== id) })
      },
      reorderChecklistItems: (activityId, ids) => {
        set({
          checklistItems: get().checklistItems.map((ci) =>
            ci.coreActivityId === activityId
              ? { ...ci, orderIndex: ids.indexOf(ci.id) }
              : ci
          ),
        })
      },
      getChecklistForActivity: (activityId) => {
        return get()
          .checklistItems.filter((ci) => ci.coreActivityId === activityId)
          .sort((a, b) => a.orderIndex - b.orderIndex)
      },

      // Utility functions
      clearAllData: () => {
        set({
          company: { id: generateId(), name: 'My Company', createdAt: new Date() },
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
        })
      },

      loadDemoData: () => {
        const companyId = generateId()
        
        // Clear first
        set({
          company: { id: companyId, name: 'Summit Construction Co.', createdAt: new Date() },
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
        const functionsData = [
          { name: 'Marketing', description: 'Lead generation and brand awareness', color: '#3B82F6', subs: ['Brand Awareness', 'Lead Generation', 'Content Marketing', 'Referral Program'] },
          { name: 'Sales', description: 'Converting leads to clients', color: '#10B981', subs: ['Lead Qualification', 'Discovery', 'Proposal Delivery', 'Contract Signing'] },
          { name: 'Design', description: 'Project design and planning', color: '#F59E0B', subs: ['Initial Concepts', 'Design Development', 'Selections', 'Final Plans'] },
          { name: 'Estimating', description: 'Pricing and proposals', color: '#EF4444', subs: ['Material Takeoff', 'Labor Estimation', 'Vendor Quotes', 'Proposal Building'] },
          { name: 'Production', description: 'Project execution and delivery', color: '#8B5CF6', subs: ['Pre-Construction', 'Rough-In', 'Finishes', 'Punch List'] },
          { name: 'Finance', description: 'Accounting and cash flow', color: '#EC4899', subs: ['Invoicing', 'Collections', 'Payroll', 'Job Costing'] },
          { name: 'Administration', description: 'Operations and support', color: '#06B6D4', subs: ['Scheduling', 'Permits', 'Insurance', 'HR'] },
        ]

        const subFunctionMap: Record<string, string> = {}
        functionsData.forEach(f => {
          const func = get().addFunction(f.name, f.description)
          get().updateFunction(func.id, { color: f.color })
          f.subs.forEach(subName => {
            const sub = get().addSubFunction(func.id, subName)
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

        Object.entries(activitiesData).forEach(([subFuncName, activities]) => {
          const subFuncId = subFunctionMap[subFuncName]
          if (subFuncId) {
            activities.forEach(actName => {
              const activity = get().addCoreActivity(actName)
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
        workflow2Data.phases.forEach(phaseData => {
          const phase = get().addPhase(workflow2.id, phaseData.name)
          phaseData.steps.forEach(stepName => {
            get().addStep(phase.id, stepName)
          })
        })
      },
    }),
    {
      name: 'ops-map-storage',
    }
  )
)
