---
applyTo: "src/**"
---

# Qualia — Components & Features Reference

## Portal Rule (Bottom Sheets & Dialogs)

The inner app column (`src/app/(app)/layout.tsx`) has `overflow-hidden`. Any `position: fixed` overlay rendered inside it is clipped to the column width, not the viewport. **Always use `createPortal(…, document.body)`** for custom bottom sheets and dialogs that are not Shadcn `<Sheet>` or `<Dialog>` (those handle portaling internally).

Z-index convention: `BottomNav` = `z-50` · backdrop = `z-[60]` · panel = `z-[70]`

## Layout Rules

- App shell: outer `flex justify-center`, inner column `max-w-lg` mobile → `max-w-4xl` on `md+`.
- On `md+`: column gets `border-x border-zinc-800` and dark drop shadow.
- All scrollable `<main>` elements: `flex-1 min-h-0 overflow-y-auto`.

## Route Map

| Path | File | Purpose |
|---|---|---|
| `/login` | `app/login/page.tsx` | Google Sign-In |
| `/` | `app/(app)/page.tsx` | Calendar Hub — the main landing view |
| `/vault` | `app/(app)/vault/page.tsx` | Savor Vault — scrollable list of past savor moments |
| `/analytics` | `app/(app)/analytics/page.tsx` | Streaks, rates, and lifetime stats |
| `/profile` | `app/(app)/profile/page.tsx` | User profile and sign-out |

## Navigation

`BottomNav.tsx` — fixed bottom bar with four tabs: **Today | Vault | Analytics | Profile**. `RouteGuard` in `(app)/layout.tsx` handles auth redirect — individual pages do not redirect manually.

## Shadcn Component Installation

Add Shadcn components via the CLI — never hand-write files in `src/components/ui/`:

```bash
npx shadcn@latest add calendar sheet dialog toggle button popover
```

Import from `@/components/ui/<component-name>`:

```ts
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
```

## Shadcn Calendar — Styling Individual Days

The Shadcn `<Calendar>` uses `modifiers` + `modifiersClassNames` props to apply custom styles to specific dates. **This is the only correct way to mark logged days** — do not attempt to override internal Shadcn class names directly.

```tsx
import { Calendar } from "@/components/ui/calendar";

// Convert entry date strings to Date objects for the modifiers prop
const loggedDateObjects = entries.map(e => new Date(e.date + "T00:00:00"));

<Calendar
  mode="single"
  selected={selectedDate}
  onSelect={handleDayClick}
  disabled={{ after: new Date() }} // disable future days
  modifiers={{
    logged: loggedDateObjects,
  }}
  modifiersClassNames={{
    logged: "bg-sky-500/20 text-sky-400 font-medium rounded-full",
  }}
/>
```

**Date conversion rule:** Always use `new Date(dateStr + "T00:00:00")` (local midnight) when converting `"YYYY-MM-DD"` strings to `Date` objects. Never use `new Date(dateStr)` alone — that parses as UTC midnight and shifts the date for users in negative UTC offsets.

## Core Components

### CalendarHub (`src/app/(app)/page.tsx` or colocated component)
The primary landing view. Loads all entries via `listAllEntries` once on mount, then renders a Shadcn `<Calendar>` with `modifiers` marking logged days (see Calendar section above). Day visual states:
- **Today (logged):** `bg-sky-500 text-white rounded-full`
- **Past logged day:** `bg-sky-500/20 text-sky-400 font-medium rounded-full`
- **Today (not logged):** default selected style (ring)
- **Past empty day:** `text-zinc-600`

Tapping a logged day opens `EntrySheet` in read mode (shows savor moment text + toggles). Tapping an empty past day or today opens `EntrySheet` in write mode (form). Future days are disabled.

**Performance note:** `listAllEntries` is called once on mount and held in state. The calendar only needs the set of dates to render markers — the full entry for a specific day is fetched lazily when `EntrySheet` opens.

### EntrySheet (`src/components/EntrySheet.tsx`)
A Shadcn `<Sheet>` (bottom drawer). Two modes controlled by internal state:
- **Write mode:** Connection toggle, Flow toggle, savor moment textarea (max 140 chars with live character counter). Save calls `saveEntry()`.
- **Read mode:** displays the entry read-only. "Edit" button is **only shown for today** — past entries are read-only by design.

Props: `open`, `date: string` (`"YYYY-MM-DD"`), `entry?: Entry` (undefined = new entry), `onClose`, `onSaved(entry: Entry)`.

### SavorVault (`src/app/(app)/vault/page.tsx`)
Read-only chronological list of all logged `savor_moment` strings. Each card shows the date and the savor text. Includes a "Random" button that surfaces one past entry at random to prompt reflection. No editing — users must navigate back to the day via the calendar.

### StreakCard (`src/components/StreakCard.tsx`)
Displays a single stat with a large number and a label. Used in pairs/grids on the Analytics page.

Props: `value: number | string`, `label: string`, `accent?: boolean` (sky highlight when true).

### AuthProvider (`src/components/AuthProvider.tsx`)
Firebase Auth context. Exposes `{ user, loading }` via `useAuth()`. Wraps the root layout.

### RouteGuard (`src/components/RouteGuard.tsx`)
Renders inside `(app)/layout.tsx`. Redirects unauthenticated users to `/login`. Individual pages do not need to guard themselves.

### Toast (`src/components/Toast.tsx`)
Global toast notification system. Use `useToast()` hook. Variants: `"success"` (emerald) · `"error"` (red) · `"default"` (zinc). Auto-dismisses after 3s.

### ConfirmDialog (`src/components/ConfirmDialog.tsx`)
Shadcn `<Dialog>` wrapper for destructive confirmations. Never build custom inline confirmation UI — always use this component.
