import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../lib/cn";

export default function SurfaceListItem({
  children,
  selected = false,
  interactive = true,
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  selected?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "border-2 px-4 py-3 transition-colors",
        selected
          ? "border-black bg-brutal-cyan/15 shadow-brutal-sm"
          : [
              "border-black/30 bg-white",
              interactive ? "hover:border-black hover:shadow-brutal-sm" : "",
            ].join(" "),
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
