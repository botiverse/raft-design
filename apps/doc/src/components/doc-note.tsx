import type { ComponentPropsWithoutRef } from "react";

type DocNoteProps = ComponentPropsWithoutRef<"p">;

export function DocNote({ className, ...props }: DocNoteProps) {
  return (
    <p
      className={["max-w-2xl text-sm leading-6 text-foreground-muted", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
