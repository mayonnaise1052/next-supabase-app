import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import Link from "next/link";
import { Suspense } from "react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>Next.js Supabase Starter</Link>
              <Link
                href="/projects"
                className="text-foreground/70 hover:text-foreground"
              >
                Projects
              </Link>
              <Link
                href="/protected"
                className="text-foreground/70 hover:text-foreground"
              >
                Protected
              </Link>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-6 w-full max-w-5xl p-5">
          <h1 className="text-2xl font-bold">Next.js + Supabase RLS Check</h1>
          <p className="text-muted-foreground">
            Verify Row Level Security on the{" "}
            <code className="text-xs bg-muted px-1 py-0.5 rounded">projects</code>{" "}
            table. Sign in, then open Projects to list, create, archive, and
            delete your own rows.
          </p>
          <div className="flex gap-4 text-sm">
            <Link
              href="/projects"
              className="underline underline-offset-4 font-medium"
            >
              Open Projects
            </Link>
            <Link
              href="/auth/login"
              className="underline underline-offset-4 text-muted-foreground hover:text-foreground"
            >
              Sign in
            </Link>
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
