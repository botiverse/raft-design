import type { ReactNode } from "react";
import { PreviewThemeScope, type PreviewMode } from "./preview-theme.tsx";
import type { Theme } from "raft-ui";

type ComponentDemoFrameProps = {
  children: ReactNode;
  footer?: ReactNode;
  layout?: "stack" | "split";
  previewClassName?: string;
  previewInset?: "default" | "flush";
  footerClassName?: string;
  footerInset?: "default" | "flush";
  previewTheme?: Theme;
  previewMode?: PreviewMode;
};

export function ComponentDemoFrame({
  children,
  footer,
  layout = "stack",
  previewClassName = "",
  previewInset = "default",
  footerClassName = "",
  footerInset = "default",
  previewTheme,
  previewMode,
}: ComponentDemoFrameProps) {
  const previewInsetClass =
    previewInset === "flush" ? "items-stretch gap-0 p-0" : "items-center gap-4 px-6 py-4";
  const footerInsetClass = footerInset === "flush" ? "p-0" : "px-8 py-8";
  const frameClass =
    "min-w-0 overflow-clip rounded-lg bg-white shadow-[0_1px_1px_-0.5px_oklch(0_0_0_/_0.03),0_2px_5px_-2px_oklch(0_0_0_/_0.04),0_8px_18px_-10px_oklch(0_0_0_/_0.06),0_0_0_0.5px_oklch(0_0_0_/_0.20)]";

  if (layout === "split") {
    return (
      <div data-component-demo-frame className="relative min-w-0">
        <div className={`grid md:grid-cols-[minmax(0,1fr)_20rem] ${frameClass}`}>
          <PreviewThemeScope
            family={previewTheme}
            mode={previewMode}
            className="bg-white text-foreground"
          >
            <div
              className={`flex min-h-84 w-full flex-wrap justify-center ${previewInsetClass} ${previewClassName}`}
            >
              {children}
            </div>
          </PreviewThemeScope>
          {footer == null ? null : (
            <div
              className={`border-t border-[oklch(0_0_0_/_0.10)] bg-[oklch(0.988_0.002_106.42)] md:border-t-0 md:border-l ${footerInsetClass} ${footerClassName}`}
            >
              {footer}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div data-component-demo-frame className="relative min-w-0">
      <div className={frameClass}>
        <PreviewThemeScope
          family={previewTheme}
          mode={previewMode}
          className="bg-white text-foreground"
        >
          <div
            className={`flex min-h-84 w-full flex-wrap justify-center ${previewInsetClass} ${previewClassName}`}
          >
            {children}
          </div>
        </PreviewThemeScope>
        {footer == null ? null : (
          <div
            className={`border-t border-[oklch(0_0_0_/_0.10)] bg-white ${footerInsetClass} ${footerClassName}`}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
