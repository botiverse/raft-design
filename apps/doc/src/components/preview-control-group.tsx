import type { PreviewControlGroupProps } from "./preview.types.ts";

export function PreviewControlGroup({ children, label }: PreviewControlGroupProps) {
  return (
    <div className="grid gap-y-3">
      {label ? (
        <div className="font-mono text-[10px] leading-none font-medium text-foreground-hint uppercase">
          {label}
        </div>
      ) : null}
      {children}
    </div>
  );
}
