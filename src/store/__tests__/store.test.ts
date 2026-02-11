import { describe, it, expect } from 'vitest'
import { useOpsMapStore } from '../index'

describe('OpsMapStore', () => {
  describe('initialization', () => {
    it('should export a Zustand store hook', () => {
      expect(useOpsMapStore).toBeDefined()
      expect(typeof useOpsMapStore).toBe('function')
      expect(typeof useOpsMapStore.getState).toBe('function')
      expect(typeof useOpsMapStore.setState).toBe('function')
    })

    it('should have workspace management methods', () => {
      const state = useOpsMapStore.getState()
      expect(typeof state.addWorkspace).toBe('function')
      expect(typeof state.switchWorkspace).toBe('function')
      expect(typeof state.deleteWorkspace).toBe('function')
      expect(typeof state.getActiveWorkspace).toBe('function')
    })

    it('should have function management methods', () => {
      const state = useOpsMapStore.getState()
      expect(typeof state.addFunction).toBe('function')
      expect(typeof state.updateFunction).toBe('function')
      expect(typeof state.deleteFunction).toBe('function')
      expect(typeof state.reorderFunctions).toBe('function')
    })

    it('should have activity management methods', () => {
      const state = useOpsMapStore.getState()
      expect(typeof state.addCoreActivity).toBe('function')
      expect(typeof state.updateCoreActivity).toBe('function')
      expect(typeof state.deleteCoreActivity).toBe('function')
    })

    it('should have workflow management methods', () => {
      const state = useOpsMapStore.getState()
      expect(typeof state.addWorkflow).toBe('function')
      expect(typeof state.addPhase).toBe('function')
      expect(typeof state.addStep).toBe('function')
    })

    it('should have checklist management methods', () => {
      const state = useOpsMapStore.getState()
      expect(typeof state.addChecklistItem).toBe('function')
      expect(typeof state.updateChecklistItem).toBe('function')
      expect(typeof state.deleteChecklistItem).toBe('function')
      expect(typeof state.reorderChecklistItems).toBe('function')
      expect(typeof state.getChecklistForActivity).toBe('function')
    })

    it('should have people/roles/software management methods', () => {
      const state = useOpsMapStore.getState()
      expect(typeof state.addPerson).toBe('function')
      expect(typeof state.addRole).toBe('function')
      expect(typeof state.addSoftware).toBe('function')
    })
  })

  describe('state structure', () => {
    it('should have workspaces array', () => {
      const state = useOpsMapStore.getState()
      expect(Array.isArray(state.workspaces)).toBe(true)
    })

    it('should have activeWorkspaceId', () => {
      const state = useOpsMapStore.getState()
      expect(state).toHaveProperty('activeWorkspaceId')
    })

    it('should have entity arrays', () => {
      const state = useOpsMapStore.getState()
      expect(Array.isArray(state.functions)).toBe(true)
      expect(Array.isArray(state.subFunctions)).toBe(true)
      expect(Array.isArray(state.coreActivities)).toBe(true)
      expect(Array.isArray(state.workflows)).toBe(true)
      expect(Array.isArray(state.phases)).toBe(true)
      expect(Array.isArray(state.steps)).toBe(true)
      expect(Array.isArray(state.people)).toBe(true)
      expect(Array.isArray(state.roles)).toBe(true)
      expect(Array.isArray(state.software)).toBe(true)
      expect(Array.isArray(state.checklistItems)).toBe(true)
    })
  })
})
