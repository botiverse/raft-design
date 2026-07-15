import { useThemeFamily } from "raft-ui";
import { cn } from "raft-ui/cn";

export function PlaygroundChannelEmptyState() {
  const theme = useThemeFamily();

  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-1 items-center justify-center uppercase",
        theme === "brutal"
          ? "font-display text-lg font-bold text-black/40"
          : "font-heading text-sm font-medium tracking-wide text-foreground-muted",
      )}
    >
      Select a channel
    </div>
  );
}
