// Core Types for OpsMap

export interface Company {
  id: string
  name: string
  createdAt: Date
}

// Workspace contains all data for a single client/company
export interface Workspace {
  id: string
  name: string
  createdAt: Date
  userId?: string  // Clerk user ID - workspaces are isolated per user
  // Company settings
  company: Company
  // All entity data
  functions: Function[]
  subFunctions: SubFunction[]
  coreActivities: CoreActivity[]
  subFunctionActivities: SubFunctionActivity[]
  workflows: Workflow[]
  phases: Phase[]
  steps: Step[]
  stepActivities: StepActivity[]
  people: Person[]
  roles: Role[]
  software: Software[]
  checklistItems: ChecklistItem[]
}

export interface Function {
  id: string
  companyId: string
  name: string
  description?: string
  orderIndex: number
  color: string
}

export interface SubFunction {
  id: string
  functionId: string
  name: string
  description?: string
  orderIndex: number
}

export interface CoreActivity {
  id: string
  companyId: string
  name: string
  description?: string
  ownerId?: string
  roleId?: string
  notes?: string
  // Checklist metadata (checklists live at activity level)
  checklistTrigger?: string    // What causes this checklist to be used
  checklistEndState?: string   // What it looks like when complete
  createdAt: Date
}

export interface SubFunctionActivity {
  subFunctionId: string
  coreActivityId: string
  orderIndex: number
}

export interface Workflow {
  id: string
  companyId: string
  name: string
  description?: string
  createdAt: Date
}

export interface Phase {
  id: string
  workflowId: string
  name: string
  orderIndex: number
}

export interface Step {
  id: string
  phaseId: string
  name: string
  orderIndex: number
  sop?: string  // SOP documentation lives at step level
}

export interface StepActivity {
  stepId: string
  coreActivityId: string
  orderIndex: number
}

export interface Person {
  id: string
  companyId: string
  name: string
  email?: string
  roleId?: string
  reportsTo?: string  // Person ID of who they report to (for org chart hierarchy)
  title?: string      // Job title
}

export interface Role {
  id: string
  companyId: string
  name: string
  description?: string
}

export interface Software {
  id: string
  companyId: string
  name: string
  url?: string
}

export interface ActivitySoftware {
  coreActivityId: string
  softwareId: string
}

export interface ChecklistItem {
  id: string
  coreActivityId: string
  text: string
  orderIndex: number
  completed: boolean
  videoUrl?: string  // Optional video link for the checklist item
}

// Utility type for nested function chart view
export interface FunctionWithChildren extends Function {
  subFunctions: SubFunctionWithActivities[]
}

export interface SubFunctionWithActivities extends SubFunction {
  activities: CoreActivity[]
}

// Utility type for nested workflow view
export interface WorkflowWithPhases extends Workflow {
  phases: PhaseWithSteps[]
}

export interface PhaseWithSteps extends Phase {
  steps: StepWithActivities[]
}

export interface StepWithActivities extends Step {
  activities: CoreActivity[]
}

// Utility type for org chart hierarchy
export interface PersonWithReports extends Person {
  directReports: PersonWithReports[]
}
