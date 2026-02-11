import { describe, it, expect, vi, beforeEach } from 'vitest'

// Unmock sync functions so we can test them directly
vi.unmock('@/lib/supabase/sync')

// Create chainable mock for Supabase query builder
const createQueryMock = (resolvedValue: { data: unknown; error: unknown }) => {
  const mock = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
    then: vi.fn((resolve) => resolve(resolvedValue)),
  }
  // Make the mock thenable for non-single queries
  Object.defineProperty(mock, 'then', {
    value: (resolve: (value: unknown) => void) => Promise.resolve(resolvedValue).then(resolve),
  })
  return mock
}

let mockQueryBuilder: ReturnType<typeof createQueryMock>

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => mockQueryBuilder),
  },
}))

// Import after mocking
import {
  fetchWorkspaces,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
  fetchFunctions,
  createFunction,
  updateFunction,
  deleteFunction,
} from '../sync'
import { supabase } from '../client'

describe('Supabase Sync Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Workspace CRUD', () => {
    it('fetchWorkspaces returns workspaces for user', async () => {
      const mockWorkspaces = [
        { id: 'ws-1', name: 'Workspace 1', user_id: 'user-1', created_at: '2024-01-01' },
        { id: 'ws-2', name: 'Workspace 2', user_id: 'user-1', created_at: '2024-01-02' },
      ]
      mockQueryBuilder = createQueryMock({ data: mockWorkspaces, error: null })

      const result = await fetchWorkspaces('user-1')

      expect(supabase.from).toHaveBeenCalledWith('workspaces')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockWorkspaces)
    })

    it('fetchWorkspaces returns empty array when no data', async () => {
      mockQueryBuilder = createQueryMock({ data: null, error: null })

      const result = await fetchWorkspaces('user-1')

      expect(result).toEqual([])
    })

    it('fetchWorkspaces throws on error', async () => {
      mockQueryBuilder = createQueryMock({
        data: null,
        error: { message: 'Database error', code: '500' },
      })

      await expect(fetchWorkspaces('user-1')).rejects.toThrow('Failed to fetch workspaces: Database error')
    })

    it('createWorkspace inserts and returns workspace', async () => {
      const newWorkspace = { name: 'New Workspace', user_id: 'user-1' }
      const createdWorkspace = { id: 'ws-new', ...newWorkspace, created_at: '2024-01-01' }
      mockQueryBuilder = createQueryMock({ data: createdWorkspace, error: null })

      const result = await createWorkspace(newWorkspace)

      expect(supabase.from).toHaveBeenCalledWith('workspaces')
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(newWorkspace)
      expect(mockQueryBuilder.single).toHaveBeenCalled()
      expect(result).toEqual(createdWorkspace)
    })

    it('createWorkspace throws on error', async () => {
      mockQueryBuilder = createQueryMock({
        data: null,
        error: { message: 'Insert failed', code: '500' },
      })

      await expect(createWorkspace({ name: 'Test', user_id: 'user-1' })).rejects.toThrow(
        'Failed to create workspace: Insert failed'
      )
    })

    it('updateWorkspace updates and returns workspace', async () => {
      const updates = { name: 'Updated Name' }
      const updatedWorkspace = { id: 'ws-1', name: 'Updated Name', user_id: 'user-1' }
      mockQueryBuilder = createQueryMock({ data: updatedWorkspace, error: null })

      const result = await updateWorkspace('ws-1', updates)

      expect(supabase.from).toHaveBeenCalledWith('workspaces')
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updates)
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'ws-1')
      expect(result).toEqual(updatedWorkspace)
    })

    it('deleteWorkspace deletes without error', async () => {
      mockQueryBuilder = createQueryMock({ data: null, error: null })

      await expect(deleteWorkspace('ws-1')).resolves.toBeUndefined()

      expect(supabase.from).toHaveBeenCalledWith('workspaces')
      expect(mockQueryBuilder.delete).toHaveBeenCalled()
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'ws-1')
    })

    it('deleteWorkspace throws on error', async () => {
      mockQueryBuilder = createQueryMock({
        data: null,
        error: { message: 'Delete failed', code: '500' },
      })

      await expect(deleteWorkspace('ws-1')).rejects.toThrow('Failed to delete workspace: Delete failed')
    })
  })

  describe('Function CRUD', () => {
    it('fetchFunctions returns functions for workspace', async () => {
      const mockFunctions = [
        { id: 'fn-1', workspace_id: 'ws-1', name: 'Sales', order_index: 0 },
        { id: 'fn-2', workspace_id: 'ws-1', name: 'Marketing', order_index: 1 },
      ]
      mockQueryBuilder = createQueryMock({ data: mockFunctions, error: null })

      const result = await fetchFunctions('ws-1')

      expect(supabase.from).toHaveBeenCalledWith('functions')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('workspace_id', 'ws-1')
      expect(mockQueryBuilder.order).toHaveBeenCalledWith('order_index', { ascending: true })
      expect(result).toEqual(mockFunctions)
    })

    it('createFunction inserts and returns function', async () => {
      const newFunc = { workspace_id: 'ws-1', name: 'Operations', order_index: 2 }
      const createdFunc = { id: 'fn-new', ...newFunc }
      mockQueryBuilder = createQueryMock({ data: createdFunc, error: null })

      const result = await createFunction(newFunc)

      expect(supabase.from).toHaveBeenCalledWith('functions')
      expect(mockQueryBuilder.insert).toHaveBeenCalledWith(newFunc)
      expect(result).toEqual(createdFunc)
    })

    it('updateFunction updates and returns function', async () => {
      const updates = { name: 'Updated Function', status: 'active' }
      const updatedFunc = { id: 'fn-1', workspace_id: 'ws-1', ...updates }
      mockQueryBuilder = createQueryMock({ data: updatedFunc, error: null })

      const result = await updateFunction('fn-1', updates)

      expect(supabase.from).toHaveBeenCalledWith('functions')
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(updates)
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'fn-1')
      expect(result).toEqual(updatedFunc)
    })

    it('deleteFunction deletes without error', async () => {
      mockQueryBuilder = createQueryMock({ data: null, error: null })

      await expect(deleteFunction('fn-1')).resolves.toBeUndefined()

      expect(supabase.from).toHaveBeenCalledWith('functions')
      expect(mockQueryBuilder.delete).toHaveBeenCalled()
    })

    it('deleteFunction throws on error', async () => {
      mockQueryBuilder = createQueryMock({
        data: null,
        error: { message: 'Cannot delete: has children', code: '500' },
      })

      await expect(deleteFunction('fn-1')).rejects.toThrow(
        'Failed to delete function: Cannot delete: has children'
      )
    })
  })

  describe('Error Handling', () => {
    it('handles null data gracefully for list operations', async () => {
      mockQueryBuilder = createQueryMock({ data: null, error: null })

      const workspaces = await fetchWorkspaces('user-1')
      expect(workspaces).toEqual([])

      const functions = await fetchFunctions('ws-1')
      expect(functions).toEqual([])
    })

    it('propagates error messages correctly', async () => {
      const errorMessages = [
        'RLS policy violation',
        'Network timeout',
        'Invalid UUID format',
      ]

      for (const message of errorMessages) {
        mockQueryBuilder = createQueryMock({ data: null, error: { message, code: '500' } })
        await expect(fetchWorkspaces('user-1')).rejects.toThrow(message)
      }
    })
  })
})
