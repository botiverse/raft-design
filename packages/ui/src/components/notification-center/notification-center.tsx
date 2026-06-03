import { useEffect, type ComponentPropsWithRef, type ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn, tv, type VariantProps } from "tailwind-variants";
import {
  EmptyState,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
} from "../empty-state/empty-state.tsx";
import { SectionEyebrow } from "../section-eyebrow/section-eyebrow.tsx";
import { useTheme } from "../../lib/theme/use-theme.ts";

// Notification-center card. Desktop uses a fixed-height frame; mobile grows to a
// max-height token then scrolls. The source's optional ESC close hook is preserved
// while the visual structure lives in tv slots. `card-brutal` maps to border-2
// border-black bg-white --shadow-hover.
const notificationCenter = tv({
  slots: {
    root: ["flex flex-col overflow-hidden bg-white"],
    header: ["flex items-center gap-2 border-b-2 border-black bg-brutal-cream px-3 py-2"],
    count: ["ml-auto font-mono text-xs text-black/40"],
    scroller: ["min-h-0 flex-1 overflow-y-auto overscroll-contain"],
    list: ["divide-y-2 divide-black"],
    item: ["px-3 py-3"],
    itemInner: ["flex items-start gap-2"],
    kindIcon: ["mt-0.5 flex size-6 shrink-0 items-center justify-center border-2 border-black"],
    itemContent: ["min-w-0 flex-1"],
    itemTitle: ["break-words text-sm font-bold text-black"],
    itemBody: ["mt-0.5 break-words text-sm"],
    itemActions: ["mt-2 flex flex-wrap items-center gap-2"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 border-black shadow-[var(--shadow-hover)]"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    viewport: {
      desktop: {
        root: "w-80",
      },
      mobile: {
        root: "w-[min(92vw,360px)]",
      },
    },
    read: {
      true: {
        item: "opacity-70",
      },
      false: {
        item: "",
      },
    },
  },
});

type NotificationCenterViewport = NonNullable<VariantProps<typeof notificationCenter>["viewport"]>;
type NotificationCenterSize = "compact" | "regular" | "large";
type NotificationCenterKind = "error" | "warning" | "info" | "success";

const SIZE_CLASS: Record<NotificationCenterViewport, Record<NotificationCenterSize, string>> = {
  desktop: { compact: "h-56", regular: "h-72", large: "h-96" },
  mobile: {
    compact: "max-h-[min(64dvh,224px)]",
    regular: "max-h-[min(72dvh,288px)]",
    large: "max-h-[min(80dvh,384px)]",
  },
};

const KIND_DOT_BG: Record<NotificationCenterKind, string> = {
  error: "bg-brutal-orange",
  warning: "bg-brutal-orange",
  info: "bg-brutal-yellow",
  success: "bg-brutal-lime",
};

const KIND_LABEL: Record<NotificationCenterKind, string> = {
  error: "Error",
  warning: "Warning",
  info: "Info",
  success: "Success",
};

const DEFAULT_KIND_ICON: Record<NotificationCenterKind, ReactNode> = {
  error: <AlertTriangle size={16} className="text-black" />,
  warning: <AlertTriangle size={16} className="text-black" />,
  info: <Info size={16} className="text-black" />,
  success: <CheckCircle2 size={16} className="text-black" />,
};

export type NotificationCenterAction = {
  id?: string;
  label: ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

export type NotificationCenterEntry = {
  id: string;
  kind: NotificationCenterKind;
  title: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  actions?: NotificationCenterAction[];
  read?: boolean;
};

export type NotificationCenterProps = Omit<ComponentPropsWithRef<"div">, "title"> & {
  entries: NotificationCenterEntry[];
  viewport: NotificationCenterViewport;
  size?: NotificationCenterSize;
  title?: ReactNode;
  countLabel?: ReactNode;
  emptyState?: ReactNode;
  closeOnEscape?: boolean;
  onClose?: () => void;
};

function defaultCountLabel(count: number): ReactNode {
  return count === 0 ? "all clear" : `${count} ${count === 1 ? "item" : "items"}`;
}

// Faithful reproduction of the original action button's `.btn-brutal` utility (the
// large interaction tier, distinct from the Button component's btn-brutal-sm tier):
// resting shadow-brutal (--shadow-hover, 4px), hover shadow-brutal-lg (--shadow-lg,
// 6px) with a 1px lift, active shadow-brutal-active (--shadow-active, 1px) with a 2px
// press, disabled opacity-50 (the callsite utility beat .btn-brutal:disabled's 40%).
const notificationAction = tv({
  slots: {
    root: ["px-3 py-1.5 font-display text-xs font-bold transition-all duration-100"],
  },
  variants: {
    theme: {
      brutal: {
        root: [
          "border-2 border-black shadow-[var(--shadow-hover)]",
          "hover:-translate-y-px hover:shadow-[var(--shadow-lg)]",
          "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[var(--shadow-active)]",
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        ],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    variant: {
      primary: {
        root: "",
      },
      secondary: {
        root: "",
      },
    },
  },
  compoundVariants: [
    { theme: "brutal", variant: "primary", class: { root: "bg-brutal-pink" } },
    { theme: "brutal", variant: "secondary", class: { root: "bg-white" } },
  ],
  defaultVariants: {
    variant: "secondary",
  },
});

function NotificationCenterActionButton({ action }: { action: NotificationCenterAction }) {
  const theme = useTheme();
  const { root } = notificationAction({
    theme,
    variant: action.variant === "primary" ? "primary" : "secondary",
  });
  return (
    <BaseButton
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      aria-label={action.ariaLabel}
      className={root()}
    >
      {action.label}
    </BaseButton>
  );
}

function NotificationCenterItem({ entry }: { entry: NotificationCenterEntry }) {
  const { item, itemInner, kindIcon, itemContent, itemTitle, itemBody, itemActions } =
    notificationCenter({ read: entry.read ?? false });
  return (
    <li className={item()}>
      <div className={itemInner()}>
        <div
          className={kindIcon({ className: KIND_DOT_BG[entry.kind] })}
          aria-label={KIND_LABEL[entry.kind]}
        >
          {entry.icon ?? DEFAULT_KIND_ICON[entry.kind]}
        </div>
        <div className={itemContent()}>
          <div className={itemTitle()}>{entry.title}</div>
          {entry.body && <div className={itemBody()}>{entry.body}</div>}
          {entry.actions && entry.actions.length > 0 && (
            <div className={itemActions()}>
              {entry.actions.map((action, index) => (
                <NotificationCenterActionButton
                  key={action.id ?? `${entry.id}-action-${index}`}
                  action={action}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function NotificationCenter({
  entries,
  viewport,
  size = "regular",
  title = "Notifications",
  countLabel,
  emptyState,
  closeOnEscape = true,
  onClose,
  className,
  role = "dialog",
  ...props
}: NotificationCenterProps) {
  const theme = useTheme();
  const { root, header, count, scroller, list } = notificationCenter({ theme, viewport });

  useEffect(() => {
    if (!closeOnEscape || !onClose) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeOnEscape, onClose]);

  return (
    <div
      {...props}
      role={role}
      aria-label={props["aria-label"] ?? "Notification center"}
      data-slot="notification-center"
      className={root({ className: cn(SIZE_CLASS[viewport][size], className) })}
    >
      <div className={header()}>
        <SectionEyebrow>{title}</SectionEyebrow>
        <span className={count()}>{countLabel ?? defaultCountLabel(entries.length)}</span>
      </div>
      <div className={scroller()}>
        {entries.length === 0 ? (
          (emptyState ?? (
            <EmptyState>
              <EmptyStateIcon>
                <CheckCircle2 size={36} />
              </EmptyStateIcon>
              <EmptyStateTitle>No notifications right now</EmptyStateTitle>
              <EmptyStateDescription>
                You'll see things here that need your attention.
              </EmptyStateDescription>
            </EmptyState>
          ))
        ) : (
          <ul className={list()} aria-label="Notifications">
            {entries.map((entry) => (
              <NotificationCenterItem key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
