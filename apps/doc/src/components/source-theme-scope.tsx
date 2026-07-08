import type { ReactNode } from "react";
import { cn } from "raft-ui/cn";

type SourceThemeScopeProps = {
  children: ReactNode;
  className?: string;
};

export function SourceThemeScope({ children, className }: SourceThemeScopeProps) {
  return (
    <div
      data-source-theme="slock"
      className={cn(
        "font-display text-[var(--source-ink)]",
        "[--source-ink:#141111]",
        "[--source-ink-muted:color-mix(in_oklch,var(--source-ink)_50%,transparent)]",
        "[--source-shadow-sm:2px_2px_0_#141111]",
        "[--source-shadow-md:4px_4px_0_#141111]",
        "[&_.border-black]:border-[var(--source-ink)]",
        "[&_.bg-black]:bg-[var(--source-ink)]",
        "[&_.divide-black]:divide-[var(--source-ink)]",
        "[&_.shadow-brutal-sm]:shadow-[var(--source-shadow-sm)]",
        "[&_.shadow-brutal]:shadow-[var(--source-shadow-md)]",
        "[&_.text-black]:text-[var(--source-ink)]",
        "[&_.text-black\\/50]:text-[var(--source-ink-muted)]",
        className,
      )}
    >
      {children}
    </div>
  );
}
