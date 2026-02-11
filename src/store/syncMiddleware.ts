/**
 * Zustand middleware for Supabase sync
 * 
 * Intercepts store mutations and syncs changes to Supabase when syncEnabled is true.
 * localStorage (via persist middleware) remains the offline fallback.
 * 
 * Uses the global Supabase client from SupabaseContext for Clerk authentication.
 */

import * as sync from '@/lib/supabase/sync'
import { getSupabaseClient } from '@/contexts/SupabaseContext'

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
  const client = getSupabaseClient()
  
  if (!client) {
    console.warn('Sync operation skipped: No Supabase client available')
    return
  }

  switch (op.entity) {
    // Workspace operations
    case 'workspace':
      if (op.type === 'create') {
        await sync.createWorkspace(client, op.data as sync.WorkspaceInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateWorkspace(client, op.id, op.data as sync.WorkspaceUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteWorkspace(client, op.id)
      }
      break

    // Function operations
    case 'function':
      if (op.type === 'create') {
        await sync.createFunction(client, op.data as sync.FunctionInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateFunction(client, op.id, op.data as sync.FunctionUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteFunction(client, op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updateFunctionOrder(client, op.orderUpdates)
      }
      break

    // Sub-function operations
    case 'subFunction':
      if (op.type === 'create') {
        await sync.createSubFunction(client, op.data as sync.SubFunctionInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateSubFunction(client, op.id, op.data as sync.SubFunctionUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteSubFunction(client, op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updateSubFunctionOrder(client, op.orderUpdates)
      }
      break

    // Activity operations
    case 'activity':
      if (op.type === 'create') {
        await sync.createActivity(client, op.data as sync.CoreActivityInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateActivity(client, op.id, op.data as sync.CoreActivityUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteActivity(client, op.id)
      }
      break

    // Checklist operations
    case 'checklistItem':
      if (op.type === 'create') {
        await sync.createChecklistItem(client, op.data as sync.ChecklistItemInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateChecklistItem(client, op.id, op.data as sync.ChecklistItemUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteChecklistItem(client, op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updateChecklistItemOrder(client, op.orderUpdates)
      }
      break

    // Workflow operations
    case 'workflow':
      if (op.type === 'create') {
        await sync.createWorkflow(client, op.data as sync.WorkflowInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateWorkflow(client, op.id, op.data as sync.WorkflowUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteWorkflow(client, op.id)
      }
      break

    // Phase operations
    case 'phase':
      if (op.type === 'create') {
        await sync.createPhase(client, op.data as sync.PhaseInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updatePhase(client, op.id, op.data as sync.PhaseUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deletePhase(client, op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updatePhaseOrder(client, op.orderUpdates)
      }
      break

    // Step operations
    case 'step':
      if (op.type === 'create') {
        await sync.createStep(client, op.data as sync.StepInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateStep(client, op.id, op.data as sync.StepUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteStep(client, op.id)
      } else if (op.type === 'reorder' && op.orderUpdates) {
        await sync.updateStepOrder(client, op.orderUpdates)
      }
      break

    // People operations
    case 'person':
      if (op.type === 'create') {
        await sync.createPerson(client, op.data as sync.PersonInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updatePerson(client, op.id, op.data as sync.PersonUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deletePerson(client, op.id)
      }
      break

    // Role operations
    case 'role':
      if (op.type === 'create') {
        await sync.createRole(client, op.data as sync.RoleInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateRole(client, op.id, op.data as sync.RoleUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteRole(client, op.id)
      }
      break

    // Software operations
    case 'software':
      if (op.type === 'create') {
        await sync.createSoftware(client, op.data as sync.SoftwareInsert)
      } else if (op.type === 'update' && op.id) {
        await sync.updateSoftware(client, op.id, op.data as sync.SoftwareUpdate)
      } else if (op.type === 'delete' && op.id) {
        await sync.deleteSoftware(client, op.id)
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

  // Check if we have a client before processing
  const client = getSupabaseClient()
  if (!client) {
    console.warn('Sync queue processing skipped: No Supabase client available')
    return
  }

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

  // Check if Supabase client is available
  const client = getSupabaseClient()
  if (!client) {
    console.warn('Sync operation queued but no Supabase client available')
  }

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
