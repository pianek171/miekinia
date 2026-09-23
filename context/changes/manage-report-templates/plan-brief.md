# Manage Report Templates — Plan Brief

> Full plan: `context/changes/manage-report-templates/plan.md`

## What & Why

Administrators need to maintain the two message destinations and templates that the resident-report flow will later consume. This change creates that configuration without exposing it publicly or retaining resident personal data.

## Starting Point

The project has Supabase authentication and a protected placeholder dashboard, but no application tables, migrations, or reporting configuration. The existing CI already runs a production-preview smoke flow against local Supabase.

## Desired End State

A signed-in administrator sees fixed ZUK and Burmistrz template cards at `/dashboard`, can save each one independently, and receives clear validation feedback. The configuration is persisted under RLS and unavailable to anonymous users.

## Key Decisions Made

| Decision | Choice | Why |
| --- | --- | --- |
| Recipient scope | Fixed `zuk` and `burmistrz` | Matches the MVP non-goal and keeps stable future identifiers. |
| Initial content | Seeded `.invalid` draft values | Avoids inventing official institutional contact details. |
| Tokens | `{{full_name}}`, `{{address}}`, `{{odor_level}}`, `{{odor_pattern}}` | Mirrors the resident form contract while keeping authoring readable. |
| Token handling | Document but do not parse | S-02 owns rendering and validation behavior. |
| Access | Authenticated admin only | Avoids publishing unneeded configuration before a resident consumer exists. |
| Save behavior | One Save action per recipient | Isolates failures and accidental changes. |
| Completeness | Email, subject, and body required | Prevents unusable templates from reaching S-02. |
| Automated coverage | Existing CI smoke flow | Exercises the deployed Astro–Cloudflare–Supabase boundary. |

## Scope

**In scope:** constrained data migration, RLS, shared contract, dashboard editor, authenticated save endpoint, sign-in redirect, and smoke coverage.

**Out of scope:** recipient CRUD, public reads, email delivery, placeholder rendering, roles, resident form, and official final message copy.

## Architecture / Approach

`/dashboard` server-loads two RLS-protected rows and passes them to a React island. Each card sends a validated `PUT` to an authenticated API route; the route permits only the two fixed keys and returns the saved record.

## Phases at a Glance

| Phase | What it delivers | Key risk |
| --- | --- | --- |
| 1. Persisted template contract | Migration, seed, RLS, shared types | Correctly restricting anonymous access |
| 2. Authenticated dashboard editor | Independent save UI and API | Consistent client/server validation |
| 3. Runtime smoke coverage | CI proof of the real persistence path | Local-only test account and secrets |

**Prerequisites:** Local Supabase/Docker for database and smoke verification; approved official contact data before S-02.
**Estimated effort:** 2–3 focused sessions.

## Open Risks & Assumptions

- Seeded `.invalid` addresses are intentionally non-deliverable and must be replaced before public reporting launches.
- The current manually provisioned single-admin model remains sufficient.
- S-02 must add a narrowly scoped public template-read contract rather than reusing an unrestricted table policy.

## Success Criteria (Summary)

- Only a signed-in administrator can read and update the two templates.
- Each complete template survives reload and is independently editable.
- CI verifies authorization, validation, update, and persisted reload against local Supabase.
