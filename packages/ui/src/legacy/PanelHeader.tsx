import { ArrowLeft } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import Button from "./button.tsx";

type DivPassthroughProps = HTMLAttributes<HTMLDivElement> &
  Record<`data-${string}`, string | undefined>;
type ButtonPassthroughProps = HTMLAttributes<HTMLButtonElement> &
  Record<`data-${string}`, string | undefined>;

export interface PanelHeaderProps {
  title?: ReactNode;
  titleSlot?: ReactNode;
  titleSuffix?: ReactNode;
  subtitle?: ReactNode;
  subtitleMultiline?: boolean;
  icon?: ReactNode;
  iconBg?: string;
  iconSlot?: ReactNode;
  iconAlwaysVisible?: boolean;
  onMobileBack?: () => void;
  mobileBreakpoint?: "md" | "lg";
  mobileBackProps?: ButtonPassthroughProps;
  titleClickProps?: DivPassthroughProps;
  containerProps?: DivPassthroughProps;
  actions?: ReactNode;
}

export default function PanelHeader({
  title,
  titleSlot,
  titleSuffix,
  subtitle,
  subtitleMultiline = false,
  icon,
  iconBg = "bg-brutal-yellow",
  iconSlot,
  iconAlwaysVisible = false,
  onMobileBack,
  mobileBreakpoint = "md",
  mobileBackProps,
  titleClickProps,
  containerProps,
  actions,
}: PanelHeaderProps) {
  const mobileHiddenClass = mobileBreakpoint === "lg" ? "lg:hidden" : "md:hidden";
  const iconVisibilityClass = iconAlwaysVisible
    ? "flex"
    : mobileBreakpoint === "lg"
      ? "hidden lg:flex"
      : "hidden md:flex";
  const { className: containerExtraClass, ...containerRest } = containerProps ?? {};

  return (
    <div
      {...containerRest}
      className={`flex h-panel-header items-center gap-3 border-b-2 border-black bg-white px-5 ${containerExtraClass ?? ""}`}
    >
      {onMobileBack && (
        <Button
          {...mobileBackProps}
          onClick={onMobileBack}
          shape="icon"
          className={`${mobileHiddenClass} ${mobileBackProps?.className ?? ""}`}
        >
          <ArrowLeft size={14} />
        </Button>
      )}
      {icon && (
        <div
          className={`${iconVisibilityClass} size-icon-header shrink-0 items-center justify-center border-2 border-black ${iconBg}`}
        >
          {icon}
        </div>
      )}
      {iconSlot && <div className={`${iconVisibilityClass} shrink-0`}>{iconSlot}</div>}
      {titleSlot ? (
        <div className="min-w-0 flex-1">{titleSlot}</div>
      ) : (
        <div {...titleClickProps} className={`min-w-0 flex-1 ${titleClickProps?.className ?? ""}`}>
          <div className="flex min-w-0 items-center gap-2">
            <h2 className="truncate text-base font-bold leading-tight text-black">{title}</h2>
            {titleSuffix && <div className="shrink-0">{titleSuffix}</div>}
          </div>
          {subtitle && (
            <p className={`font-mono text-xs text-black/50 ${subtitleMultiline ? "" : "truncate"}`}>
              {subtitle}
            </p>
          )}
        </div>
      )}
      {actions && <div className="flex shrink-0 items-center gap-1.5">{actions}</div>}
    </div>
  );
}
