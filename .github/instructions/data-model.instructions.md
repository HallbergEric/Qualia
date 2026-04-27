---
applyTo: "src/**"
---

# Qualia — Data Model

## Firestore Schema

All user data lives under `users/{uid}/`. Never create top-level collections.

```
users/{userId}
└── entries/{date}          — One document per day, date = "YYYY-MM-DD"
    ├── date: string         — "YYYY-MM-DD" (mirrors the document ID)
    ├── connection_hit: boolean   — Had a meaningful connection beyond small talk?
    ├── savor_moment: string      — One specific enjoyed moment (max 140 chars)
    └── flow_state: boolean       — Lost track of time in a skill-based activity?
```

## Key Rules

- **Document ID = date string.** The document ID for every entry is the ISO date in `YYYY-MM-DD` format. This makes reads O(1) — no queries needed to fetch a specific day.
- **One document per user per day.** Writes are upserts (`setDoc` with `{ merge: true }`), not `addDoc`. This prevents duplicate entries if the user saves twice.
- **`savor_moment` is always a string.** Empty string `""` when the user hasn't filled it in — never `null` or `undefined`.
- **Never store computed stats.** Streaks, rates, and counts are always computed client-side from the raw entry list. Never write derived data back to Firestore.

## TypeScript Types

All shared types in `src/types/index.ts`:

```ts
export interface Entry {
  date: string;            // "YYYY-MM-DD" — matches the Firestore doc ID
  connection_hit: boolean;
  savor_moment: string;    // max 140 chars; "" when empty
  flow_state: boolean;
}

export interface StreakData {
  currentStreak: number;   // consecutive days with an entry up to today
  longestStreak: number;   // all-time record
}

export interface MonthlyStats {
  connectionRate: number;  // 0–1 (fraction of days in month with connection_hit)
  flowCount: number;       // total flow_state: true entries in the month
}

export interface AllTimeStats {
  savorTotal: number;      // total entries with a non-empty savor_moment, all time
  totalEntries: number;    // total days logged, all time
}
```

## Analytics Logic (Client-Side)

All analytics are derived from `listEntries`. Never store computed values.

**Current streak:** Starting from today, walk backwards through consecutive dates that have an entry. Stop at the first missing day.

**Longest streak:** Walk the full sorted entry list, track max consecutive-day run.

**Connection rate (month):** `entries.filter(e => e.connection_hit).length / daysInMonth`

**Flow count (month):** `entries.filter(e => e.flow_state).length`

**Savor total (all time):** `allEntries.filter(e => e.savor_moment.trim() !== "").length`
