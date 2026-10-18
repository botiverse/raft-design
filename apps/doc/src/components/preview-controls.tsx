import type { PreviewControlsProps } from "./preview.types.ts";

export function PreviewControls({ children, title = "Controls" }: PreviewControlsProps) {
  return (
    <div className="grid gap-y-4">
      <div className="font-mono text-[10px] leading-none font-medium text-foreground-hint uppercase">
        {title}
      </div>
      <div className="grid gap-5">{children}</div>
    </div>
  );
}
