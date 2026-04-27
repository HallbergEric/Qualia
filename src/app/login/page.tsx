"use client";

import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useEffect } from "react";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  async function handleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace("/");
    } catch {
      toast.error("Sign-in failed. Please try again.");
    }
  }

  if (loading || user) return null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Qualia</h1>
        <p className="max-w-xs text-sm text-muted-foreground">
          Track the three intangibles that make a good life — connection, savoring, and flow.
        </p>
      </div>
      <Button size="lg" onClick={handleSignIn} className="w-full max-w-xs">
        Continue with Google
      </Button>
    </main>
  );
}
