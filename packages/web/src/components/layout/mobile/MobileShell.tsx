import type { ReactNode } from "react";

// MobileShell — top-level layout wrapper for the mobile (< md) viewport.
//
// Scope contract (PR1 scaffold; will be filled in by follow-up PRs):
// - Owns the mobile-only chrome (top bar + bottom tab bar).
// - Renders the active master / detail component into its content slot.
// - Does NOT reuse anything from `Sidebar`'s mobileInline branches — those
//   will be removed once the mobile path is fully migrated.
//
// In this scaffold the shell is intentionally inert: it accepts a `children`
// slot and renders it inside a column layout with placeholder bars. Wiring
// into `MainLayout`'s viewport split happens in a follow-up PR after the
// per-mode mobile master components exist.
//
// Originating direction: stdrc 2026-04-29 #proj-uiux:c8711d2a.

export interface MobileShellProps {
  /** The active master or detail panel for the current route. */
  children: ReactNode;
  /** Optional override for the top bar slot (back button / title / actions). */
  topBar?: ReactNode;
  /** Optional override for the bottom tab bar (mode switcher). */
  bottomBar?: ReactNode;
}

export default function MobileShell({ children, topBar, bottomBar }: MobileShellProps) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-brutal-cream">
      <div className="shrink-0">{topBar}</div>
      <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
      <div className="shrink-0">{bottomBar}</div>
    </div>
  );
}
