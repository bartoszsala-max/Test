"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, LogOut, User } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-3xl font-semibold text-charcoal dark:text-ivory mb-6">Settings</h1>

      {/* Account */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-charcoal/50 dark:text-ivory/50 uppercase tracking-widest mb-3">Account</h2>
        <div className="bg-white dark:bg-charcoal/60 rounded-xl border border-charcoal/10 dark:border-ivory/10 divide-y divide-charcoal/8 dark:divide-ivory/8">
          <div className="flex items-center gap-3 p-4">
            <div className="w-9 h-9 rounded-full bg-sienna/15 flex items-center justify-center shrink-0">
              <User className="h-4 w-4 text-sienna" />
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal dark:text-ivory">{user?.email ?? "Loading…"}</p>
              <p className="text-xs text-charcoal/50 dark:text-ivory/50">Signed in via magic link / OAuth</p>
            </div>
          </div>
          <div className="p-4">
            <Button variant="destructive" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="mb-6">
        <h2 className="text-xs font-semibold text-charcoal/50 dark:text-ivory/50 uppercase tracking-widest mb-3">Appearance</h2>
        <div className="bg-white dark:bg-charcoal/60 rounded-xl border border-charcoal/10 dark:border-ivory/10 p-4">
          <p className="text-sm font-medium text-charcoal dark:text-ivory mb-3">Theme</p>
          <div className="flex gap-3">
            {[
              { value: "light", label: "Light", icon: Sun },
              { value: "dark", label: "Dark", icon: Moon },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={cn(
                  "flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border text-sm font-medium transition-all",
                  theme === value
                    ? "border-sienna bg-sienna/10 text-sienna"
                    : "border-charcoal/15 dark:border-ivory/15 text-charcoal/60 dark:text-ivory/60 hover:border-sienna/30"
                )}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Setup */}
      <section>
        <h2 className="text-xs font-semibold text-charcoal/50 dark:text-ivory/50 uppercase tracking-widest mb-3">Setup</h2>
        <div className="bg-white dark:bg-charcoal/60 rounded-xl border border-charcoal/10 dark:border-ivory/10 p-4 space-y-3 text-sm text-charcoal/70 dark:text-ivory/70">
          <p>To get started, configure these environment variables in your <code className="text-sienna bg-sienna/5 px-1 rounded text-xs">.env.local</code> file:</p>
          <ul className="space-y-1.5 text-xs font-mono">
            {[
              "NEXT_PUBLIC_SUPABASE_URL",
              "NEXT_PUBLIC_SUPABASE_ANON_KEY",
              "NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY",
              "ANTHROPIC_API_KEY",
            ].map((key) => (
              <li key={key} className="flex items-center gap-2">
                <span className="text-teal">•</span>
                <code className="text-charcoal dark:text-ivory">{key}</code>
              </li>
            ))}
          </ul>
          <p>Then run <code className="text-sienna bg-sienna/5 px-1 rounded text-xs">supabase/schema.sql</code> in your Supabase SQL editor to create the tables.</p>
        </div>
      </section>
    </div>
  );
}
