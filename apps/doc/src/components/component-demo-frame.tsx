import type { ReactNode } from "react";
import { PreviewThemeScope } from "./preview-theme.tsx";
import { ThemeSwitcher } from "./theme-switcher.tsx";

type ComponentDemoFrameProps = {
  children: ReactNode;
  footer: ReactNode;
  layout?: "stack" | "split";
  previewClassName?: string;
  footerClassName?: string;
  footerInset?: "default" | "flush";
  footerTone?: "chrome" | "white";
};

export function ComponentDemoFrame({
  children,
  footer,
  layout = "stack",
  previewClassName = "",
  footerClassName = "",
  footerInset = "default",
  footerTone = "chrome",
}: ComponentDemoFrameProps) {
  const footerInsetClass = footerInset === "flush" ? "px-8 py-0" : "px-8 py-8";
  const footerToneClass = footerTone === "white" ? "bg-white" : "bg-[oklch(0.986_0_0)]";
  const frameClass =
    "overflow-clip rounded-lg bg-[oklch(0.991_0_0)] shadow-[0_1px_1px_-0.5px_oklch(0_0_0_/_0.03),0_2px_5px_-2px_oklch(0_0_0_/_0.04),0_8px_18px_-10px_oklch(0_0_0_/_0.06),0_0_0_0.5px_oklch(0_0_0_/_0.20)]";

  if (layout === "split") {
    return (
      <div className="relative">
        <div className="mb-2 flex justify-end px-2 sm:absolute sm:right-0 sm:-top-11 sm:mb-0">
          <ThemeSwitcher />
        </div>
        <div className={`grid md:grid-cols-[minmax(0,1fr)_20rem] ${frameClass}`}>
          <PreviewThemeScope className="bg-background text-foreground">
            <div
              className={`flex min-h-84 w-full flex-wrap items-center justify-center gap-4 px-6 py-4 ${previewClassName}`}
            >
              {children}
            </div>
          </PreviewThemeScope>
          <div
            className={`border-t border-[oklch(0_0_0_/_0.10)] md:border-t-0 md:border-l ${footerToneClass} ${footerInsetClass} ${footerClassName}`}
          >
            {footer}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="mb-2 flex justify-end px-2 sm:absolute sm:right-0 sm:-top-11 sm:mb-0">
        <ThemeSwitcher />
      </div>
      <div className={frameClass}>
        <PreviewThemeScope className="bg-background text-foreground">
          <div
            className={`flex min-h-84 w-full flex-wrap items-center justify-center gap-4 px-6 py-4 ${previewClassName}`}
          >
            {children}
          </div>
        </PreviewThemeScope>
        <div
          className={`border-t border-[oklch(0_0_0_/_0.10)] ${footerToneClass} ${footerInsetClass} ${footerClassName}`}
        >
          {footer}
        </div>
      </div>
    </div>
  );
}
