"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Anchor, Link2, Sun, Moon, Layers, GraduationCap } from "lucide-react";
import ManufacturerPicker from "@/components/ManufacturerPicker";
import UnitsMenu from "@/components/UnitsMenu";
import { useExplorerStore } from "@/store/useExplorerStore";
import { useToast } from "@/store/useToast";

export default function AppHeader() {
  const router = useRouter();
  const theme = useExplorerStore((s) => s.theme);
  const toggleTheme = useExplorerStore((s) => s.toggleTheme);
  const showToast = useToast((s) => s.show);

  const handleSelect = useCallback(
    (slug: string) => {
      // A fresh selection drops any existing filter params (filters reset).
      router.push(`/?m=${encodeURIComponent(slug)}`, { scroll: false });
    },
    [router],
  );

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast("Link copied to clipboard");
    } catch {
      showToast("Couldn't copy link");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1700px] items-center gap-3 px-4 sm:gap-4">
        {/* Brand */}
        <a
          href="/"
          className="focus-ring flex shrink-0 items-center gap-2.5 rounded-md"
          aria-label="HullData home"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent/15 text-accent ring-1 ring-accent/30">
            <Anchor className="h-4 w-4" />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="font-display text-base font-bold tracking-tight text-ink">
              HullData
            </span>
            <span className="text-[10px] text-muted">
              Powerboat reference library
            </span>
          </span>
        </a>

        {/* Manufacturer combobox — center */}
        <div className="mx-auto w-full max-w-md">
          <ManufacturerPicker onSelect={handleSelect} />
        </div>

        {/* Controls — right */}
        <div className="flex shrink-0 items-center gap-1.5">
          <Link
            href="/learn"
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-ink"
          >
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Learn</span>
          </Link>
          <Link
            href="/explore"
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-ink"
          >
            <Layers className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Explore all</span>
          </Link>
          <UnitsMenu />
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            className="focus-ring grid h-8 w-8 place-items-center rounded-lg border border-line bg-surface-2/60 text-muted transition-colors hover:text-ink"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={copyLink}
            className="focus-ring flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-ink"
          >
            <Link2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">Copy link</span>
          </button>
        </div>
      </div>
    </header>
  );
}
