---
applyTo: "src/**"
---

# Feature Planning & Development Guide

Read and follow this file whenever a new feature is being planned or an existing feature is being modified. Work through each applicable section before writing any implementation code. Not every section applies to every feature — skip sections that are genuinely irrelevant, but err on the side of considering them.

---

## Feature Clarity

Before anything else, establish:

- What problem does this solve for the user?
- What does success look like — what can the user do after this ships that they couldn't before?
- What is explicitly out of scope for this change?
- Are there any dependencies on other features or external systems that must exist first?
- What assumptions are being made about user behavior, data, or technology that have not been verified? List them explicitly.

---

## Success Metrics

How will we know the feature is working as intended — not just technically, but for the user?

- What observable outcome tells us this feature is succeeding?
- What would be a sign that something is wrong in production, even if no error is thrown?
- Is there any measurable behavior to track (e.g. usage, error rate, latency)?

---

## External APIs & Third-party Services

*If the feature integrates with any API or external service:*

- Fetch and read the relevant documentation before writing any code
- Identify: required vs optional parameters, authentication method, rate limits, quotas
- Identify: response shape, all error codes and their meaning, retry behavior
- Does a client or helper for this service already exist in the codebase? Reuse it — don't create a second integration

---

## Data & Database

*If the feature reads from or writes to any data store:*

- What is the exact schema — collections, fields, types?
- Are any existing schemas being changed? What is the backwards-compatibility strategy?
- Are any Firestore security rules affected? If yes, plan to update **and deploy** them as part of this feature — never defer. Run `firebase deploy --only firestore:rules` immediately after changes.
- Define TypeScript types in `src/types/index.ts` before implementing
- How are errors handled? (network failure, not found, permission denied)
- Are there ordering, indexing, or query performance concerns at scale?
- What ensures data is not left in a partially written state? (transactions, atomic writes)

---

## Security

Regardless of feature size, consider:

- Does this feature expose any data beyond what the authenticated user is entitled to see?
- Is authentication checked at every entry point (route, API handler, server action)?
- Is all user-supplied input validated and sanitised before use?
- Is anything from user input rendered to the DOM? (XSS risk)
- Are any secrets, tokens, or credentials involved? Confirm they are not exposed to the client
- Are any new environment variables introduced? Confirm they are appropriately scoped (server-only vs client-safe `NEXT_PUBLIC_*`)

---

## Frontend & UI

*If the feature has any user interface:*

- What is the viewport target? Start mobile-first (375px) and verify at the narrowest supported width
- Define all required states before building: loading, empty, error, and the happy path
- Are there any accessibility concerns? (keyboard navigation, screen reader labels, focus management, color contrast)
- Does this introduce any new navigation entry points? Where does the user come from and go to?
- Does any part of this depend on browser-only APIs? Ensure it is properly guarded from server rendering
- Does any UI use Shadcn components? Add them via the Shadcn CLI (`npx shadcn@latest add <component>`) — never hand-write files in `src/components/ui/`

---

## Backend & Server-side

*If the feature includes any server-side logic:*

- Where does the logic live — server component, API route, background job, edge function?
- Is all input validated at the server boundary, independent of any client-side validation?
- Are errors handled and logged appropriately without leaking internals to the client?
- Are any new environment variables or configuration values required?

---

## Performance

*If the feature has any user-facing latency, data volume, or resource cost:*

- What are the acceptable response time expectations?
- Does this introduce any heavy computation, large data fetches, or expensive renders?
- Are there bundle size implications (new dependencies, large assets)?
- At what data volume does this feature start to degrade, and is that volume realistic?

---

## Observability & Reliability

- How will errors surface — are they logged, reported, or silently swallowed?
- What is the behavior when a dependency (database) is slow or unavailable? Define the degraded/fallback state explicitly
- Are there any partial-failure scenarios where the UI could show misleading data?

---

## Rollback & Reversibility

- Can this feature be disabled or reverted quickly if it causes problems in production?
- Does this involve any irreversible data changes (schema migrations, data deletions)? If yes, what is the recovery strategy?

---

## Testing & Validation

Every feature must pass all of the following before it is considered complete:

- Build check must pass with zero errors (`npm run build`)
- Lint check must pass with zero errors or warnings (`npm run lint`)
- If any UI was added or changed: verify visually in a browser at 375px viewport, confirm no console errors, exercise the primary user flow interactively
- If the feature is implemented in phases: each phase must pass its verification gate before the next phase begins
- Review generated code before accepting — confirm it matches the agreed design and does not introduce unintended side effects

---

## Open Questions

Maintain a running list of anything still unknown or unresolved at the point implementation begins. Each item should include a recommended default so work can proceed, and be resolved and removed as soon as possible.

- What questions, if left unanswered, would cause the wrong thing to be built?
- What has been assumed that still needs to be validated?
- What decisions are being deferred, and is deferral safe?
