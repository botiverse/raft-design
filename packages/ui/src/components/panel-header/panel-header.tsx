import type { ComponentPropsWithRef, ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import { tv } from "tailwind-variants";
import { Button } from "../button/button.tsx";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Canonical panel column header: mobile back chevron + optional icon + title /
// subtitle + right-aligned actions. The app utilities map to literals:
// `h-panel-header` → `h-[62px]` (48px on short viewports), `size-icon-header` →
// `size-9`.
const panelHeader = tv({
  slots: {
    root: ["flex h-[62px] items-center gap-3 px-5 [@media(max-height:600px)]:h-12"],
    back: "",
    icon: ["size-9 shrink-0 items-center justify-center border-2 border-black"],
    iconSlot: ["shrink-0"],
    titleSlot: ["min-w-0 flex-1"],
    titleBlock: ["min-w-0 flex-1"],
    titleRow: ["flex min-w-0 items-center gap-2"],
    title: ["truncate text-base font-bold leading-tight text-black"],
    titleSuffix: ["shrink-0"],
    subtitle: ["font-mono text-xs text-black/50"],
    actions: ["flex shrink-0 items-center gap-1.5"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-b-2 border-black bg-white"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    mobileBreakpoint: {
      md: {
        back: "md:hidden",
        icon: "hidden md:flex",
        iconSlot: "hidden md:flex",
      },
      lg: {
        back: "lg:hidden",
        icon: "hidden lg:flex",
        iconSlot: "hidden lg:flex",
      },
    },
    iconAlwaysVisible: {
      true: {
        icon: "flex",
        iconSlot: "flex",
      },
      false: {},
    },
    subtitleMultiline: {
      true: {
        subtitle: "",
      },
      false: {
        subtitle: "truncate",
      },
    },
  },
  defaultVariants: {
    mobileBreakpoint: "md",
    iconAlwaysVisible: false,
    subtitleMultiline: false,
  },
});

export type PanelHeaderProps = {
  title?: ReactNode;
  /** Replaces the entire title block (h2 + subtitle) — e.g. a search input. */
  titleSlot?: ReactNode;
  /** Inline node next to the title, outside the truncate envelope (status dot). */
  titleSuffix?: ReactNode;
  subtitle?: ReactNode;
  /** Allow the subtitle to wrap instead of single-line truncation. */
  subtitleMultiline?: boolean;
  /** Icon node rendered inside the bordered icon container (desktop-only). */
  icon?: ReactNode;
  /** ClassName for the icon container background. Defaults to bg-brutal-yellow. */
  iconBg?: string;
  /** Pre-wrapped icon slot — bypasses the bordered iconBg wrapper. */
  iconSlot?: ReactNode;
  /** Keep the icon visible on every viewport (identity surfaces). */
  iconAlwaysVisible?: boolean;
  /** Mobile back-chevron callback. */
  onMobileBack?: () => void;
  /** Breakpoint at which the mobile back chevron hides. Default "md". */
  mobileBreakpoint?: "md" | "lg";
  mobileBackProps?: ComponentPropsWithRef<"button">;
  titleClickProps?: ComponentPropsWithRef<"div">;
  containerProps?: ComponentPropsWithRef<"div">;
  /** Right-aligned action slot. */
  actions?: ReactNode;
};

export function PanelHeader({
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
  const theme = useTheme();
  const { className: containerExtraClass, ...containerRest } = containerProps ?? {};
  const {
    root,
    back,
    icon: iconSlotClass,
    iconSlot: iconSlotSlot,
    titleSlot: titleSlotClass,
    titleBlock,
    titleRow,
    title: titleClass,
    titleSuffix: titleSuffixSlot,
    subtitle: subtitleSlot,
    actions: actionsSlot,
  } = panelHeader({ theme, mobileBreakpoint, iconAlwaysVisible, subtitleMultiline });

  return (
    <div
      {...containerRest}
      data-slot="panel-header"
      className={root({ className: containerExtraClass })}
    >
      {onMobileBack && (
        <Button
          {...mobileBackProps}
          onClick={onMobileBack}
          size="icon-sm"
          className={back({ className: mobileBackProps?.className })}
        >
          <ArrowLeft size={14} />
        </Button>
      )}
      {icon && <div className={iconSlotClass({ className: iconBg })}>{icon}</div>}
      {iconSlot && <div className={iconSlotSlot()}>{iconSlot}</div>}
      {titleSlot ? (
        <div className={titleSlotClass()}>{titleSlot}</div>
      ) : (
        <div {...titleClickProps} className={titleBlock({ className: titleClickProps?.className })}>
          <div className={titleRow()}>
            <h2 className={titleClass()}>{title}</h2>
            {titleSuffix && <div className={titleSuffixSlot()}>{titleSuffix}</div>}
          </div>
          {subtitle && <p className={subtitleSlot()}>{subtitle}</p>}
        </div>
      )}
      {actions && <div className={actionsSlot()}>{actions}</div>}
    </div>
  );
}
