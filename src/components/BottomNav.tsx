"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, BookOpen, BarChart2, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Today", icon: CalendarDays },
  { href: "/vault", label: "Vault", icon: BookOpen },
  { href: "/analytics", label: "Stats", icon: BarChart2 },
  { href: "/profile", label: "Profile", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
      <ul className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1 text-xs transition-colors",
                  active ? "text-sky-400" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
