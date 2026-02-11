# Ops Map Codebase Review

**Reviewer:** Nick Forge (Engineering Specialist)  
**Date:** 2026-02-11  
**Version:** v0.1.0

---

## Executive Summary

**Overall Health: 6.5/10 — Functional but with Significant Technical Debt**

The Ops Map codebase is a working MVP with solid foundational choices (Next.js 16, TypeScript, Zustand, Supabase). The application successfully delivers core functionality: function charts, workflows, activities, and basic Supabase sync.

However, there are **31 lint errors** and **34 warnings** that need immediate attention, a **1,574-line monolithic store** that will become increasingly difficult to maintain, and a **critical auth architecture mismatch** between Clerk (frontend auth) and Supabase RLS (expecting Supabase auth).

**Bottom Line:** The app works today but is accumulating debt that will slow down future development. Addressing the issues identified below will set up the codebase for sustainable growth.

---

## Strengths ✅

### 1. Type System
- Well-defined TypeScript types in `src/types/index.ts`
- Database types auto-generated and properly typed in `src/types/database.ts`
- Strong typing throughout the codebase (with some exceptions)

### 2. State Management
- Zustand is an excellent choice — lightweight, predictable, great DX
- Persist middleware properly configured for localStorage fallback
- Migration system handles schema changes between versions

### 3. Supabase Integration
- Clean CRUD operations in `src/lib/supabase/sync.ts`
- Proper RLS policies on all tables (workspace isolation)
- Foreign keys with `ON DELETE CASCADE` for data integrity
- Debounced sync middleware prevents API spam

### 4. Database Schema
- Proper normalization with junction tables
- Cascading deletes prevent orphaned data
- Indexes on foreign keys for query performance
- JSON columns for flexible data (company_profile, ai_settings)

### 5. Test Foundation
- Vitest configured correctly
- 36 tests passing (store + sync operations)
- Test setup handles Supabase mocking properly
- Good test coverage for sync middleware edge cases

### 6. Component Organization
- Logical folder structure (components, app, lib, hooks)
- UI components separated from page components
- Modal pattern consistently applied

### 7. AI Integration
- Clean abstraction in `src/lib/ai/index.ts`
- System prompts are contextual with company profile
- JSON-only responses for reliable parsing

---

## Issues Found 🚨

### Critical Priority

#### C1: Auth Architecture Mismatch (Clerk ↔ Supabase)
**Impact:** Data sync will fail for authenticated users  
**Location:** `src/lib/supabase/client.ts`, `supabase/migrations/*.sql`

The app uses Clerk for frontend authentication but Supabase RLS policies reference `auth.uid()` which expects Supabase auth. This means:
- `auth.uid()` will return `null` for Clerk-authenticated users
- All RLS policies will block data access
- Users can't read or write to Supabase

**Current workaround:** The app checks for Supabase session and skips sync if not present (line 36 in `useInitialDataLoad.ts`). This means sync is effectively disabled.

```typescript
// Current behavior - sync is silently skipped
const { data: { session } } = await supabase.auth.getSession()
if (!session) {
  console.log('No Supabase session, using localStorage only')
  // Sync is disabled - app works offline only!
}
```

**Fix Required:** Implement Clerk-Supabase JWT integration or switch auth providers.

---

#### C2: 31 ESLint Errors (Build Risk)
**Impact:** May block CI/CD, indicates code quality issues  
**Location:** Multiple files

Key errors:
- `@typescript-eslint/no-explicit-any` (2 instances in store migrations)
- `react-hooks/set-state-in-effect` (3 instances causing cascading renders)
- Unused variables throughout

```bash
# Current state
✖ 65 problems (31 errors, 34 warnings)
```

---

### High Priority

#### H1: Monolithic Store (1,574 lines)
**Impact:** Hard to maintain, test, and extend  
**Location:** `src/store/index.ts`

The store contains:
- 28 entity arrays
- 80+ actions/methods
- 150+ lines of demo data
- 100+ lines of migration logic

This violates single responsibility and makes the codebase harder to understand.

**Recommendation:** Split into domain-specific slices:
- `workspaceSlice.ts`
- `functionChartSlice.ts`
- `workflowSlice.ts`
- `activitySlice.ts`
- `resourceSlice.ts` (people, roles, software)

---

#### H2: No Component Tests
**Impact:** Regressions will go unnoticed  
**Location:** `src/components/`

The 36 existing tests only cover:
- Store structure (10 tests)
- Sync integration (11 tests)
- Supabase CRUD (15 tests)

No tests for:
- Page components (12 pages)
- UI components (15+ components)
- Modal interactions
- Hooks behavior

---

#### H3: Missing Error Boundaries
**Impact:** Unhandled errors crash the entire app  
**Location:** App-wide

A single component error will take down the whole application. Need React Error Boundaries around:
- Page content
- Modal content
- Third-party integrations (AI, Supabase)

---

### Medium Priority

#### M1: Hardcoded Demo Data
**Impact:** Bloats store, hard to maintain  
**Location:** `src/store/index.ts` lines 1189-1375

The `loadDemoData()` function is 186 lines of inline data. Should be moved to:
- JSON fixtures
- Seed script
- Template system

---

#### M2: Inconsistent Error Handling
**Impact:** Poor UX on failures  
**Location:** Multiple components

Some async operations show errors, others fail silently:
```typescript
// Good pattern (in sync.ts)
if (error) {
  console.error('Error fetching workspaces:', error)
  throw new Error(`Failed to fetch workspaces: ${error.message}`)
}

// Missing pattern (in many components)
// No try/catch, no user feedback
```

---

#### M3: No Loading States for AI Operations
**Impact:** Poor UX during long operations  
**Location:** `src/app/ai-assistant/page.tsx`, `src/app/gaps/page.tsx`

AI generation can take 10-60 seconds. Need proper loading indicators with:
- Progress feedback
- Cancel capability
- Timeout handling

---

#### M4: setState in useEffect (React Anti-pattern)
**Impact:** Cascading renders, performance issues  
**Locations:**
- `src/components/modals/ActivitySearchModal.tsx:45`
- `src/components/ui/VideoUrlInput.tsx:49`
- `src/app/function-chart/page.tsx`

These should be refactored to use derived state or proper conditional logic.

---

### Low Priority

#### L1: Default README
**Impact:** Poor developer onboarding  
**Location:** `README.md`

Still contains Next.js boilerplate. Should document:
- Project purpose
- Setup instructions
- Environment variables
- Architecture overview

---

#### L2: Missing JSDoc Comments
**Impact:** Harder to understand complex functions  
**Location:** Throughout codebase

Key functions lack documentation:
- `updateActiveWorkspace()`
- `transformToLocalWorkspace()`
- AI generation functions

---

#### L3: Inline Styles vs CSS Classes
**Impact:** Inconsistent styling, harder to theme  
**Location:** All page components

Mix of:
```tsx
// Inline styles
style={{ background: 'var(--cream)', color: 'var(--text-primary)' }}

// CSS classes
className="rounded-xl overflow-hidden transition-all"
```

Should consolidate to Tailwind classes or CSS modules.

---

#### L4: Accessibility Gaps
**Impact:** Not WCAG compliant  
**Locations:**
- Delete buttons lack confirmation text
- Some dropdowns missing ARIA labels
- Color contrast in some status badges

---

## Test Coverage Analysis

| Area | Coverage | Tests | Notes |
|------|----------|-------|-------|
| Store Structure | ✅ Good | 10 | Verifies all methods exist |
| Sync Middleware | ✅ Good | 11 | Covers queue, debounce, errors |
| Supabase CRUD | ✅ Good | 15 | Full coverage of sync.ts |
| Components | ❌ None | 0 | No component tests |
| Pages | ❌ None | 0 | No page tests |
| Hooks | ❌ None | 0 | No custom hook tests |
| AI Functions | ❌ None | 0 | No AI integration tests |

**Recommended Coverage Target:** 70% for critical paths

---

## Performance Observations

### Potential Bottlenecks

1. **Full workspace load on init**
   - `loadFullWorkspace()` makes 6+ parallel Supabase queries
   - Could be slow for large workspaces
   - No pagination implemented

2. **No memoization in list components**
   - Activity list re-renders on any store change
   - Should use `useMemo` for filtered lists

3. **Large store subscriptions**
   - Many components subscribe to entire store
   - Should use selector functions

### Current Performance

The app feels responsive for small datasets. Performance testing needed for:
- 100+ activities
- 20+ workflows
- 50+ checklist items per activity

---

## Security Assessment

### ✅ Good Practices
- RLS policies on all tables
- No secrets in client code
- Clerk handles auth securely
- Environment variables for config

### ⚠️ Concerns
- **Auth mismatch** means RLS isn't actually protecting data
- No rate limiting on AI API route
- No input sanitization on AI prompts (injection risk)
- API key exposed if Gemini API errors leak to client

### Recommendations
1. Fix Clerk-Supabase auth integration
2. Add rate limiting to `/api/ai/generate`
3. Sanitize user input before sending to AI
4. Ensure AI errors are caught and sanitized

---

## Architecture Assessment

### Is the codebase set up for continued development?

**Yes, with reservations.**

**Positive:**
- Next.js App Router is future-proof
- TypeScript provides type safety
- Zustand is scalable (once sliced)
- Supabase is a solid backend choice

**Blockers to address:**
1. Auth mismatch blocks real sync
2. Store size blocks maintainability
3. Lint errors block CI quality gates
4. Test gaps block confident refactoring

### Recommended Architecture Changes

1. **Split the store** into domain slices
2. **Add service layer** between components and store
3. **Implement proper auth** (Clerk→Supabase JWT or switch providers)
4. **Add API middleware** for rate limiting and error handling

---

## Summary

| Category | Grade | Notes |
|----------|-------|-------|
| Code Quality | C+ | Lint errors, some anti-patterns |
| Type Safety | B+ | Good types, few `any` escapes |
| Test Coverage | C- | Store tested, components not |
| Architecture | B | Sound foundation, needs splitting |
| Security | C | RLS in place but auth broken |
| Performance | B | Fine for MVP, needs optimization for scale |
| Maintainability | C | Monolithic store is the bottleneck |

---

## Recommended Next Steps

1. **Immediate (This Week)**
   - Fix all 31 lint errors
   - Fix `setState` in `useEffect` issues
   - Add basic error boundaries

2. **Short Term (Next 2 Weeks)**
   - Split store into slices
   - Fix Clerk-Supabase auth integration
   - Add component tests for critical paths

3. **Medium Term (This Month)**
   - Achieve 70% test coverage
   - Add proper loading/error states
   - Performance optimize for larger datasets

---

*Review conducted by Nick Forge. See PRD_CODEBASE_IMPROVEMENTS.md for actionable task breakdown.*
