---
applyTo: "src/**"
---

# Qualia — TypeScript & React Patterns

## Server vs Client Components

- **Default: Server Component.** No `"use client"` directive needed.
- **Add `"use client"` only when** the component needs: interactive event handlers, React hooks (`useState`, `useEffect`, `useRef`, `useContext`), or browser-only APIs (`sessionStorage`, `window`, etc.).
- Pages under `src/app/(app)/` are virtually all `"use client"` because they read Firestore and use auth.

## `cn()` Utility

Shadcn generates `src/lib/utils.ts` with a `cn()` helper for merging Tailwind classes conditionally. **Always use `cn()` when combining class strings** — never use string concatenation or template literals for class composition.

```ts
import { cn } from "@/lib/utils";

// ✅ correct
<div className={cn("rounded-xl bg-zinc-900 p-4", isActive && "border-sky-500", className)} />

// ❌ wrong
<div className={`rounded-xl bg-zinc-900 p-4 ${isActive ? "border-sky-500" : ""}`} />
```

`cn()` is a thin wrapper around `clsx` + `tailwind-merge`. It correctly deduplicates conflicting Tailwind classes (e.g. `cn("p-4", "p-6")` → `"p-6"`).

## Path Alias

`@/` resolves to `src/`. **Always use `@/` imports** — never use relative paths.

```ts
// ✅ correct
import { useAuth } from "@/components/AuthProvider";
import { getEntry, saveEntry } from "@/lib/firestore";

// ❌ wrong
import { useAuth } from "../../components/AuthProvider";
```

## Auth — Getting the Current User

Every authenticated page and component gets the logged-in user via `useAuth()`:

```ts
"use client";
import { useAuth } from "@/components/AuthProvider";

export default function MyPage() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return null; // RouteGuard handles redirect
  // use user.uid for all Firestore calls
}
```

`AuthProvider` lives at the root layout; `RouteGuard` in `(app)/layout.tsx` handles the `/login` redirect — individual pages don't need to redirect manually.

## Toast Notifications

```ts
"use client";
import { useToast } from "@/components/Toast";

export function MyComponent() {
  const { toast } = useToast();

  async function save() {
    try {
      await saveEntry(uid, date, data);
      toast("Saved!", "success");
    } catch (e) {
      toast((e as Error).message, "error");
    }
  }
}
```

Variants: `"success"` (emerald) · `"error"` (red) · `"default"` (zinc). Auto-dismisses after 3s.

## Confirm Dialog for Destructive Actions

Never build custom inline confirmation UI. Use `<ConfirmDialog>` from `@/components/ConfirmDialog`:

```tsx
const [confirmOpen, setConfirmOpen] = useState(false);
const [deleting, setDeleting] = useState(false);

<ConfirmDialog
  open={confirmOpen}
  message="This will permanently delete this entry."
  onConfirm={async () => {
    setDeleting(true);
    await deleteEntry(uid, date);
    setConfirmOpen(false);
    toast("Deleted", "success");
    setDeleting(false);
  }}
  onCancel={() => setConfirmOpen(false)}
  loading={deleting}
/>
```

Props: `open` (boolean), `title?` (default "Are you sure?"), `message`, `confirmLabel?` (default "Delete"), `onConfirm`, `onCancel`, `loading?`.

## Data Fetching

All data loading is client-side — plain `useEffect` + `loading` state. No react-query, no SWR, no server actions.

```ts
const [entries, setEntries] = useState<Entry[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  if (!user) return;
  listAllEntries(user.uid)
    .then(setEntries)
    .catch(e => toast(e.message, "error"))
    .finally(() => setLoading(false));
}, [user]);
```

Show a spinner while `loading === true`. Show an empty state when `!loading && entries.length === 0`.

## Date Handling

Dates are stored and referenced as `"YYYY-MM-DD"` strings. Use this helper to get today's date in local time:

```ts
function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
```

Never use `new Date().toISOString().slice(0, 10)` — that returns UTC, which will be wrong for users in negative UTC offsets late at night.

## TypeScript Types Reference

All types in `src/types/index.ts`:

```ts
Entry = {
  date: string;            // "YYYY-MM-DD"
  connection_hit: boolean;
  savor_moment: string;    // max 140 chars; "" when empty
  flow_state: boolean;
}

StreakData = {
  currentStreak: number;
  longestStreak: number;
}

MonthlyStats = {
  connectionRate: number;  // 0–1
  flowCount: number;
  savorTotal: number;
}
```
