import { cn, useThemeFamily } from "raft-ui";
import {
  Composer as ComposerPrimitive,
  ComposerInput as ComposerInputPrimitive,
  ComposerSuggestionList as ComposerSuggestionListPrimitive,
  ComposerToolbar as ComposerToolbarPrimitive,
  type ComposerInputProps,
  type ComposerProps,
  type ComposerSuggestionListProps,
  type ComposerToolbarProps,
} from "raft-ui/wip";

/** Consumer-owned viewport tweaks kept out of the Composer primitive. */
export function Composer({ className, ...props }: ComposerProps) {
  const theme = useThemeFamily();

  return (
    <ComposerPrimitive
      className={cn(theme === "elegant" && "md:shadow-lg md:ring-ink-2", className)}
      {...props}
    />
  );
}

export function ComposerInput({ className, ...props }: ComposerInputProps) {
  const theme = useThemeFamily();

  return (
    <ComposerInputPrimitive
      className={cn(theme === "elegant" ? "md:min-h-20 md:px-4 md:pt-4" : "md:min-h-10", className)}
      {...props}
    />
  );
}

export function ComposerToolbar({ className, ...props }: ComposerToolbarProps) {
  const theme = useThemeFamily();

  return (
    <ComposerToolbarPrimitive
      className={cn(theme === "elegant" && "md:px-3 md:pb-3", className)}
      {...props}
    />
  );
}

export function ComposerSuggestionList({ className, ...props }: ComposerSuggestionListProps) {
  const theme = useThemeFamily();

  return (
    <ComposerSuggestionListPrimitive
      className={cn(theme === "elegant" && "md:shadow-lg md:ring-ink-2", className)}
      {...props}
    />
  );
}
