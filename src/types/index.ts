// Core Types for OpsMap

export interface Company {
  id: string
  name: string
  createdAt: Date
}

// Company Profile - feeds all AI operations
export interface CompanyProfile {
  industry: string  // e.g., "Residential Remodeling", "Commercial Construction"
  companyType: string  // e.g., "Design-Build", "General Contractor", "Specialty"
  size: string  // e.g., "1-5 employees", "6-20", "21-50", "51+"
  annualRevenue: string  // e.g., "$500K-1M", "$1M-5M", "$5M-10M", "$10M+"
  targetMargin: number  // percentage
  idealProject: string  // text description
  serviceArea: string  // geographic
  specialties: string[]  // array of strings
  challenges: string  // current pain points
}

// AI Settings
export interface AISettings {
  preferredModel: 'gemini-flash' | 'kimi-2.5'
}

// Gap Analysis from AI
export interface GapAnalysis {
  id: string
  createdAt: Date
  gaps: AIGap[]
}

export interface AIGap {
  id: string
  title: string
  description: string
  category: 'workflow' | 'function-chart' | 'activity' | 'general'
  priority: 'critical' | 'important' | 'nice-to-have'
  recommendation: string
  suggestedAction?: {
    type: 'add-workflow' | 'add-phase' | 'add-step' | 'add-function' | 'add-activity'
    data: Record<string, unknown>
  }
  applied: boolean
}

// Workspace contains all data for a single client/company
export interface Workspace {
  id: string
  name: string
  createdAt: Date
  userId?: string  // Clerk user ID - workspaces are isolated per user
  // Company settings
  company: Company
  companyProfile?: CompanyProfile  // Feeds AI operations
  aiSettings?: AISettings  // AI model preferences
  gapAnalysisHistory?: GapAnalysis[]  // Track previous AI analyses
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
