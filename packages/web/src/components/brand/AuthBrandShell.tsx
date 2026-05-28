import type { ReactNode } from "react";
import SlockBrandLockup from "./SlockBrandLockup";

export const AUTH_BRAND_SHELL_CLASS =
  "min-h-0 flex-1 overflow-y-auto bg-white font-display safe-top safe-bottom";

export const AUTH_BRAND_STACK_CLASS =
  "flex min-h-full w-full flex-col";

export const AUTH_BRAND_TOP_BAR_CLASS =
  "flex h-panel-header shrink-0 items-center border-b-2 border-black bg-brutal-yellow px-4";

export const AUTH_BRAND_CONTENT_CLASS =
  "flex min-h-0 flex-1 items-center justify-center px-5 pb-10 pt-10 sm:px-8 sm:pb-14 sm:pt-14";

export function AuthBrandTopBar() {
  return (
    <div className={AUTH_BRAND_TOP_BAR_CLASS}>
      <SlockBrandLockup className="h-5 w-auto" />
    </div>
  );
}

export function AuthBrandIntro({
  title,
  description,
  children,
}: {
  title: string;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="mb-5 text-center">
      <img
        src="/brand/slock-icon.svg"
        alt=""
        className="mx-auto mb-4 size-9"
        aria-hidden="true"
      />
      <h1 className="text-xl font-bold">{title}</h1>
      {description ? (
        <p className="mt-2 text-sm text-black/60">{description}</p>
      ) : null}
      {children}
    </div>
  );
}

export default function AuthBrandShell({
  children,
  maxWidthClass = "max-w-md",
}: {
  children: ReactNode;
  maxWidthClass?: string;
}) {
  return (
    <div className={AUTH_BRAND_SHELL_CLASS}>
      <div className={AUTH_BRAND_STACK_CLASS}>
        <AuthBrandTopBar />
        <div className={AUTH_BRAND_CONTENT_CLASS}>
          <div className={`w-full ${maxWidthClass}`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
