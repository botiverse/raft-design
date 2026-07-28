import type { PreviewControlProps } from "./preview.types.ts";

export function PreviewControl({ children, label, htmlFor }: PreviewControlProps) {
  return (
    <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-2">
      <label htmlFor={htmlFor} className="text-xs font-medium text-foreground-muted">
        {label}
      </label>
      {children}
    </div>
  );
}
