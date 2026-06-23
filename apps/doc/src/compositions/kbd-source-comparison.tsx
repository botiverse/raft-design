import type { ReactNode } from "react";

import LegacyMenuItem from "../../../../packages/ui/src/legacy/menu-item.tsx";
import { KbdDeleteShortcutComposition } from "./kbd/menu-shortcut-composition.tsx";
import { KbdShortcutGroupComposition } from "./kbd/shortcut-group-composition.tsx";

export const KBD_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  DeleteShortcut: "apps/doc/src/compositions/kbd/menu-shortcut-composition.tsx",
  CommandShortcut: "apps/doc/src/compositions/kbd/shortcut-group-composition.tsx",
} as const;

export const KBD_SOURCE_COMPARISON_COMPOSITION = {
  DeleteShortcut: KbdDeleteShortcutComposition,
  CommandShortcut: KbdShortcutGroupComposition,
} as const;

function KbdSourcePreview({
  children,
  className,
  trailing,
}: {
  children: ReactNode;
  className?: string;
  trailing: ReactNode;
}) {
  return (
    <div
      className={["flex h-full min-h-28 w-full items-center justify-center px-3 py-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="w-64">
        <LegacyMenuItem trailing={trailing}>{children}</LegacyMenuItem>
      </div>
    </div>
  );
}

export function KbdDeleteShortcutSourcePreview({ className }: { className?: string }) {
  return (
    <KbdSourcePreview
      className={className}
      trailing={<span className="ml-auto font-sans text-sm font-medium text-black/60">⌫</span>}
    >
      Delete
    </KbdSourcePreview>
  );
}

export function KbdCommandShortcutSourcePreview({ className }: { className?: string }) {
  return (
    <KbdSourcePreview
      className={className}
      trailing={<span className="ml-auto font-sans text-sm font-medium text-black/60">⌘C</span>}
    >
      Copy link
    </KbdSourcePreview>
  );
}

export const KBD_SOURCE_COMPARISON_SOURCE = {
  CommandShortcut: KbdCommandShortcutSourcePreview,
  DeleteShortcut: KbdDeleteShortcutSourcePreview,
} as const;
