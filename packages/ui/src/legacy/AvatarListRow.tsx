import type { HTMLAttributes, ReactNode } from "react";
import SurfaceListItem from "./SurfaceListItem";

export interface AvatarListRowProps {
  avatar: ReactNode;
  name: ReactNode;
  subtitle?: ReactNode;
  rightContent?: ReactNode;
  onClick?: () => void;
  selected?: boolean;
  align?: "start" | "center";
  actionContent?: ReactNode;
  className?: string;
  buttonProps?: HTMLAttributes<HTMLButtonElement> & Record<`data-${string}`, string | undefined>;
}

export default function AvatarListRow({
  avatar,
  name,
  subtitle,
  rightContent,
  onClick,
  selected = false,
  align = "center",
  actionContent,
  className = "",
  buttonProps,
}: AvatarListRowProps) {
  const interactive = onClick !== undefined;
  const itemsAlignClass = align === "start" ? "items-start" : "items-center";
  const textColumn = (
    <div className="min-w-0 flex-1">
      {align === "start" ? (
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate text-sm font-bold text-black">{name}</span>
          {subtitle != null && subtitle !== false && (
            <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-mono text-black/50">
              {subtitle}
            </span>
          )}
        </div>
      ) : (
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2">
          <span className="truncate text-sm font-bold text-black">{name}</span>
          {subtitle != null && subtitle !== false && (
            <span className="text-xs font-mono text-black/50">{subtitle}</span>
          )}
        </div>
      )}
    </div>
  );
  const body = (
    <>
      {avatar}
      {textColumn}
      {rightContent != null && rightContent !== false && (
        <div className="flex shrink-0 self-center items-center gap-1.5">{rightContent}</div>
      )}
    </>
  );
  const hasAction = actionContent != null && actionContent !== false;
  return (
    <SurfaceListItem
      selected={selected}
      interactive={interactive}
      className={`group px-3 py-2 ${className}`}
    >
      <div className={`flex w-full min-w-0 gap-3 ${itemsAlignClass}`}>
        {interactive ? (
          <button
            {...buttonProps}
            type="button"
            onClick={onClick}
            className={`flex min-w-0 flex-1 gap-3 text-left ${itemsAlignClass}`}
          >
            {body}
          </button>
        ) : (
          <div className={`flex min-w-0 flex-1 gap-3 ${itemsAlignClass}`}>{body}</div>
        )}
        {hasAction && (
          <div className="flex shrink-0 self-center items-center gap-1.5">{actionContent}</div>
        )}
      </div>
    </SurfaceListItem>
  );
}
