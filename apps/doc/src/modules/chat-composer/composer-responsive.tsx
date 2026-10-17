import {
  cn,
  useThemeFamily,
  Composer as ComposerPrimitive,
  ComposerInput as ComposerInputPrimitive,
  ComposerSuggestionList as ComposerSuggestionListPrimitive,
  ComposerToolbar as ComposerToolbarPrimitive,
} from "raft-ui";
import type {
  ComposerInputProps,
  ComposerProps,
  ComposerSuggestionListProps,
  ComposerToolbarProps,
} from "raft-ui";

/** Consumer-owned viewport tweaks kept out of the Composer primitive. */
export function Composer({ className, ...props }: ComposerProps) {
  const theme = useThemeFamily();

  return (
    <ComposerPrimitive
      className={cn(theme === "elegant" && "md:shadow-raft-lg md:ring-ink-2", className)}
      {...props}
    />
  );
}

export function ComposerInput({ className, ...props }: ComposerInputProps) {
  const theme = useThemeFamily();

  return (
    <ComposerInputPrimitive
      className={cn(
        theme === "elegant" && "md:min-h-20 md:px-4 md:pt-4",
        theme === "brutal" && "md:min-h-10",
        className,
      )}
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
      className={cn(theme === "elegant" && "md:shadow-raft-lg md:ring-ink-2", className)}
      {...props}
    />
  );
}
