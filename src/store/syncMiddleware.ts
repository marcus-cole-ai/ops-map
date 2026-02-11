/**
 * Zustand middleware for Supabase sync
 * 
 * Intercepts store mutations and syncs changes to Supabase when syncEnabled is true.
 * localStorage (via persist middleware) remains the offline fallback.
 */

import * as sync from '@/lib/supabase/sync'

// Sync operation types
export type SyncOperation = {
  type: string
  entity: string
  id?: string
  data?: Record<string, unknown>
  workspaceId?: string
  parentId?: string
  orderUpdates?: { id: string; order_index: number }[]
}

// Queue for pending sync operations (for batching/debouncing)
let syncQueue: SyncOperation[] = []
let syncTimeout: ReturnType<typeof setTimeout> | null = null
const SYNC_DEBOUNCE_MS = 300

/**
 * Execute a sync operation against Supabase
 */
async function executeSyncOperation(op: SyncOperation): Promise<void> {
  switch (op.entity) {
    // Workspace operations
    case 'workspace':
      if (op.type === 'create') {
        await sync.createWorkspace(op.data as sync.WorkspaceInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateWorkspace(op.id, op.data as sync.WorkspaceUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteWorkspace(op.id)
      }
      break

    // Function operations
    case 'function':
      if (op.type === 'create') {
        await sync.createFunction(op.data as sync.FunctionInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateFunction(op.id, op.data as sync.FunctionUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteFunction(op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updateFunctionOrder(op.orderUpdates)
      }
      break

    // Sub-function operations
    case 'subFunction':
      if (op.type === 'create') {
        await sync.createSubFunction(op.data as sync.SubFunctionInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateSubFunction(op.id, op.data as sync.SubFunctionUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteSubFunction(op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updateSubFunctionOrder(op.orderUpdates)
      }
      break

    // Activity operations
    case 'activity':
      if (op.type === 'create') {
        await sync.createActivity(op.data as sync.CoreActivityInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateActivity(op.id, op.data as sync.CoreActivityUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteActivity(op.id)
      }
      break

    // Checklist operations
    case 'checklistItem':
      if (op.type === 'create') {
        await sync.createChecklistItem(op.data as sync.ChecklistItemInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateChecklistItem(op.id, op.data as sync.ChecklistItemUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteChecklistItem(op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updateChecklistItemOrder(op.orderUpdates)
      }
      break

    // Workflow operations
    case 'workflow':
      if (op.type === 'create') {
        await sync.createWorkflow(op.data as sync.WorkflowInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateWorkflow(op.id, op.data as sync.WorkflowUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteWorkflow(op.id)
      }
      break

    // Phase operations
    case 'phase':
      if (op.type === 'create') {
        await sync.createPhase(op.data as sync.PhaseInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updatePhase(op.id, op.data as sync.PhaseUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deletePhase(op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updatePhaseOrder(op.orderUpdates)
      }
      break

    // Step operations
    case 'step':
      if (op.type === 'create') {
        await sync.createStep(op.data as sync.StepInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateStep(op.id, op.data as sync.StepUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteStep(op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updateStepOrder(op.orderUpdates)
      }
      break

    // People operations
    case 'person':
      if (op.type === 'create') {
        await sync.createPerson(op.data as sync.PersonInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updatePerson(op.id, op.data as sync.PersonUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deletePerson(op.id)
      }
      break

    // Role operations
    case 'role':
      if (op.type === 'create') {
        await sync.createRole(op.data as sync.RoleInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateRole(op.id, op.data as sync.RoleUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteRole(op.id)
      }
      break

    // Software operations
    case 'software':
      if (op.type === 'create') {
        await sync.createSoftware(op.data as sync.SoftwareInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateSoftware(op.id, op.data as sync.SoftwareUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteSoftware(op.id)
      }
      break

    default:
      console.warn(`Unknown sync entity: ${op.entity}`)
  }
}

/**
 * Process all queued sync operations
 */
async function processQueue(
  setSyncStatus: (status: 'idle' | 'syncing' | 'error', error?: string | null) => void,
  markSynced: () => void
): Promise<void> {
  if (syncQueue.length === 0) return

  const operations = [...syncQueue]
  syncQueue = []

  setSyncStatus('syncing')

  try {
    // Execute all operations in parallel (could batch by entity type if needed)
    await Promise.all(operations.map(executeSyncOperation))
    markSynced()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error'
    console.error('Sync error:', message)
    setSyncStatus('error', message)
    // localStorage fallback is already handled by persist middleware
  }
}

/**
 * Queue a sync operation with debouncing
 */
export function queueSyncOperation(
  operation: SyncOperation,
  syncEnabled: boolean,
  setSyncStatus: (status: 'idle' | 'syncing' | 'error', error?: string | null) => void,
  markSynced: () => void
): void {
  if (!syncEnabled) return

  syncQueue.push(operation)

  // Debounce sync operations
  if (syncTimeout) {
    clearTimeout(syncTimeout)
  }
  syncTimeout = setTimeout(() => {
    processQueue(setSyncStatus, markSynced)
    syncTimeout = null
  }, SYNC_DEBOUNCE_MS)
}

/**
 * Force flush all pending sync operations immediately
 */
export async function flushSyncQueue(
  setSyncStatus: (status: 'idle' | 'syncing' | 'error', error?: string | null) => void,
  markSynced: () => void
): Promise<void> {
  if (syncTimeout) {
    clearTimeout(syncTimeout)
    syncTimeout = null
  }
  await processQueue(setSyncStatus, markSynced)
}

// Type for sync state in store
export type SyncState = {
  syncEnabled: boolean
  activeWorkspaceId: string
  setSyncStatus: (status: 'idle' | 'syncing' | 'error', error?: string | null) => void
  markSynced: () => void
}

/**
 * Helper to create a sync-aware action wrapper
 * Use this in components to wrap store actions that should trigger Supabase sync
 * 
 * @example
 * const addFunctionWithSync = createSyncAction(
 *   store,
 *   store.addFunction,
 *   (func, name) => ({ type: 'create', entity: 'function', data: { ... } })
 * )
 */
export function createSyncAction<TStore extends SyncState, TArgs extends unknown[], TResult>(
  getStore: () => TStore,
  action: (...args: TArgs) => TResult,
  getSyncOp: (result: TResult, ...args: TArgs) => SyncOperation | null
): (...args: TArgs) => TResult {
  return (...args: TArgs): TResult => {
    const result = action(...args)
    const state = getStore()
    
    if (state.syncEnabled) {
      const op = getSyncOp(result, ...args)
      if (op) {
        queueSyncOperation(op, state.syncEnabled, state.setSyncStatus, state.markSynced)
      }
    }
    
    return result
  }
}
