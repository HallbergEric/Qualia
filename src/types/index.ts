export interface Entry {
  connection_hit: boolean;
  savor_moment: string; // max 140 chars, "" when empty
  flow_state: boolean;
}

export interface StreakData {
  current: number;
  longest: number;
}

export interface MonthlyStats {
  connectionRate: number; // 0–1, entries this month
  flowCount: number;      // entries this month
}

export interface AllTimeStats {
  savorTotal: number;     // count of non-empty savor_moment entries, all time
  totalEntries: number;
}
