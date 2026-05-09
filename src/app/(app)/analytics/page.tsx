"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listAllEntries, computeCurrentStreak, computeLongestStreak, computeAllTimeStats } from "@/lib/firestore";
import type { Entry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Flame, Trophy, Heart, Zap } from "lucide-react";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<Record<string, Entry>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      if (!user) return;
      try {
        const data = await listAllEntries(user.uid);
        setEntries(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [user]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const currentStreak = computeCurrentStreak(entries);
  const longestStreak = computeLongestStreak(entries);
  const { savorTotal, totalEntries } = computeAllTimeStats(entries);
  
  // Custom rate calculations
  const totalList = Object.values(entries);
  const connectionRate = totalEntries > 0 
    ? Math.round((totalList.filter(e => e.connection_hit).length / totalEntries) * 100) 
    : 0;
  const flowCount = totalList.filter(e => e.flow_state).length;

  return (
    <main className="container mx-auto flex flex-col gap-6 p-4 max-w-md pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Insight into your wellbeing journey.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4">
        {/* Current Streak */}
        <Card className="border-none bg-orange-500/10 shadow-none">
          <CardHeader className="p-4 pb-0 items-center">
            <Flame className="h-6 w-6 text-orange-500" />
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-orange-500/70 pt-2">
              Current
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-center">
            <span className="text-3xl font-bold">{currentStreak}</span>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Days</p>
          </CardContent>
        </Card>

        {/* Longest Streak */}
        <Card className="border-none bg-yellow-500/10 shadow-none">
          <CardHeader className="p-4 pb-0 items-center">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <CardTitle className="text-xs font-bold uppercase tracking-widest text-yellow-500/70 pt-2">
              Best
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 text-center">
            <span className="text-3xl font-bold">{longestStreak}</span>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase">Days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {/* Connection Rate */}
        <Card className="border-none bg-accent/30 shadow-none">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Heart className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Connection Rate</p>
                <p className="text-xs text-muted-foreground">Of all entries logged</p>
              </div>
            </div>
            <span className="text-xl font-bold">{connectionRate}%</span>
          </CardContent>
        </Card>

        {/* Flow Count */}
        <Card className="border-none bg-accent/30 shadow-none">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Zap className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Total Flow States</p>
                <p className="text-xs text-muted-foreground">Deep focus sessions</p>
              </div>
            </div>
            <span className="text-xl font-bold">{flowCount}</span>
          </CardContent>
        </Card>

        {/* Total Entries */}
        <Card className="border-none bg-accent/30 shadow-none">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-500">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Total Entries</p>
                <p className="text-xs text-muted-foreground">Consistency is key</p>
              </div>
            </div>
            <span className="text-xl font-bold">{totalEntries}</span>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
      <line x1="16" x2="16" y1="2" y2="6"/>
      <line x1="8" x2="8" y1="2" y2="6"/>
      <line x1="3" x2="21" y1="10" y2="10"/>
    </svg>
  );
}
