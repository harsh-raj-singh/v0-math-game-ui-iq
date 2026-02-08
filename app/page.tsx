import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mic, Brain, BarChart3 } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/game");
  }

  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-4">
      <div className="flex max-w-md flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-3">
          <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-5xl">
            MathVox
          </h1>
          <p className="text-lg text-muted-foreground text-balance">
            Practice mental math with your voice. Speak answers, track streaks,
            and sharpen your skills.
          </p>
        </div>

        <Button asChild size="lg" className="gap-2">
          <Link href="/auth/login">Get Started</Link>
        </Button>

        <div className="grid grid-cols-3 gap-6 pt-4">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Mic className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-xs text-muted-foreground">Voice Control</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-xs text-muted-foreground">Mental Math</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
            </div>
            <span className="text-xs text-muted-foreground">Track Progress</span>
          </div>
        </div>
      </div>
    </main>
  );
}
