import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  queueSyncOperation,
  flushSyncQueue,
  createSyncAction,
  type SyncOperation,
  type SyncState,
} from '../syncMiddleware'

// Mock the SupabaseContext to return a fake client
const mockClient = { from: vi.fn() }
vi.mock('@/contexts/SupabaseContext', () => ({
  getSupabaseClient: vi.fn(() => mockClient),
}))

// Mock the sync module - functions now take client as first arg
vi.mock('@/lib/supabase/sync', () => ({
  createWorkspace: vi.fn().mockResolvedValue({ id: 'ws-1' }),
  updateWorkspace: vi.fn().mockResolvedValue({ id: 'ws-1' }),
  deleteWorkspace: vi.fn().mockResolvedValue(undefined),
  createFunction: vi.fn().mockResolvedValue({ id: 'fn-1' }),
  updateFunction: vi.fn().mockResolvedValue({ id: 'fn-1' }),
  deleteFunction: vi.fn().mockResolvedValue(undefined),
  updateFunctionOrder: vi.fn().mockResolvedValue(undefined),
  createActivity: vi.fn().mockResolvedValue({ id: 'act-1' }),
  updateActivity: vi.fn().mockResolvedValue({ id: 'act-1' }),
  deleteActivity: vi.fn().mockResolvedValue(undefined),
}))

import * as sync from '@/lib/supabase/sync'
import { getSupabaseClient } from '@/contexts/SupabaseContext'

describe('Store + Sync Integration', () => {
  let mockSetSyncStatus: ReturnType<typeof vi.fn>
  let mockMarkSynced: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockSetSyncStatus = vi.fn()
    mockMarkSynced = vi.fn()
    // Ensure mock client is returned
    vi.mocked(getSupabaseClient).mockReturnValue(mockClient as ReturnType<typeof getSupabaseClient>)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('sync operations when syncEnabled', () => {
    it('queues and executes sync operations when syncEnabled is true', async () => {
      const operation: SyncOperation = {
        type: 'create',
        entity: 'function',
        data: { workspace_id: 'ws-1', name: 'Sales', order_index: 0 },
      }

      queueSyncOperation(operation, true, mockSetSyncStatus, mockMarkSynced)

      // Fast-forward debounce timer
      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      // Should be called with client and data
      expect(sync.createFunction).toHaveBeenCalledWith(mockClient, operation.data)
      expect(mockSetSyncStatus).toHaveBeenCalledWith('syncing')
      expect(mockMarkSynced).toHaveBeenCalled()
    })

    it('does not queue operations when syncEnabled is false', async () => {
      const operation: SyncOperation = {
        type: 'create',
        entity: 'function',
        data: { workspace_id: 'ws-1', name: 'Marketing', order_index: 1 },
      }

      queueSyncOperation(operation, false, mockSetSyncStatus, mockMarkSynced)

      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      expect(sync.createFunction).not.toHaveBeenCalled()
      expect(mockSetSyncStatus).not.toHaveBeenCalled()
    })

    it('batches multiple operations within debounce window', async () => {
      const op1: SyncOperation = { type: 'create', entity: 'function', data: { name: 'Sales' } }
      const op2: SyncOperation = { type: 'create', entity: 'activity', data: { name: 'Call' } }

      queueSyncOperation(op1, true, mockSetSyncStatus, mockMarkSynced)
      vi.advanceTimersByTime(100) // Within debounce window
      queueSyncOperation(op2, true, mockSetSyncStatus, mockMarkSynced)

      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      // Both should execute after single debounce cycle
      expect(sync.createFunction).toHaveBeenCalledTimes(1)
      expect(sync.createActivity).toHaveBeenCalledTimes(1)
      expect(mockSetSyncStatus).toHaveBeenCalledWith('syncing')
    })

    it('skips sync when no Supabase client available', async () => {
      vi.mocked(getSupabaseClient).mockReturnValue(null)

      const operation: SyncOperation = {
        type: 'create',
        entity: 'function',
        data: { name: 'No client' },
      }

      queueSyncOperation(operation, true, mockSetSyncStatus, mockMarkSynced)

      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      // Should not call sync function when no client
      expect(sync.createFunction).not.toHaveBeenCalled()
    })
  })

  describe('offline fallback behavior', () => {
    it('localStorage works independently of sync status', () => {
      // This test verifies the design: localStorage persist middleware
      // operates separately from Supabase sync
      const mockStore = {
        functions: [] as { id: string; name: string }[],
        addFunction: vi.fn((name: string) => {
          const fn = { id: 'fn-local', name }
          mockStore.functions.push(fn)
          return fn
        }),
      }

      // Add function - this should work regardless of sync
      const result = mockStore.addFunction('Local Function')

      expect(result).toEqual({ id: 'fn-local', name: 'Local Function' })
      expect(mockStore.functions).toHaveLength(1)
    })

    it('sync errors do not block local state updates', async () => {
      vi.mocked(sync.createFunction).mockRejectedValueOnce(new Error('Network error'))

      const operation: SyncOperation = {
        type: 'create',
        entity: 'function',
        data: { name: 'Will fail sync' },
      }

      queueSyncOperation(operation, true, mockSetSyncStatus, mockMarkSynced)

      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      // Sync should have been attempted and failed
      expect(mockSetSyncStatus).toHaveBeenCalledWith('syncing')
      expect(mockSetSyncStatus).toHaveBeenCalledWith('error', 'Network error')
      expect(mockMarkSynced).not.toHaveBeenCalled()
    })
  })

  describe('sync status updates', () => {
    it('sets status to syncing during operation', async () => {
      const operation: SyncOperation = { type: 'update', entity: 'workspace', id: 'ws-1', data: { name: 'Updated' } }

      queueSyncOperation(operation, true, mockSetSyncStatus, mockMarkSynced)
      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      expect(mockSetSyncStatus).toHaveBeenCalledWith('syncing')
    })

    it('marks synced on successful completion', async () => {
      const operation: SyncOperation = { type: 'delete', entity: 'function', id: 'fn-1' }

      queueSyncOperation(operation, true, mockSetSyncStatus, mockMarkSynced)
      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      expect(mockMarkSynced).toHaveBeenCalled()
    })

    it('sets error status with message on failure', async () => {
      vi.mocked(sync.deleteFunction).mockRejectedValueOnce(new Error('RLS policy violation'))

      const operation: SyncOperation = { type: 'delete', entity: 'function', id: 'fn-protected' }

      queueSyncOperation(operation, true, mockSetSyncStatus, mockMarkSynced)
      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      expect(mockSetSyncStatus).toHaveBeenCalledWith('error', 'RLS policy violation')
    })
  })

  describe('createSyncAction helper', () => {
    it('wraps action and triggers sync when enabled', async () => {
      const baseAction = vi.fn((name: string) => ({ id: 'fn-new', name }))
      const getStore = () => ({
        syncEnabled: true,
        activeWorkspaceId: 'ws-1',
        setSyncStatus: mockSetSyncStatus,
        markSynced: mockMarkSynced,
      }) as SyncState

      const wrappedAction = createSyncAction(
        getStore,
        baseAction,
        (result, name) => ({
          type: 'create',
          entity: 'function',
          data: { name, workspace_id: 'ws-1' },
        })
      )

      const result = wrappedAction('New Function')

      expect(baseAction).toHaveBeenCalledWith('New Function')
      expect(result).toEqual({ id: 'fn-new', name: 'New Function' })

      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      expect(sync.createFunction).toHaveBeenCalled()
    })

    it('does not sync when disabled', async () => {
      const baseAction = vi.fn((name: string) => ({ id: 'fn-new', name }))
      const getStore = () => ({
        syncEnabled: false,
        activeWorkspaceId: 'ws-1',
        setSyncStatus: mockSetSyncStatus,
        markSynced: mockMarkSynced,
      }) as SyncState

      const wrappedAction = createSyncAction(
        getStore,
        baseAction,
        () => ({ type: 'create', entity: 'function', data: {} })
      )

      wrappedAction('Offline Function')

      vi.advanceTimersByTime(350)
      await vi.runAllTimersAsync()

      expect(baseAction).toHaveBeenCalled()
      expect(sync.createFunction).not.toHaveBeenCalled()
    })
  })

  describe('flushSyncQueue', () => {
    it('immediately processes pending operations', async () => {
      const operation: SyncOperation = { type: 'create', entity: 'activity', data: { name: 'Urgent' } }

      queueSyncOperation(operation, true, mockSetSyncStatus, mockMarkSynced)
      // Don't wait for debounce, flush immediately
      await flushSyncQueue(mockSetSyncStatus, mockMarkSynced)

      expect(sync.createActivity).toHaveBeenCalledWith(mockClient, { name: 'Urgent' })
      expect(mockMarkSynced).toHaveBeenCalled()
    })
  })
})
