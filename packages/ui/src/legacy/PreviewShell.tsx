import type { ReactNode } from "react";

export const PREVIEW_SHELL_BORDER = "border border-black/15 hover:border-black/30";

export const PREVIEW_SHELL_SKIN = `${PREVIEW_SHELL_BORDER} bg-white hover:bg-black/5`;

export const PREVIEW_SHELL_SKIN_MUTED =
  "border-2 border-black/30 bg-black/5 italic text-black/40 hover:shadow-brutal-sm";

export type PreviewShellVariant = "default" | "muted";

export interface PreviewShellProps {
  variant?: PreviewShellVariant;
  onClick?: () => void;
  className?: string;
  "data-testid"?: string;
  title?: string;
  "aria-busy"?: "true" | "false";
  children: ReactNode;
}

export default function PreviewShell({
  variant = "default",
  onClick,
  className,
  children,
  ...rest
}: PreviewShellProps) {
  const Root = onClick ? "button" : "div";
  const skin = variant === "muted" ? PREVIEW_SHELL_SKIN_MUTED : PREVIEW_SHELL_SKIN;
  return (
    <Root
      {...(onClick ? { type: "button" as const, onClick } : {})}
      {...rest}
      className={`${skin}${className ? ` ${className}` : ""}`}
    >
      {children}
    </Root>
  );
}
