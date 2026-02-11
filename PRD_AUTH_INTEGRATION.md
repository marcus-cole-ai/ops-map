# PRD: Clerk-Supabase Auth Integration

## Problem Statement

The ops-map app uses **Clerk for frontend authentication** but **Supabase RLS policies expect Supabase Auth**. Currently:

- `auth.uid()` returns `null` for Clerk users (no Supabase session exists)
- All RLS policies fail silently
- App falls back to localStorage-only mode
- No cloud sync for any user

## Solution: Supabase Third-Party Auth (New Method)

As of April 2025, Supabase supports **native third-party auth integration** with Clerk. This is the officially recommended approach (the old JWT template method is deprecated).

### How It Works

1. **Clerk adds `role: "authenticated"`** to session tokens when integration is enabled
2. **Supabase trusts Clerk's JWTs** when configured as third-party provider  
3. **`auth.jwt()->>'sub'`** returns the Clerk user ID in RLS policies
4. **Supabase client passes Clerk token** via `accessToken` callback

### Key Insight: `auth.uid()` vs `auth.jwt()->>'sub'`

- `auth.uid()` returns the Supabase user's UUID (null for Clerk users)
- `auth.jwt()->>'sub'` returns the JWT's `sub` claim = Clerk user ID (string)
- Clerk user IDs are strings like `user_2abc123...`, not UUIDs

---

## Implementation Tasks

### Task 1: Dashboard Configuration (Manual Steps)

**Clerk Dashboard:**
1. Go to https://dashboard.clerk.com/setup/supabase
2. Select your app
3. Click "Activate Supabase integration"
4. Copy the **Clerk domain** shown (e.g., `your-app.clerk.accounts.dev`)

**Supabase Dashboard:**
1. Go to Project → Authentication → Sign In / Up
2. Click "Add provider" → Select "Clerk"
3. Paste the Clerk domain from step above
4. Save

**Environment Variables:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
```

---

### Task 2: Database Migration - Fix user_id and RLS Policies

**File:** `supabase/migrations/20260211_clerk_auth_integration.sql`

Changes required:
1. Remove foreign key constraint on `workspaces.user_id` (Clerk users aren't in `auth.users`)
2. Change `user_id` column from `uuid` to `text` (Clerk IDs are strings)
3. Update ALL RLS policies to use `auth.jwt()->>'sub'` instead of `auth.uid()`

**Affected Tables:**
- `workspaces` (direct user_id column)
- `functions` (workspace ownership check)
- `sub_functions` (workspace ownership check)
- `core_activities` (workspace ownership check)
- `checklist_items` (activity ownership check)
- `workflows` (workspace ownership check)
- `phases` (workflow ownership check)
- `steps` (phase ownership check)
- `people` (workspace ownership check)
- `roles` (workspace ownership check)
- `software` (workspace ownership check)
- All junction tables

---

### Task 3: Update Supabase Client to Use Clerk Token

**File:** `src/lib/supabase/client.ts`

The new Supabase client API supports passing an `accessToken` function that returns the auth token dynamically.

```typescript
import { createClient } from '@supabase/supabase-js'

export function createClerkSupabaseClient(getToken: () => Promise<string | null>) {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      accessToken: async () => await getToken(),
    }
  )
}
```

---

### Task 4: Create useSupabaseClient Hook

**File:** `src/hooks/useSupabaseClient.ts`

React hook that creates a Supabase client with Clerk session token:

```typescript
'use client'
import { useSession } from '@clerk/nextjs'
import { useMemo } from 'react'
import { createClerkSupabaseClient } from '@/lib/supabase/client'

export function useSupabaseClient() {
  const { session } = useSession()
  
  return useMemo(() => {
    return createClerkSupabaseClient(async () => {
      return session?.getToken() ?? null
    })
  }, [session])
}
```

---

### Task 5: Update useInitialDataLoad Hook

**File:** `src/hooks/useInitialDataLoad.ts`

- Remove `supabase.auth.getSession()` check (no longer needed)
- Use the new `useSupabaseClient` hook
- Pass the authenticated client to sync functions

---

### Task 6: Update Sync Functions

**File:** `src/lib/supabase/sync.ts`

- Change from static client import to receiving client as parameter
- All CRUD functions should accept a Supabase client instance

---

### Task 7: Update syncMiddleware

**File:** `src/store/syncMiddleware.ts`

- Pass the authenticated Supabase client to sync operations
- Consider using a context or singleton pattern for the client

---

## Migration SQL (Full)

```sql
-- Migration: Clerk Third-Party Auth Integration
-- This migration updates the database to work with Clerk auth instead of Supabase Auth

-- Step 1: Drop foreign key constraint on workspaces.user_id
ALTER TABLE public.workspaces 
DROP CONSTRAINT IF EXISTS workspaces_user_id_fkey;

-- Step 2: Change user_id from uuid to text (Clerk uses string IDs)
ALTER TABLE public.workspaces 
ALTER COLUMN user_id TYPE text;

-- Step 3: Update RLS policies on workspaces
DROP POLICY IF EXISTS "Users can view their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can insert their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can update their own workspaces" ON public.workspaces;
DROP POLICY IF EXISTS "Users can delete their own workspaces" ON public.workspaces;

CREATE POLICY "Users can view their own workspaces"
  ON public.workspaces FOR SELECT
  USING ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can insert their own workspaces"
  ON public.workspaces FOR INSERT
  WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can update their own workspaces"
  ON public.workspaces FOR UPDATE
  USING ((SELECT auth.jwt()->>'sub') = user_id)
  WITH CHECK ((SELECT auth.jwt()->>'sub') = user_id);

CREATE POLICY "Users can delete their own workspaces"
  ON public.workspaces FOR DELETE
  USING ((SELECT auth.jwt()->>'sub') = user_id);

-- Step 4: Update RLS policies on all other tables
-- (They check workspace ownership, so we update the subquery)

-- Functions
DROP POLICY IF EXISTS "Users can view functions in their workspaces" ON public.functions;
DROP POLICY IF EXISTS "Users can insert functions in their workspaces" ON public.functions;
DROP POLICY IF EXISTS "Users can update functions in their workspaces" ON public.functions;
DROP POLICY IF EXISTS "Users can delete functions in their workspaces" ON public.functions;

CREATE POLICY "Users can view functions in their workspaces"
  ON public.functions FOR SELECT
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = (SELECT auth.jwt()->>'sub')));

CREATE POLICY "Users can insert functions in their workspaces"
  ON public.functions FOR INSERT
  WITH CHECK (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = (SELECT auth.jwt()->>'sub')));

CREATE POLICY "Users can update functions in their workspaces"
  ON public.functions FOR UPDATE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = (SELECT auth.jwt()->>'sub')));

CREATE POLICY "Users can delete functions in their workspaces"
  ON public.functions FOR DELETE
  USING (workspace_id IN (SELECT id FROM public.workspaces WHERE user_id = (SELECT auth.jwt()->>'sub')));

-- (Similar updates for: sub_functions, core_activities, checklist_items, 
--  workflows, phases, steps, people, roles, software, and all junction tables)
```

---

## Testing Checklist

- [ ] Dashboard configs completed (Clerk + Supabase)
- [ ] Migration applied successfully
- [ ] Sign in with Clerk
- [ ] Create a workspace → verify it appears in Supabase
- [ ] Refresh page → data loads from Supabase
- [ ] Sign out and in as different user → only see own data
- [ ] Verify RLS: try to access other user's workspace ID directly

---

## Rollback Plan

If issues arise:
1. Disable Clerk provider in Supabase dashboard
2. Revert migration with inverse SQL
3. Return to localStorage-only mode

---

## Timeline Estimate

| Task | Estimate |
|------|----------|
| Dashboard config | 10 min |
| Database migration | 30 min |
| Client updates | 45 min |
| Testing | 30 min |
| **Total** | ~2 hours |

---

## Implementation Status (2026-02-11)

### ✅ Completed

1. **Database Migration** (`supabase/migrations/20260211062200_clerk_auth_integration.sql`)
   - Drops foreign key constraint on `workspaces.user_id`
   - Changes `user_id` from `uuid` to `text` (Clerk uses string IDs)
   - Updates ALL RLS policies to use `auth.jwt()->>'sub'` instead of `auth.uid()`
   - Covers all 15+ tables including junction tables

2. **Supabase Client** (`src/lib/supabase/client.ts`)
   - Added `createClerkSupabaseClient()` function that accepts a token getter
   - Added `isSupabaseConfigured()` helper
   - Made static client nullable (graceful degradation)

3. **Supabase Context** (`src/contexts/SupabaseContext.tsx`)
   - New context provider that creates authenticated client with Clerk session
   - `useSupabase()` hook for components
   - `getSupabaseClient()` for sync operations outside React

4. **useSupabaseClient Hook** (`src/hooks/useSupabaseClient.ts`)
   - Creates authenticated Supabase client using Clerk session token
   - Returns `{ client, isReady, error }` for proper loading states

5. **useInitialDataLoad Hook** (`src/hooks/useInitialDataLoad.ts`)
   - Updated to use the new client-based approach
   - No longer checks `supabase.auth.getSession()` (not needed with Clerk)

6. **Sync Functions** (`src/lib/supabase/sync.ts`)
   - All CRUD functions now accept `client` as first parameter
   - Enables proper RLS enforcement with Clerk authentication

7. **Sync Middleware** (`src/store/syncMiddleware.ts`)
   - Updated to use `getSupabaseClient()` from context
   - Gracefully handles missing client (localStorage fallback)

8. **App Layout** (`src/app/layout.tsx`)
   - Added `<SupabaseProvider>` wrapper inside `<ClerkProvider>`

9. **Environment Variables** (`.env.example`)
   - Added Supabase variables with setup instructions

### ⏳ Remaining Manual Steps

1. **Clerk Dashboard:**
   - Go to https://dashboard.clerk.com/setup/supabase
   - Activate the Supabase integration
   - Copy the Clerk domain

2. **Supabase Dashboard:**
   - Go to Authentication → Sign In / Up → Add provider → Clerk
   - Paste the Clerk domain

3. **Run Migration:**
   ```bash
   cd supabase
   supabase db push
   ```

4. **Add Environment Variables:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   ```

---

## References

- [Supabase + Clerk Third-Party Auth](https://supabase.com/docs/guides/auth/third-party/clerk)
- [Clerk Supabase Integration](https://clerk.com/docs/guides/development/integrations/databases/supabase)
- [Clerk Session Tokens](https://clerk.com/docs/backend-requests/resources/session-tokens)
