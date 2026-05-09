"use client";

import { useAuth } from "@/components/AuthProvider";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Shield } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (!user) return null;

  return (
    <main className="container mx-auto flex flex-col gap-8 p-4 max-w-md">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Account and application settings.</p>
      </header>

      <Card className="border-none bg-accent/30 shadow-none">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-background">
            {user.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || "User"} className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-8 w-8 text-primary/40" />
            )}
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">{user.displayName || "Private User"}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        <div className="flex flex-col gap-2 px-1">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Privacy</h3>
          <Card className="border-none bg-accent/30 shadow-none">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold">Data Protection</p>
                <p className="text-xs text-muted-foreground">Your logs are private and secure.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4">
          <Button 
            variant="destructive" 
            className="w-full justify-between" 
            onClick={handleSignOut}
          >
            <span>Sign Out</span>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <footer className="mt-8 text-center flex flex-col gap-2">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Qualia v1.0.0</p>
        <p className="text-[10px] text-muted-foreground/40 italic px-8">
          Based on the Harvard Study of Adult Development and Blue Zones research.
        </p>
      </footer>
    </main>
  );
}
