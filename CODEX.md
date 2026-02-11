# CODEX.md - Ops Map

**Purpose:** This file provides Codex (and any AI coding agent) with the context needed to work on this project effectively.

---

## Project Overview

Ops Map is an operations management tool that helps businesses:
- Map their organizational structure (Functions → Sub-Functions → Activities)
- Document workflows (Workflows → Phases → Steps → Activities)
- Track people, roles, and software across operations
- Identify gaps in coverage (unassigned activities, missing roles)
- Create checklists for activities with markdown support

**Target users:** Small-to-medium construction/remodeling companies looking to systematize their operations.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 (App Router) |
| React | 19.2.3 |
| State | Zustand 5 with `persist` middleware (localStorage) |
| Styling | Tailwind CSS 4 |
| Auth | Clerk |
| Drag & Drop | @dnd-kit |
| Flow Charts | @xyflow/react |
| UI Components | Radix UI primitives |
| PDF Export | jspdf + html2canvas |
| Markdown | react-markdown + remark-gfm |
| AI (planned) | Gemini via @google/generative-ai |

---

## File Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── activities/         # Core activities management
│   ├── function-chart/     # Org structure visualization
│   ├── workflows/          # Workflow management
│   │   └── [id]/           # Individual workflow detail
│   ├── people/             # People & roles
│   ├── roles/              # Role definitions
│   ├── software/           # Software tracking
│   ├── gaps/               # Gap analysis view
│   ├── ops-health/         # Operations health dashboard
│   ├── settings/           # App settings
│   ├── tools/              # Utility tools (org chart, job desc, etc.)
│   ├── ai-assistant/       # AI features (planned)
│   └── api/ai/             # AI API routes
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── ChecklistItemRow.tsx
│   │   ├── ChecklistPasteInput.tsx
│   │   ├── Modal.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── StatusDropdown.tsx
│   │   ├── VideoEmbed.tsx
│   │   └── VideoUrlInput.tsx
│   ├── layout/             # Header, Sidebar
│   ├── modals/             # Modal dialogs
│   ├── dnd/                # Drag-and-drop utilities
│   └── AppShell.tsx        # Main layout wrapper
├── lib/
│   ├── utils.ts            # General utilities (cn for classnames)
│   ├── checklist.ts        # Checklist text parsing
│   ├── video.ts            # Video URL utilities
│   ├── demo-data.ts        # Demo workspace data
│   ├── ai/                 # AI integration utilities
│   └── templates/          # Template definitions
├── store/
│   └── index.ts            # Zustand store (⚠️ 1,500 lines - needs refactoring)
└── types/
    └── index.ts            # TypeScript type definitions
```

---

## Key Patterns

### State Management
- **Single Zustand store** at `src/store/index.ts` manages ALL state
- Uses `persist` middleware for localStorage
- Workspace-based data isolation (multi-tenant ready)
- Entity pattern: Functions, SubFunctions, CoreActivities, Workflows, Phases, Steps, etc.

### Status Flow
All major entities use a consistent status enum:
```typescript
type Status = 'gap' | 'draft' | 'active' | 'archived'
```

### Component Patterns
- Pages are in `src/app/*/page.tsx` with `'use client'` directive
- Shared UI components in `src/components/ui/`
- Modal pattern: `showModal` state + `<Modal>` component

### Data Relationships
```
Function (1) → (N) SubFunction
SubFunction (M) ↔ (N) CoreActivity (via SubFunctionActivity join)

Workflow (1) → (N) Phase
Phase (1) → (N) Step
Step (M) ↔ (N) CoreActivity (via StepActivity join)

CoreActivity (1) → (N) ChecklistItem
CoreActivity (N) ↔ (M) Person (via ownerIds)
CoreActivity (N) ↔ (M) Role (via roleIds)
CoreActivity (N) ↔ (M) Software (via softwareIds)
```

---

## Current State

### ✅ Completed (Phase 5)
- Full CRUD for all entities
- Function Chart with drag-and-drop
- Workflow builder with phases/steps
- Activities with video embeds (Loom, Google Drive)
- Checklists with paste support and markdown rendering
- Status workflow (gap → draft → active → archived)
- Multi-workspace support
- Clerk authentication integration
- Global search (⌘K)
- PDF export for function chart

### 🚧 In Progress
- None (between phases)

### 📋 Coming Next
- Backend persistence (Supabase - currently all localStorage)
- AI-powered gap analysis
- Template library

---

## Things to Avoid

1. **Don't add state outside the store** - Keep all state in Zustand
2. **Don't use `useState` for persistent data** - Only for UI state
3. **Don't break the workspace isolation** - Each workspace is self-contained
4. **Don't add dependencies without need** - Bundle is already large
5. **Don't use server components for interactive pages** - Use `'use client'`
6. **Don't modify demo-data.ts** unless adding new entity types

---

## Running Locally

```bash
pnpm install
pnpm dev          # Development server at localhost:3000
pnpm build        # Production build
pnpm test         # Run tests
pnpm lint         # ESLint
```

---

## Testing

Tests use Vitest + React Testing Library:
- Run: `pnpm test`
- Watch: `pnpm test:watch`
- Tests live in `__tests__/` directories adjacent to source

---

## Pre-Commit Checklist

Before any PR:
1. `pnpm build` succeeds (required)
2. `pnpm test` passes (required)
3. `pnpm lint` - has pre-existing warnings/errors (not blocking)
4. No new TypeScript errors

**Note:** The codebase has ~26 pre-existing lint errors (mostly `no-explicit-any` and React hooks warnings). These should be cleaned up in a dedicated lint-fix PR but don't block development.
