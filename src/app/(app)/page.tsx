"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getEntry, saveEntry, todayString } from "@/lib/firestore";
import type { Entry } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Heart, Sparkles, Brain, Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

export default function HomePage() {
  const { user } = useAuth();
  const [entry, setEntry] = useState<Entry>({
    connection_hit: false,
    savor_moment: "",
    flow_state: false,
  });
  const [loading, setLoading] = useState(true);
  const dateStr = todayString();

  const fetchEntry = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getEntry(user.uid, dateStr);
      if (data) setEntry(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load today's entry");
    } finally {
      setLoading(false);
    }
  }, [user, dateStr]);

  useEffect(() => {
    fetchEntry();
  }, [fetchEntry]);

  const updateEntry = async (updates: Partial<Entry>) => {
    if (!user) return;
    const newEntry = { ...entry, ...updates };
    setEntry(newEntry);
    try {
      // Logic for new entries: ensure they have all required fields for Firestore rules
      await saveEntry(user.uid, dateStr, newEntry);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save changes");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="container mx-auto flex flex-col gap-6 p-4 max-w-md">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Today</h1>
        <p className="text-sm text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </header>

      <div className="grid gap-6">
        {/* Connection */}
        <Card className="overflow-hidden border-none bg-accent/50 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-rose-500/10 p-2 text-rose-500">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="connection" className="text-base font-semibold">
                      Meaningful Connection
                    </Label>
                    <Tooltip>
                      <TooltipTrigger className="text-muted-foreground transition-colors hover:text-blue-500">
                        <Info className="h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        <p className="font-semibold mb-1">Harvard Study of Adult Development</p>
                        <p>A "hit" is any brief, positive interaction where you felt seen or heard. It's the #1 predictor of long-term health and happiness.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Did you connect with someone today?
                  </p>
                </div>
              </div>
              <Checkbox
                id="connection"
                checked={entry.connection_hit}
                onCheckedChange={(checked) =>
                  updateEntry({ connection_hit: !!checked })
                }
                className="h-6 w-6"
              />
            </div>
          </CardContent>
        </Card>

        {/* Savoring */}
        <Card className="overflow-hidden border-none bg-accent/50 shadow-none">
          <CardContent className="p-6">
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="savor" className="text-base font-semibold">
                      Savoring a Moment
                    </Label>
                    <Tooltip>
                      <TooltipTrigger className="text-muted-foreground transition-colors hover:text-amber-500">
                        <Info className="h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        <p className="font-semibold mb-1">Blue Zones Research</p>
                        <p>Savoring is the act of stepping outside of an experience to review and appreciate it while it is happening. It helps your brain process positive emotions longer.</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Something simple that sparked joy.
                  </p>
                </div>
              </div>
              <Textarea
                id="savor"
                placeholder="What did you savor today? (max 140 chars)"
                className="resize-none bg-background/50 border-none min-h-[80px] text-sm focus-visible:ring-1"
                maxLength={140}
                value={entry.savor_moment}
                onChange={(e) => updateEntry({ savor_moment: e.target.value })}
              />
              <div className="flex justify-end">
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">
                  {entry.savor_moment.length}/140
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Flow State */}
        <Card className="overflow-hidden border-none bg-accent/50 shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-violet-500/10 p-2 text-violet-500">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <Label htmlFor="flow" className="text-base font-semibold">
                      Flow State
                    </Label>
                    <Tooltip>
                      <TooltipTrigger className="text-muted-foreground transition-colors hover:text-indigo-500">
                        <Info className="h-3.5 w-3.5" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs text-xs">
                        <p className="font-semibold mb-1">Optimal Experience</p>
                        <p>A "flow state" occurs when you are so involved in an activity that nothing else seems to matter. It's often described as being "in the zone."</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Deep focus or losing track of time.
                  </p>
                </div>
              </div>
              <Checkbox
                id="flow"
                checked={entry.flow_state}
                onCheckedChange={(checked) =>
                  updateEntry({ flow_state: !!checked })
                }
                className="h-6 w-6"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-2 opacity-50" />

      <footer className="text-center">
        <p className="text-[10px] text-muted-foreground italic">
          "The good life is built with good relationships."
        </p>
      </footer>
    </main>
  );
}
