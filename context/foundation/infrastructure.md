---
project: Smród Miękinia
researched_at: 2026-09-21
recommended_platform: Cloudflare Workers
runner_up: Vercel
context_type: mvp
tech_stack:
  language: JavaScript / TypeScript
  framework: Astro 7.3.2 with React 19.2.6
  runtime: Cloudflare Workers via @astrojs/cloudflare 14.3.1 and Wrangler 4.131.1
---

## Recommendation

**Deploy on Cloudflare Workers.**

The current project is already an Astro SSR application configured for `@astrojs/cloudflare`, with a Workers entry point and Wrangler configuration; it can deploy without changing adapter, runtime, or delivery model. This best satisfies the cost-first, stateless-MVP constraints and the scaffold's existing Cloudflare target. The Free plan covers limited Workers usage and includes Workers Logs, making it appropriate for the expected small initial traffic volume; configure an alert and revisit before limits become a reliability issue. [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## Platform Comparison

| Platform | CLI-first | Managed / serverless | Agent-readable docs | Stable deploy API | MCP / integration | Total |
|---|---|---|---|---|---|---|
| Cloudflare Workers | Pass | Pass | Pass | Pass | Pass | 5 / 5 |
| Vercel | Pass | Pass | Pass | Pass | Partial | 4.5 / 5 |
| Netlify | Pass | Pass | Pass | Pass | Pass | 5 / 5* |
| Fly.io | Pass | Partial | Pass | Pass | Partial | 3.5 / 5 |
| Railway | Pass | Pass | Pass | Pass | Pass | 5 / 5* |
| Render | Pass | Pass | Pass | Pass | Pass | 5 / 5* |

\*Technically capable, but the existing Cloudflare adapter/runtime would have to be replaced or the app containerized, which is a material penalty for this one-week MVP.

- **Cloudflare Workers:** Wrangler provides deterministic deploy, log tailing, and rollback operations; official docs are Markdown-readable and Cloudflare has Workers/Build integrations for agent workflows. It is the direct runtime match for this repository. The Free plan is viable at 10k–100k monthly requests if requests are simple and data-service limits are monitored. [Wrangler commands](https://developers.cloudflare.com/workers/wrangler/commands/workers/) · [Astro deployment guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- **Vercel:** Strong CLI/API, previews, logs, rollback, and a current MCP-related CLI capability. It supports Astro, but would require changing the adapter and configuration, while its usage billing adds less predictability for the cost-first requirement. [Vercel CLI](https://vercel.com/docs/cli) · [Vercel pricing](https://vercel.com/docs/pricing)
- **Netlify:** A mature CLI supports preview deploys and deterministic manual deployment; functions and managed data primitives are available. The present Cloudflare SSR configuration cannot be deployed unchanged, so it is not a time-efficient MVP choice. [Netlify CLI](https://docs.netlify.com/api-and-cli-guides/cli-guides/get-started-with-cli/) · [Netlify Functions](https://docs.netlify.com/build/functions/overview/)
- **Fly.io:** `flyctl`, logs, rollbacks, containers, long-lived processes, and managed Postgres make it capable, but it adds Docker/VM operational surface. It also requires a card on file and paid compute; the smallest running machine is roughly $2/month before data services. [Fly pricing](https://fly.io/docs/about/pricing/)
- **Railway:** Its CLI supports deploy, logs, variables, database services, and MCP setup; official docs explicitly list Astro. It is an excellent full-stack PaaS fallback, but its free plan includes only $1 monthly credit and it requires adapting the Cloudflare-based app to a Node/container service. [Railway CLI](https://docs.railway.com/cli) · [Railway plans](https://docs.railway.com/pricing/plans)
- **Render:** The current CLI supports non-interactive deploys, live logs, and an official MCP server. Static sites are free, but SSR Astro would need a Node/container deployment, and free web services spin down after 15 idle minutes. [Render CLI](https://render.com/docs/cli) · [Render free instances](https://render.com/docs/free)

### Shortlisted Platforms

#### 1. Cloudflare Workers (Recommended)

Cloudflare wins because it preserves the scaffolded Astro 7.3.2 + `@astrojs/cloudflare` 14.3.1 runtime and needs no Dockerfile or platform-specific rewrite. It has a low-cost/free MVP path, a full Wrangler operational loop, and the project already has `wrangler.jsonc` with `nodejs_compat`, asset binding, and observability enabled.

#### 2. Vercel

Vercel has a strong developer experience, preview workflow, logs, CLI, and scriptable deployment operations. It loses to Cloudflare because it would replace the current adapter/runtime and is a weaker cost fit for a small civic MVP whose starter was intentionally scaffolded for Workers.

#### 3. Railway

Railway is the fallback if later requirements need a conventional persistent Node process or co-located database. Its agent-facing CLI/MCP and service primitives are excellent, but it introduces monthly minimums after $1 credit and unnecessary runtime migration for today's stateless product.

## Anti-Bias Cross-Check: Cloudflare Workers

### Devil's Advocate — Weaknesses

1. The server executes in the Workers runtime rather than a full Node.js process; a future dependency that relies on unsupported Node internals can fail to build or run.
2. An unauthenticated statistics endpoint can be automated or spammed unless it receives strict input validation and rate limiting.
3. A code rollback does not roll back D1, KV, R2, or other bound-resource changes; incompatible binding or schema changes can prevent a clean rollback. [Cloudflare rollback limits](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
4. Free-plan limits are hard limits. A spike can make requests or storage operations fail, rather than merely adding a charge.
5. A broad Cloudflare API token gives a CI job or agent more authority than it needs to deploy this one Worker.

### Pre-Mortem — How This Could Fail

Six months after launch, the decision looks disastrous because the team treated Cloudflare compatibility as if it were full Node compatibility. A new server dependency relies on an unavailable runtime API, passes browser-oriented local checks, and fails in production. At the same time, the anonymous stats endpoint has no rate limiting, so automated traffic consumes a free-tier daily allowance and legitimate reports stop being recorded. An emergency rollback does not restore a changed data binding, delaying recovery while the team discovers that code history and data history are separate concerns. Finally, the deploy workflow uses an account-wide token, so a routine automation mistake makes an unnecessary production change. The platform was suitable; the failure came from skipping runtime-fidelity checks, rate limits, reversible migrations, and least-privilege credentials.

### Unknown Unknowns

- Astro 6+ chooses the Cloudflare environment at build time. Build separately for each target environment; `wrangler deploy --env ...` alone no longer selects it. [Astro migration note](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)
- For this exact adapter workflow, use `npx astro build && npx wrangler dev` to test the Worker bundle locally. `astro dev` remains useful for UI development but is not the final runtime-fidelity check. [Astro Cloudflare deploy guide](https://docs.astro.build/en/guides/deploy/cloudflare/)
- Cloudflare Secrets Store is **beta** as checked 2026-09-21. Use ordinary Worker secrets for this MVP instead of making a beta service part of the release path. [Cloudflare bindings](https://developers.cloudflare.com/workers/static-assets/binding/)
- A Worker rollback leaves attached platform resources untouched; deploy backward-compatible schema or binding changes first, and delay destructive changes until the code deployment is stable.
- The Workers Free plan currently retains logs for three days. Export important incident context quickly or move to a paid/log-export path if operational needs grow. [Cloudflare pricing](https://developers.cloudflare.com/workers/platform/pricing/)

## Operational Story

- **Preview deploys**: Git-connected Workers Builds can build pull requests and publish preview URLs; protect any administrator-capable preview with Cloudflare Access or a non-production auth configuration. A direct `npx wrangler deploy` returns a `workers.dev` URL for inspection. [Astro CI/CD deployment](https://docs.astro.build/en/guides/deploy/cloudflare/)
- **Secrets**: Store `SUPABASE_URL` and `SUPABASE_KEY` with `npx wrangler secret put <NAME>` or in the Workers dashboard. Only maintainers with Workers secret-management permission may set or rotate them; rotate by replacing the secret, then deploy/verify.
- **Rollback**: First inspect versions, then run `npx wrangler rollback <VERSION_ID> --message "rollback: <reason>"`. It creates an immediately active deployment, but never rewinds databases, bindings, or migrations. [Cloudflare rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
- **Approval**: An agent may run read-only build, lint, smoke, deployment-listing, and log-tail commands. A human must approve a production deploy, rollback, primary-secret rotation, custom-domain change, data migration, or resource deletion.
- **Logs**: Use `npx wrangler tail` for read-only live Worker logs and GitHub Actions logs for build failures. Keep the token scoped to the single Worker/account permissions required for those operations.

## Risk Register

| Risk | Source | Likelihood | Impact | Mitigation |
|---|---|---:|---:|---|
| Incompatible Node-only dependency | Devil's advocate | M | H | Keep `nodejs_compat`; run `npm run build` and `npx wrangler dev` before every release; vet new server dependencies against the Workers runtime. |
| Statistics spam or quota exhaustion | Devil's advocate / Pre-mortem | M | M | Validate payloads, rate-limit the write route, and alert on request/data-operation volume. |
| Rollback cannot repair data/binding change | Devil's advocate / Unknown unknowns | M | H | Use backward-compatible, staged migrations; never combine destructive data changes with a code deploy. |
| Free-tier hard-limit outage | Research finding | L | M | Monitor Workers and data-service usage; set a budget/usage review threshold before public promotion. |
| Excessive deploy token permissions | Devil's advocate / Pre-mortem | M | H | Create a dedicated, least-privilege token limited to this Worker; keep production deploy as a human-approved action. |
| Wrong environment built for release | Unknown unknowns | M | M | Build each environment separately using `CLOUDFLARE_ENV=<env> npx astro build`, then run `npx wrangler deploy`. |
| Insufficient log history during incident | Unknown unknowns | M | L | Capture incident logs promptly; add Logpush or an external log store if three-day retention is insufficient. |

## Getting Started

1. Keep the existing exact deployment configuration: Astro 7.3.2, `@astrojs/cloudflare` 14.3.1, Wrangler 4.131.1, and `wrangler.jsonc`. Do not add a Pages adapter or Dockerfile.
2. Authenticate using the locally installed CLI: `npx wrangler login`. For CI later, use a dedicated least-privilege Cloudflare API token rather than a personal global key.
3. Set the two server secrets: `npx wrangler secret put SUPABASE_URL` and `npx wrangler secret put SUPABASE_KEY`. Do not commit `.dev.vars` or production credentials.
4. Validate the actual Workers bundle locally: `npm run build && npx wrangler dev`. This is the version-correct Astro/Cloudflare runtime check; `npm run preview` alone does not replace it.
5. After human approval, deploy with `npx astro build && npx wrangler deploy`; inspect the returned URL, then use `npx wrangler tail` for read-only runtime verification. For named environments, build first with `CLOUDFLARE_ENV=<environment> npx astro build` and then run `npx wrangler deploy`.

## Out of Scope

The following were not evaluated in this research:

- Docker image configuration
- CI/CD pipeline setup
- Production-scale architecture (multi-region, HA, DR)
