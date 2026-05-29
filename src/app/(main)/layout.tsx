import { MobileNav } from "@/components/MobileNav";
import { UserMenu } from "@/components/UserMenu";
import Link from "next/link";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col pb-16 sm:pb-0 bg-zinc-50 dark:bg-zinc-950">
      {/* Universal Header */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-orange-600" />
            <span className="text-xl font-black tracking-tight">Majlis prediction</span>
          </Link>
          
          {/* Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden sm:flex items-center gap-8 text-sm font-bold text-zinc-500 dark:text-zinc-400">
            <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">Home</Link>
            <Link href="/matches" className="hover:text-zinc-900 dark:hover:text-zinc-100">Matches</Link>
            <Link href="/leaderboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">Leaderboard</Link>
          </nav>
          
          {/* Top Right User Menu */}
          <div className="flex items-center gap-4">
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <MobileNav />
    </div>
  );
}
