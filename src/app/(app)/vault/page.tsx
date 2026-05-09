"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { listAllEntries } from "@/lib/firestore";
import type { Entry } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Utensils, Calendar as CalendarIcon } from "lucide-react";

export default function VaultPage() {
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
        toast.error("Failed to load vault");
      } finally {
        setLoading(false);
      }
    }
    fetchAll();
  }, [user]);

  // Filter entries that have a savor_moment
  const savorEntries = Object.entries(entries)
    .filter(([, e]) => e.savor_moment && e.savor_moment.trim() !== "")
    .sort(([dateA], [dateB]) => dateB.localeCompare(dateA));

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
        <h1 className="text-2xl font-bold tracking-tight">Savor Vault</h1>
        <p className="text-sm text-muted-foreground">
          Historical moments of gratitude and joy.
        </p>
      </header>

      {savorEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center opacity-40">
          <Utensils className="h-12 w-12" />
          <p className="text-sm">No savor moments logged yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {savorEntries.map(([date, entry]) => (
            <Card key={date} className="border-none bg-accent/30 shadow-none">
              <CardContent className="p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  <CalendarIcon className="h-3 w-3" />
                  {new Date(date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 italic">
                  "{entry.savor_moment}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
