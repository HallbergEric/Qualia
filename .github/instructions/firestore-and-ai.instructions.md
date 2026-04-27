---
applyTo: "src/**"
---

# Qualia — Firestore Patterns

## Firestore Helper Functions (`src/lib/firestore.ts`)

Never write Firestore queries inline in pages or components. All database access goes through these helpers.

### Entries

```ts
getEntry(uid: string, date: string): Promise<Entry | null>
// date = "YYYY-MM-DD". Returns null if no entry exists for that day.

saveEntry(uid: string, date: string, data: Partial<Entry>): Promise<void>
// Upsert via setDoc with { merge: true }.
// Always pass date as part of the data object as well as the doc ID.

listEntries(uid: string, limitDays?: number): Promise<Entry[]>
// Returns entries ordered by date descending.
// limitDays: if provided, only returns entries from the last N days.

listAllEntries(uid: string): Promise<Entry[]>
// Returns all entries ever logged, ordered by date ascending.
// Used for streak calculation and the Savor Vault.

deleteEntry(uid: string, date: string): Promise<void>
// Hard-deletes the entry document for the given date.
// Always confirm with <ConfirmDialog> before calling.
// The base Firestore rule (read, write wildcard) already permits this —
// no separate delete rule needed unless rules are tightened later.
```

### Analytics Helpers

These are **pure client-side functions** — not Firestore calls. They derive stats from the raw entry list.

```ts
computeCurrentStreak(entries: Entry[]): number
// entries must be sorted by date descending.
// Streak edge case: if today has NO entry yet, the streak counts
// consecutive days ending at YESTERDAY (not 0). Showing 0 when the
// user simply hasn't logged yet today is a bad UX — preserve the streak
// until midnight. Example: if today is Apr 27 and the last entry is
// Apr 26, current streak = days including Apr 26 backwards.
// Walk back from today; skip today if not yet logged; stop at first missing day.

computeLongestStreak(entries: Entry[]): number
// entries must be sorted by date ascending.
// Walk the full list and track the max consecutive-day run.

computeMonthlyStats(entries: Entry[], year: number, month: number): MonthlyStats
// month is 1-indexed (1 = January).
```

## Firestore Document Paths

All user data lives under `users/{uid}/`. Never create top-level collections.

```
users/{uid}/entries/{date}    ← one doc per day, date = "YYYY-MM-DD"
```

## Security Rules Pattern

The base rule in `firestore.rules`:

```js
match /users/{userId}/{document=**} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

When adding new collections, continue to nest them under `users/{uid}/`. Never introduce top-level collections that bypass this rule.

## Error Handling Convention

All Firestore calls in pages/components should follow this pattern:

```ts
try {
  await saveEntry(user.uid, date, data);
  toast("Saved", "success");
} catch (e) {
  toast((e as Error).message, "error");
}
```

Never swallow errors silently. Always surface them to the user via toast.

## Future: AI Integration

Qualia does not have an AI layer in its initial release. If AI features are added later, follow the Firebase AI Logic pattern (Gemini via `firebase/ai` client SDK) established in sibling project PTAI. Do not introduce a separate API key — use the Firebase project config.
