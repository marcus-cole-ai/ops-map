# PRD: Phase 6 - Backend Persistence

**Goal:** Replace localStorage with Supabase for real persistence, enabling cross-device sync and future collaboration features.

**Estimated Scope:** ~15 tasks, each <200 lines change

---

## Prerequisites

- [x] **Task 0.1:** Create Supabase project and get credentials ✅ (qdmbwinkncaslvnvgyxy)
- [x] **Task 0.2:** Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local ✅

---

## Database Schema

- [x] **Task 1.1:** Create `workspaces` table migration ✅
  - Columns: id, name, user_id, created_at, company_profile (jsonb), ai_settings (jsonb)
  - RLS policy: users can only access their own workspaces
  - ~50 lines

- [x] **Task 1.2:** Create `functions` table migration ✅
  - Columns: id, workspace_id, name, description, status, order_index, color
  - Foreign key to workspaces
  - ~40 lines

- [x] **Task 1.3:** Create `sub_functions` table migration ✅
  - Columns: id, function_id, name, description, status, order_index
  - ~40 lines

- [x] **Task 1.4:** Create `core_activities` table migration ✅
  - Columns: id, workspace_id, name, description, full_description, status, video_url, video_type, checklist_trigger, checklist_end_state, created_at, published_at
  - ~50 lines

- [x] **Task 1.5:** Create `checklist_items` table migration ✅
  - Columns: id, activity_id, text, order_index, completed, video_url
  - ~35 lines

- [x] **Task 1.6:** Create `workflows` table migration ✅
  - Columns: id, workspace_id, name, description, status, created_at, published_at
  - ~40 lines

- [x] **Task 1.7:** Create `phases` and `steps` tables migration ✅
  - phases: id, workflow_id, name, order_index
  - steps: id, phase_id, name, order_index, sop_video_url, sop_video_type
  - ~60 lines

- [x] **Task 1.8:** Create `people`, `roles`, `software` tables migration ✅
  - people: id, workspace_id, name, email, role_id, reports_to, title
  - roles: id, workspace_id, name, description
  - software: id, workspace_id, name, url
  - ~70 lines

- [x] **Task 1.9:** Create junction tables migration ✅
  - sub_function_activities, step_activities, activity_roles, activity_people, activity_software
  - ~80 lines

---

## Supabase Client

- [x] **Task 2.1:** Create `src/lib/supabase/client.ts` ✅
  - Initialize Supabase browser client
  - Export typed client with database types
  - ~30 lines

- [x] **Task 2.2:** Generate TypeScript types from Supabase schema ✅
  - Run `supabase gen types typescript` 
  - Save to `src/types/database.ts`
  - 442 lines generated (17 tables + helper types)

---

## Sync Layer

- [x] **Task 3.1:** Create `src/lib/supabase/sync.ts` - workspace sync ✅
  - fetchWorkspaces(userId): get all workspaces for user
  - createWorkspace(workspace): insert new workspace
  - updateWorkspace(id, updates): update workspace
  - deleteWorkspace(id): delete workspace
  - ~80 lines

- [x] **Task 3.2:** Create sync functions for functions/sub-functions ✅
  - CRUD operations for functions table
  - CRUD operations for sub_functions table
  - Handle order_index updates
  - ~100 lines

- [x] **Task 3.3:** Create sync functions for activities/checklists ✅
  - CRUD for core_activities
  - CRUD for checklist_items
  - ~100 lines

- [x] **Task 3.4:** Create sync functions for workflows/phases/steps ✅
  - CRUD for all three tables
  - Handle nested ordering
  - ~120 lines

- [x] **Task 3.5:** Create sync functions for people/roles/software ✅
  - CRUD for all three tables
  - ~80 lines

---

## Store Integration

- [x] **Task 4.1:** Add sync flag to store ✅
  - Add `syncEnabled: boolean` and `syncStatus: 'idle' | 'syncing' | 'error'`
  - Add `lastSyncedAt: Date | null`
  - Added `syncError: string | null` for error messages
  - Actions: `setSyncEnabled`, `setSyncStatus`, `markSynced`
  - ~25 lines

- [x] **Task 4.2:** Create store middleware for Supabase sync ✅
  - Wrap actions to sync changes to Supabase
  - Keep localStorage as offline fallback
  - Created `src/store/syncMiddleware.ts` (~160 lines)
  - Added `useSyncActions` helper hook to store

- [x] **Task 4.3:** Add initial load from Supabase ✅
  - On app load, fetch from Supabase if authenticated
  - Merge with localStorage if needed
  - ~80 lines

---

## UI Updates

- [x] **Task 5.1:** Add sync status indicator to header ✅
  - Show sync icon with status (synced/syncing/error)
  - Tooltip with last synced time
  - Created `src/components/SyncStatusIndicator.tsx` (~80 lines)
  - Added to Sidebar footer next to UserButton

- [x] **Task 5.2:** Add offline mode banner ✅
  - Detect when offline
  - Show "Changes will sync when online" banner
  - Created `src/components/OfflineBanner.tsx` (~40 lines)
  - Added to AppShell layout

---

## Testing

- [x] **Task 6.1:** Add tests for sync functions ✅
  - Mock Supabase client
  - Test CRUD operations
  - Created `src/lib/supabase/__tests__/sync.test.ts` (~150 lines, 15 tests)

- [x] **Task 6.2:** Add integration test for store + sync ✅
  - Test that store changes trigger sync
  - Test offline fallback
  - Created `src/store/__tests__/syncIntegration.test.ts` (~185 lines, 11 tests)

---

## Summary

| Category | Tasks | Est. Lines |
|----------|-------|------------|
| Database Schema | 9 | ~465 |
| Supabase Client | 2 | ~130 |
| Sync Layer | 5 | ~480 |
| Store Integration | 3 | ~260 |
| UI Updates | 2 | ~110 |
| Testing | 2 | ~180 |
| **Total** | **23** | **~1,625** |

---

## Definition of Done

- [x] All tables created with proper RLS ✅
- [x] Store syncs to Supabase on every change ✅
- [x] localStorage fallback works offline ✅
- [x] Sync status visible in UI ✅
- [x] All tests passing ✅ (36 tests)
- [x] No TypeScript errors ✅

**🎉 Phase 6 Complete! Backend persistence with Supabase is fully implemented.**
