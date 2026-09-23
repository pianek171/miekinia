# Manage Report Templates Implementation Plan

## Overview

Introduce the first persisted reporting configuration: a signed-in administrator can maintain the fixed ZUK and burmistrz destination emails and message templates. This unblocks the resident-report slice without exposing template configuration to anonymous visitors.

## Current State Analysis

The repository has an Astro SSR application with Supabase cookie sessions and a protected `/dashboard`, but no application migrations or reporting-domain tables. The dashboard is a placeholder and existing middleware protects only its path.

## Desired End State

At `/dashboard`, the manually provisioned administrator can independently update complete ZUK and burmistrz templates. Each template persists safely, has a documented resident-report token contract, and cannot be read or changed by anonymous requests.

### Key Discoveries

- `src/middleware.ts` already authenticates `/dashboard`; API routes require their own authorization check.
- `src/lib/supabase.ts` provides the request-cookie Supabase SSR client for server rendering and mutations.
- `supabase/` has configuration only; `CLAUDE.md` requires timestamped migrations with RLS for all application tables.
- CI already starts local Supabase and runs the production preview smoke script.

## What We're NOT Doing

- Adding, deleting, or renaming recipients; the only keys are `zuk` and `burmistrz`.
- Publishing recipient/template data to anonymous visitors, rendering placeholders, delivering email, or building the resident report form.
- Adding roles, ownership, or multi-admin administration.
- Treating seeded `.invalid` addresses as official configuration.

## Implementation Approach

Use a two-row `report_templates` table keyed by a constrained recipient slug. Seed safe draft values, allow authenticated reads and updates under RLS, server-render the current records into a React editor island in `/dashboard`, and save each card through a session-checked JSON endpoint. Test the deployed runtime boundary with the existing local-Supabase smoke setup.

## Phase 1: Persisted Template Contract

### Overview

Create the constrained data model, safe initial content, RLS boundary, and shared TypeScript contract.

### Changes Required

#### 1. Database migration

**File**: `supabase/migrations/<timestamp>_create_report_templates.sql`

**Intent**: Persist the two fixed recipient templates and make their access boundary explicit before UI work begins.

**Contract**: Create `public.report_templates` with `recipient` as the primary key constrained to `zuk` or `burmistrz`, non-null `email`, `subject`, `body`, and `updated_at timestamptz not null default now()`. Enable RLS. Grant `SELECT` and `UPDATE` only to the `authenticated` role; do not grant anonymous access, insert, or delete. Seed exactly two rows:

- `zuk`, `uzupelnij-zuk@example.invalid`, subject `Zgłoszenie uciążliwego zapachu`
- `burmistrz`, `uzupelnij-burmistrz@example.invalid`, subject `Zgłoszenie uciążliwego zapachu`

Both bodies must label the text as a draft and include `{{full_name}}`, `{{address}}`, `{{odor_level}}`, and `{{odor_pattern}}`.

#### 2. Shared report-template contract

**Files**: `src/types.ts`, `src/lib/report-templates.ts`

**Intent**: Make the two allowed recipient identifiers and their persisted shape reusable by the page and API route.

**Contract**: Export `RecipientKey = "zuk" | "burmistrz"`, `REPORT_RECIPIENTS` in that display order, `ReportTemplate`, and a server helper that loads exactly both records through the request-scoped Supabase client. Treat a missing configuration/client or either missing row as unavailable rather than silently substituting data.

### Success Criteria

#### Automated Verification

- `npx supabase db reset` applies the migration and creates only the two seeded report-template records.
- `npm run lint` passes after the shared contract is added.
- `npx astro check` passes after the shared contract is added.

#### Manual Verification

- Inspect the local Supabase table: the two recipient keys, draft addresses, and all four documented tokens are present; anonymous table reads are denied.

**Implementation Note**: Pause for human confirmation after automated verification before proceeding.

---

## Phase 2: Authenticated Dashboard Editor

### Overview

Replace the placeholder dashboard with a mobile-friendly editor and a per-recipient, session-authorized save API.

### Changes Required

#### 1. Save endpoint and validation

**Files**: `package.json`, `package-lock.json`, `src/pages/api/admin/report-templates/[recipient].ts`

**Intent**: Provide the only mutation path for the editor while enforcing the fixed-recipient and complete-template constraints at the server boundary.

**Contract**: Add `zod`. Export `const prerender = false` and `PUT` from the dynamic route. Accept JSON `{ email, subject, body }`; trim inputs and require a valid email, subject length 1–200, and body length 1–10,000. Check `supabase.auth.getUser()` before access, allow only `zuk` and `burmistrz`, update one row plus `updated_at`, and return the saved `ReportTemplate` as JSON. Return JSON `400` for malformed/invalid payloads, `401` for missing session, `404` for an invalid or absent recipient, and `503` when Supabase is unavailable.

#### 2. Interactive editor

**Files**: `src/components/report-templates/TemplateEditor.tsx`, `src/pages/dashboard.astro`

**Intent**: Give the administrator two independently saveable template cards in the already protected dashboard.

**Contract**: The Astro page loads both records server-side using the shared helper and passes them to a `client:load` React island. Render ZUK then Burmistrz cards, each with email input, subject input, body textarea, visible token reference, its own Save button, inline validation, pending state, and success/error status. Use `PUT /api/admin/report-templates/<recipient>` and update only the saved card with the returned record. Show a clear unavailable state if configuration cannot be loaded. Preserve sign-out access.

#### 3. Administrator navigation

**File**: `src/pages/api/auth/signin.ts`

**Intent**: Send a successful administrator sign-in directly to the new management surface.

**Contract**: Keep all existing error behavior; change only the successful redirect from `/` to `/dashboard`.

### Success Criteria

#### Automated Verification

- `npm run lint` passes.
- `npx astro check` passes.
- `npm run build` passes.

#### Manual Verification

- A signed-in administrator can update ZUK without changing Burmistrz, then update Burmistrz independently; each saved value remains after reload.
- Empty fields and an invalid email show field-level errors; anonymous navigation redirects to sign-in and anonymous API mutation returns `401`.
- The editor remains usable at a narrow mobile viewport and makes the four tokens visible to the administrator.

**Implementation Note**: Pause for human confirmation after automated verification before proceeding.

---

## Phase 3: Runtime Smoke Coverage

### Overview

Exercise the migrated database, authentication, authorization, validation, and persistence path in the existing CI runtime setup.

### Changes Required

#### 1. Smoke scenario

**File**: `scripts/smoke.mjs`

**Intent**: Extend the dependency-free HTTP smoke test without adding an application signup route or weakening production’s manually provisioned-admin model.

**Contract**: Read `SUPABASE_URL` and `SUPABASE_KEY` only when running the local test. Create the disposable smoke user through local Supabase Auth directly, then use the existing cookie jar to sign in through the application. Assert anonymous `PUT` rejection; authenticated dashboard access; invalid template rejection; a successful ZUK update; and persisted updated content after reload. Keep all existing auth assertions that remain valid.

#### 2. CI environment handoff

**File**: `.github/workflows/ci.yml`

**Intent**: Provide the local-only Supabase endpoint and anon key to the smoke command without committing or logging credentials.

**Contract**: Source the existing generated `supabase.env` only in the smoke step and pass its URL/key as process environment to `npm run smoke`; do not alter production build secrets or add tracked secret files.

### Success Criteria

#### Automated Verification

- `npm run lint` passes.
- `npx astro check` passes.
- `npm run build` passes.
- The local-Supabase production-preview smoke scenario passes, including template authorization, validation, update, and reload assertions.

#### Manual Verification

- Review the CI workflow and smoke output to confirm no secret value is printed and the smoke account is disposable/local-only.

**Implementation Note**: Pause for human confirmation after automated verification before commit and closeout.

## Testing Strategy

- Rely on the existing real-runtime smoke path rather than introduce a new test framework.
- Cover database seed availability, API authorization, input validation, independent recipient update, and persisted reload.
- Run lint, Astro type checking, and a production build for each applicable phase.

## Performance Considerations

The dashboard reads exactly two small rows and updates one row at a time. The 10,000-character body limit prevents accidental oversized configuration while remaining ample for the MVP.

## Migration Notes

Apply the migration before deploying the editor. The seeded `.invalid` addresses and draft copy must be replaced with approved institutional data before S-02 offers resident reporting. S-02 must explicitly introduce its own minimal public read contract; this change must not relax RLS preemptively.

## References

- `context/foundation/roadmap.md`
- `context/foundation/prd.md`
- `src/middleware.ts`
- `src/lib/supabase.ts`
- `src/pages/dashboard.astro`
- `scripts/smoke.mjs`

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Persisted Template Contract

#### Automated

- [x] 1.1 Migration reset succeeds with two seeded templates
- [x] 1.2 Lint passes for shared template contract
- [x] 1.3 Astro type check passes for shared template contract

#### Manual

- [x] 1.4 Verify seeded records, tokens, and anonymous RLS denial

### Phase 2: Authenticated Dashboard Editor

#### Automated

- [ ] 2.1 Lint passes for editor and save API
- [ ] 2.2 Astro type check passes for editor and save API
- [ ] 2.3 Production build passes for editor and save API

#### Manual

- [ ] 2.4 Verify independent persisted edits and access boundaries
- [ ] 2.5 Verify validation, mobile usability, and token guidance

### Phase 3: Runtime Smoke Coverage

#### Automated

- [ ] 3.1 Lint passes for smoke coverage
- [ ] 3.2 Astro type check passes for smoke coverage
- [ ] 3.3 Production build passes for smoke coverage
- [ ] 3.4 Local-Supabase production-preview smoke scenario passes

#### Manual

- [ ] 3.5 Verify local-only smoke credentials are not printed
