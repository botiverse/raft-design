import { forwardRef, useEffect, type HTMLAttributes, type ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import EmptyState from "./EmptyState.tsx";
import SectionEyebrow from "./SectionEyebrow.tsx";

export type NotificationCenterKind = "error" | "warning" | "info" | "success";
export type NotificationCenterViewport = "desktop" | "mobile";
export type NotificationCenterSize = "compact" | "regular" | "large";
export type NotificationCenterActionVariant = "primary" | "secondary";

export interface NotificationCenterAction {
  id?: string;
  label: ReactNode;
  ariaLabel?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: NotificationCenterActionVariant;
}

export interface NotificationCenterEntry {
  id: string;
  kind: NotificationCenterKind;
  title: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  actions?: NotificationCenterAction[];
  read?: boolean;
}

export interface NotificationCenterProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  entries: NotificationCenterEntry[];
  /** Desktop uses a stable fixed-height frame. Mobile grows with content until
   *  its max-height token, then scrolls internally. */
  viewport: NotificationCenterViewport;
  size?: NotificationCenterSize;
  title?: ReactNode;
  countLabel?: ReactNode;
  emptyState?: ReactNode;
  closeOnEscape?: boolean;
  onClose?: () => void;
}

const SIZE_CLASS: Record<NotificationCenterViewport, Record<NotificationCenterSize, string>> = {
  desktop: {
    compact: "h-56",
    regular: "h-72",
    large: "h-96",
  },
  mobile: {
    compact: "max-h-[min(64dvh,224px)]",
    regular: "max-h-[min(72dvh,288px)]",
    large: "max-h-[min(80dvh,384px)]",
  },
};

const WIDTH_CLASS: Record<NotificationCenterViewport, string> = {
  desktop: "w-80",
  mobile: "w-[min(92vw,360px)]",
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

/**
 * Reusable notification-center primitive.
 *
 * Layout contract:
 * - desktop: fixed-height frame, scrollable list body.
 * - mobile: content-height frame capped by a max-height token, then scrollable
 *   list body.
 *
 * The component does not know how notifications are sourced or dismissed; apps
 * provide entries and action handlers. This keeps product aggregation separate
 * from the open-source-ready UI primitive.
 */
const NotificationCenter = forwardRef<HTMLDivElement, NotificationCenterProps>(
  function NotificationCenter(
    {
      entries,
      viewport,
      size = "regular",
      title = "Notifications",
      countLabel,
      emptyState,
      closeOnEscape = true,
      onClose,
      className = "",
      ...props
    },
    ref,
  ) {
    useEffect(() => {
      if (!closeOnEscape || !onClose) return;
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [closeOnEscape, onClose]);

    return (
      <div
        {...props}
        ref={ref}
        role={props.role ?? "dialog"}
        aria-label={props["aria-label"] ?? "Notification center"}
        className={[
          "card-brutal flex flex-col overflow-hidden bg-white",
          WIDTH_CLASS[viewport],
          SIZE_CLASS[viewport][size],
          className,
        ].join(" ")}
      >
        <div className="flex items-center gap-2 border-b-2 border-black bg-brutal-cream px-3 py-2">
          <SectionEyebrow>{title}</SectionEyebrow>
          <span className="ml-auto text-xs font-mono text-black/40">
            {countLabel ?? defaultCountLabel(entries.length)}
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {entries.length === 0 ? (
            (emptyState ?? <NotificationCenterEmptyState />)
          ) : (
            <ul className="divide-y-2 divide-black" aria-label="Notifications">
              {entries.map((entry) => (
                <NotificationCenterItem key={entry.id} entry={entry} />
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  },
);

export default NotificationCenter;

export function NotificationCenterEmptyState({
  title = "No notifications right now",
  body = "You'll see things here that need your attention.",
}: {
  title?: ReactNode;
  body?: ReactNode;
}) {
  return <EmptyState icon={<CheckCircle2 size={36} />} title={title} description={body} />;
}

function NotificationCenterItem({ entry }: { entry: NotificationCenterEntry }) {
  return (
    <li className={`px-3 py-3 ${entry.read ? "opacity-70" : ""}`}>
      <div className="flex items-start gap-2">
        <div
          className={`mt-0.5 flex size-6 shrink-0 items-center justify-center border-2 border-black ${
            KIND_DOT_BG[entry.kind]
          }`}
          aria-label={KIND_LABEL[entry.kind]}
        >
          {entry.icon ?? DEFAULT_KIND_ICON[entry.kind]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-black break-words">{entry.title}</div>
          {entry.body && <div className="mt-0.5 text-sm break-words">{entry.body}</div>}
          {entry.actions && entry.actions.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
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

function NotificationCenterActionButton({ action }: { action: NotificationCenterAction }) {
  const isPrimary = action.variant === "primary";
  return (
    <button
      type="button"
      onClick={action.onClick}
      disabled={action.disabled}
      aria-label={action.ariaLabel}
      className={`btn-brutal px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:opacity-50 ${
        isPrimary ? "bg-brutal-pink" : "bg-white"
      }`}
    >
      {action.label}
    </button>
  );
}

function defaultCountLabel(count: number): ReactNode {
  return count === 0 ? "all clear" : `${count} ${count === 1 ? "item" : "items"}`;
}
