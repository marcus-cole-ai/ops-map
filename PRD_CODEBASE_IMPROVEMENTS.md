# PRD: Codebase Improvements

**Project:** Ops Map  
**Created:** 2026-02-11  
**Priority:** High  
**Estimated Effort:** 2-3 weeks

---

## Overview

This PRD addresses technical debt and code quality issues identified in the codebase review. Each task is designed to be atomic (<200 lines changed) and independently shippable.

---

## Phase 1: Critical Fixes (Week 1)

### Task 1.1: Fix ESLint Errors - TypeScript Any
**Priority:** Critical  
**Estimate:** 30 minutes  
**Files:** `src/store/index.ts` (lines 1438, 1492)

Replace `any` types with proper types in migration logic:
```typescript
// Before
const normalizeSteps = (items: any[] = []) =>

// After
const normalizeSteps = (items: Array<Record<string, unknown>> = []) =>
```

**Acceptance Criteria:**
- [ ] No `@typescript-eslint/no-explicit-any` errors
- [ ] Tests still pass
- [ ] Migrations work correctly

---

### Task 1.2: Fix setState in useEffect - ActivitySearchModal
**Priority:** Critical  
**Estimate:** 45 minutes  
**File:** `src/components/modals/ActivitySearchModal.tsx`

Refactor the cascading setState to use derived state or proper conditional logic.

**Acceptance Criteria:**
- [ ] No `react-hooks/set-state-in-effect` error
- [ ] Modal filter behavior unchanged
- [ ] No visual regressions

---

### Task 1.3: Fix setState in useEffect - VideoUrlInput
**Priority:** Critical  
**Estimate:** 30 minutes  
**File:** `src/components/ui/VideoUrlInput.tsx`

Refactor to use controlled component pattern or useEffect cleanup.

**Acceptance Criteria:**
- [ ] No lint errors
- [ ] Video URL input works correctly
- [ ] Platform detection still works

---

### Task 1.4: Fix Unused Variables
**Priority:** High  
**Estimate:** 30 minutes  
**Files:** 
- `src/hooks/useInitialDataLoad.ts`
- `src/store/index.ts`

Remove or use the flagged variables:
- `workspaces` (line 28)
- `syncEnabled` (line 29)
- `state` (lines 1189, 1373)
- `companyId` (line 1190)
- `_legacySop` (line 1443)

**Acceptance Criteria:**
- [ ] 0 unused variable warnings
- [ ] No functionality changes

---

### Task 1.5: Add Root Error Boundary
**Priority:** High  
**Estimate:** 1 hour  
**Files:** 
- `src/components/ErrorBoundary.tsx` (new)
- `src/app/layout.tsx`

Create a React Error Boundary that:
- Catches unhandled errors
- Shows user-friendly error page
- Reports to console (later: error tracking)
- Provides "Try Again" action

**Acceptance Criteria:**
- [ ] Error boundary catches component errors
- [ ] User sees friendly error message
- [ ] Can recover without full page reload

---

### Task 1.6: Document Clerk-Supabase Auth Gap
**Priority:** Critical  
**Estimate:** 30 minutes  
**Files:** 
- `src/lib/supabase/client.ts`
- `README.md`

Add clear documentation and TODO comments explaining:
- Current auth architecture
- Why sync might not work
- What needs to be fixed

**Acceptance Criteria:**
- [ ] Architecture documented
- [ ] Clear TODO with fix path
- [ ] README updated with auth section

---

## Phase 2: Store Refactoring (Week 1-2)

### Task 2.1: Extract Workspace Slice
**Priority:** High  
**Estimate:** 2 hours  
**Files:**
- `src/store/slices/workspaceSlice.ts` (new)
- `src/store/index.ts`

Extract workspace management to separate file:
- `workspaces` state
- `activeWorkspaceId`
- `currentUserId`
- All workspace actions

**Acceptance Criteria:**
- [ ] Workspace slice in separate file
- [ ] Main store imports and uses slice
- [ ] All tests pass
- [ ] App works identically

---

### Task 2.2: Extract Function Chart Slice
**Priority:** High  
**Estimate:** 2 hours  
**Files:**
- `src/store/slices/functionChartSlice.ts` (new)
- `src/store/index.ts`

Extract function chart entities:
- `functions`
- `subFunctions`
- `subFunctionActivities`
- Related actions

**Acceptance Criteria:**
- [ ] Function chart slice separate
- [ ] Imports work correctly
- [ ] Function chart page works

---

### Task 2.3: Extract Workflow Slice
**Priority:** High  
**Estimate:** 2 hours  
**Files:**
- `src/store/slices/workflowSlice.ts` (new)
- `src/store/index.ts`

Extract workflow entities:
- `workflows`
- `phases`
- `steps`
- `stepActivities`
- Related actions

**Acceptance Criteria:**
- [ ] Workflow slice separate
- [ ] Workflow pages work
- [ ] Tests pass

---

### Task 2.4: Extract Activity Slice
**Priority:** High  
**Estimate:** 2 hours  
**Files:**
- `src/store/slices/activitySlice.ts` (new)
- `src/store/index.ts`

Extract activity entities:
- `coreActivities`
- `checklistItems`
- Related actions including search

**Acceptance Criteria:**
- [ ] Activity slice separate
- [ ] Activity page works
- [ ] Checklist functionality preserved

---

### Task 2.5: Extract Resources Slice
**Priority:** Medium  
**Estimate:** 1.5 hours  
**Files:**
- `src/store/slices/resourcesSlice.ts` (new)
- `src/store/index.ts`

Extract resource entities:
- `people`
- `roles`
- `software`
- Related actions

**Acceptance Criteria:**
- [ ] Resources slice separate
- [ ] People/Roles/Software pages work
- [ ] Activity assignments work

---

### Task 2.6: Extract Demo Data to Fixtures
**Priority:** Medium  
**Estimate:** 1 hour  
**Files:**
- `src/lib/fixtures/demoData.ts` (new)
- `src/store/index.ts`

Move the 186-line `loadDemoData` implementation to fixtures file.

**Acceptance Criteria:**
- [ ] Demo data in separate file
- [ ] Store imports and uses fixtures
- [ ] Demo data loads correctly

---

### Task 2.7: Create Store Index with Combined Slices
**Priority:** High  
**Estimate:** 1 hour  
**File:** `src/store/index.ts`

Refactor main store to compose slices:
```typescript
export const useOpsMapStore = create<OpsMapState>()(
  persist(
    (...a) => ({
      ...createWorkspaceSlice(...a),
      ...createFunctionChartSlice(...a),
      ...createWorkflowSlice(...a),
      ...createActivitySlice(...a),
      ...createResourcesSlice(...a),
    }),
    { name: 'ops-map-storage', ... }
  )
)
```

**Acceptance Criteria:**
- [ ] Store composes all slices
- [ ] Store file under 300 lines
- [ ] All functionality preserved
- [ ] Tests pass

---

## Phase 3: Test Coverage (Week 2)

### Task 3.1: Add Dashboard Page Test
**Priority:** Medium  
**Estimate:** 1.5 hours  
**File:** `src/app/__tests__/page.test.tsx` (new)

Test the dashboard:
- Renders stats correctly
- Links work
- Handles empty state

**Acceptance Criteria:**
- [ ] Dashboard renders without error
- [ ] Stats display correctly
- [ ] Navigation works

---

### Task 3.2: Add Function Chart Page Test
**Priority:** Medium  
**Estimate:** 2 hours  
**File:** `src/app/function-chart/__tests__/page.test.tsx` (new)

Test function chart:
- Displays functions
- Add function modal works
- Status filtering works

**Acceptance Criteria:**
- [ ] Page renders
- [ ] Can add function
- [ ] Filter works

---

### Task 3.3: Add Activity Page Test
**Priority:** Medium  
**Estimate:** 2 hours  
**File:** `src/app/activities/__tests__/page.test.tsx` (new)

Test activities:
- List displays
- Detail panel works
- Checklist functionality

**Acceptance Criteria:**
- [ ] Activity list renders
- [ ] Selection shows detail
- [ ] Checklist items work

---

### Task 3.4: Add Modal Component Tests
**Priority:** Medium  
**Estimate:** 1.5 hours  
**File:** `src/components/ui/__tests__/Modal.test.tsx` (new)

Test Modal component:
- Opens/closes
- Handles escape key
- Focus trap works

**Acceptance Criteria:**
- [ ] Modal opens on trigger
- [ ] Closes on escape
- [ ] Accessibility correct

---

### Task 3.5: Add StatusBadge Test
**Priority:** Low  
**Estimate:** 30 minutes  
**File:** `src/components/ui/__tests__/StatusBadge.test.tsx` (new)

Test StatusBadge:
- Renders all statuses
- Correct colors
- Correct text

**Acceptance Criteria:**
- [ ] All 4 status types render
- [ ] Visual appearance correct

---

### Task 3.6: Add useInitialDataLoad Hook Test
**Priority:** Medium  
**Estimate:** 1.5 hours  
**File:** `src/hooks/__tests__/useInitialDataLoad.test.ts` (new)

Test the hook:
- Returns correct states
- Handles no Supabase session
- Handles errors

**Acceptance Criteria:**
- [ ] Load states transition correctly
- [ ] Fallback to localStorage works
- [ ] Errors handled gracefully

---

## Phase 4: Documentation & Polish (Week 2-3)

### Task 4.1: Update README
**Priority:** Medium  
**Estimate:** 1 hour  
**File:** `README.md`

Replace boilerplate with:
- Project description
- Tech stack
- Setup instructions
- Environment variables
- Architecture overview

**Acceptance Criteria:**
- [ ] Clear project description
- [ ] Setup instructions work
- [ ] Env vars documented

---

### Task 4.2: Add JSDoc to Store Helpers
**Priority:** Low  
**Estimate:** 45 minutes  
**File:** `src/store/index.ts` (or slices)

Add JSDoc to key functions:
- `updateActiveWorkspace()`
- `getActiveData()`
- Migration functions

**Acceptance Criteria:**
- [ ] Key functions documented
- [ ] IDE shows descriptions

---

### Task 4.3: Add JSDoc to Supabase Functions
**Priority:** Low  
**Estimate:** 45 minutes  
**Files:** `src/lib/supabase/*.ts`

Document the sync and initialLoad functions.

**Acceptance Criteria:**
- [ ] All exported functions documented
- [ ] Parameter types clear

---

### Task 4.4: Consolidate Inline Styles
**Priority:** Low  
**Estimate:** 2 hours  
**Files:** Multiple page components

Create Tailwind utility classes for common patterns:
```css
/* Example: Replace inline color styles */
.text-primary { color: var(--text-primary); }
.bg-cream { background: var(--cream); }
```

**Acceptance Criteria:**
- [ ] Common styles in utilities
- [ ] Inline styles reduced by 50%
- [ ] Visual appearance unchanged

---

### Task 4.5: Add Accessibility Improvements
**Priority:** Low  
**Estimate:** 1.5 hours  
**Files:** Multiple components

- Add aria-labels to icon buttons
- Add role attributes to interactive elements
- Ensure color contrast meets WCAG AA

**Acceptance Criteria:**
- [ ] All buttons have accessible names
- [ ] Keyboard navigation works
- [ ] Screen reader friendly

---

## Future Considerations (Not in Scope)

These items are noted but not prioritized for this sprint:

1. **Clerk-Supabase JWT Integration** - Requires significant research and possibly backend work
2. **Rate Limiting on AI Routes** - Need to evaluate traffic patterns first
3. **Performance Optimization** - Wait until we have larger datasets to benchmark
4. **Real-time Sync** - Supabase subscriptions for live updates

---

## Task Priority Matrix

| Task | Priority | Effort | Risk if Skipped |
|------|----------|--------|-----------------|
| 1.1 Fix any types | Critical | 30m | Build failures |
| 1.2-1.3 Fix setState | Critical | 75m | Performance issues |
| 1.4 Unused vars | High | 30m | Code confusion |
| 1.5 Error boundary | High | 1h | App crashes |
| 1.6 Auth docs | Critical | 30m | Dev confusion |
| 2.1-2.7 Store split | High | 12h | Unmaintainable code |
| 3.1-3.6 Tests | Medium | 9h | Regression risk |
| 4.1-4.5 Polish | Low | 6h | DX issues |

---

## Definition of Done

For each task:
- [ ] Code changes complete
- [ ] No new lint errors
- [ ] Existing tests pass
- [ ] New tests added (where applicable)
- [ ] Manually tested in browser
- [ ] PR reviewed (if team)

---

*PRD created by Nick Forge based on codebase review findings.*
