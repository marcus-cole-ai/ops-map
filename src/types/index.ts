// Core Types for OpsMap

export interface Company {
  id: string
  name: string
  createdAt: Date
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
