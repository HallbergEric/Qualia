import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Entry, MonthlyStats, AllTimeStats } from "@/types";

// ── Helpers ────────────────────────────────────────────────────────────────

function entryPath(uid: string, date: string) {
  return doc(db, "users", uid, "entries", date);
}

/** Returns local date string in YYYY-MM-DD format (not UTC). */
export function todayString(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

// ── CRUD ───────────────────────────────────────────────────────────────────

export async function getEntry(uid: string, date: string): Promise<Entry | null> {
  const snap = await getDoc(entryPath(uid, date));
  if (!snap.exists()) return null;
  return snap.data() as Entry;
}

export async function saveEntry(uid: string, date: string, data: Partial<Entry>): Promise<void> {
  await setDoc(entryPath(uid, date), data, { merge: true });
}

export async function deleteEntry(uid: string, date: string): Promise<void> {
  await deleteDoc(entryPath(uid, date));
}

export async function listEntries(
  uid: string,
  yearMonth: string // "YYYY-MM"
): Promise<Record<string, Entry>> {
  const [year, month] = yearMonth.split("-");
  const start = `${year}-${month}-01`;
  const end = `${year}-${month}-31`;
  const ref = collection(db, "users", uid, "entries");
  const q = query(ref, orderBy("__name__"));
  const snaps = await getDocs(q);
  const result: Record<string, Entry> = {};
  snaps.forEach((snap) => {
    const id = snap.id;
    if (id >= start && id <= end) result[id] = snap.data() as Entry;
  });
  return result;
}

export async function listAllEntries(uid: string): Promise<Record<string, Entry>> {
  const ref = collection(db, "users", uid, "entries");
  const q = query(ref, orderBy("__name__"));
  const snaps = await getDocs(q);
  const result: Record<string, Entry> = {};
  snaps.forEach((snap) => {
    result[snap.id] = snap.data() as Entry;
  });
  return result;
}

// ── Analytics ──────────────────────────────────────────────────────────────

export function computeCurrentStreak(entries: Record<string, Entry>): number {
  const today = todayString();
  // If today is not logged, start counting from yesterday
  const startDate = entries[today] ? today : (() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  })();

  let streak = 0;
  const cursor = new Date(startDate);
  while (true) {
    const yyyy = cursor.getFullYear();
    const mm = String(cursor.getMonth() + 1).padStart(2, "0");
    const dd = String(cursor.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    if (!entries[key]) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function computeLongestStreak(entries: Record<string, Entry>): number {
  const dates = Object.keys(entries).sort();
  if (dates.length === 0) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      current++;
      if (current > longest) longest = current;
    } else {
      current = 1;
    }
  }
  return longest;
}

export function computeMonthlyStats(
  entries: Record<string, Entry>,
  yearMonth: string // "YYYY-MM"
): MonthlyStats {
  const monthEntries = Object.entries(entries).filter(([k]) => k.startsWith(yearMonth));
  const total = monthEntries.length;
  if (total === 0) return { connectionRate: 0, flowCount: 0 };
  const connectionHits = monthEntries.filter(([, e]) => e.connection_hit).length;
  const flowCount = monthEntries.filter(([, e]) => e.flow_state).length;
  return { connectionRate: connectionHits / total, flowCount };
}

export function computeAllTimeStats(entries: Record<string, Entry>): AllTimeStats {
  const totalEntries = Object.keys(entries).length;
  const savorTotal = Object.values(entries).filter((e) => e.savor_moment !== "").length;
  return { savorTotal, totalEntries };
}
