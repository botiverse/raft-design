import { useEffect, useRef, type ComponentPropsWithRef, type ReactNode } from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Check, Plus } from "lucide-react";
import { tv } from "../lib/tv";
import { useThemeFamily } from "../lib/theme/use-theme";

// "Switch server" dropdown content: joined servers + join-community actions + a
// "switch or create" action. App-domain data and navigation stay caller-owned,
// but the source menu's UI primitive contract (open gate, outside click, ESC,
// current unread hiding) is preserved here. `card-brutal` maps to border-2
// border-black bg-white --shadow-hover.
const serverSwitcherMenu = tv({
  slots: {
    root: ["z-50 flex flex-col overflow-hidden"],
    scroller: ["min-h-0 flex-1 overflow-y-auto overscroll-contain"],
    serverRow: [
      "flex w-full items-center gap-2 px-3 py-2 [@media(max-height:600px)]:py-1",
      "text-sm transition-colors",
    ],
    check: ["shrink-0"],
    serverText: ["min-w-0 flex-1 text-left"],
    serverName: ["truncate"],
    serverSlug: ["truncate font-mono text-xs text-black/40"],
    unread: [
      "ml-auto shrink-0 rounded border border-black bg-brutal-pink px-1.5 py-0.5",
      "text-[10px] font-bold leading-none text-white",
    ],
    actionRow: [
      "flex w-full items-center justify-start gap-2 px-3 py-2 [@media(max-height:600px)]:py-1",
      "text-left text-sm transition-colors",
    ],
    actionLabel: ["min-w-0 flex-1 text-left"],
  },
  variants: {
    theme: {
      brutal: {
        root: ["border-2 border-black bg-white shadow-brutal"],
        serverRow: ["font-medium text-black hover:bg-brutal-yellow"],
        actionRow: ["font-bold text-black hover:bg-brutal-pink"],
      },
      // Elegant styling is deferred; see the component TODO.
      elegant: {},
    },
    current: {
      true: {
        serverRow: "font-bold",
        check: "opacity-100",
      },
      false: {
        serverRow: "",
        check: "opacity-0",
      },
    },
  },
  defaultVariants: {
    current: false,
  },
});

export type ServerSwitcherServer = {
  id: string;
  name: ReactNode;
  slug: string;
};

export type ServerSwitcherJoinOption = {
  slug: string;
  label: ReactNode;
};

export type ServerSwitcherMenuProps = Omit<ComponentPropsWithRef<"div">, "children"> & {
  /** Matches the source menu's open gate. Omit to render as plain composed content. */
  open?: boolean;
  /** Called by outside click, ESC, server select, and switch/create. */
  onClose?: () => void;
  servers: ServerSwitcherServer[];
  currentServerId?: string;
  /** Unread counts keyed by server id. The current server hides its own count. */
  serverUnreadCounts?: Record<string, number>;
  onSelectServer: (server: ServerSwitcherServer) => void;
  /** Community join actions, rendered above "Switch or create server". */
  joinOptions?: ServerSwitcherJoinOption[];
  onJoinCommunity?: (slug: string) => void;
  onSwitchOrCreate?: () => void;
  testId?: string;
};

export function ServerSwitcherMenu({
  servers,
  currentServerId,
  serverUnreadCounts = {},
  onSelectServer,
  joinOptions = [],
  onJoinCommunity,
  onSwitchOrCreate,
  open = true,
  onClose,
  className,
  testId = "server-switcher-menu",
  onMouseDown,
  ...props
}: ServerSwitcherMenuProps) {
  const theme = useThemeFamily();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const onCloseRef = useRef(onClose);
  const { root, scroller, actionRow, actionLabel } = serverSwitcherMenu({ theme });

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !onClose) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      onCloseRef.current?.();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current?.();
    };
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      {...props}
      ref={menuRef}
      data-slot="server-switcher-menu"
      data-testid={testId}
      className={root({ className })}
      onMouseDown={(event) => {
        onMouseDown?.(event);
        event.stopPropagation();
      }}
    >
      <div className={scroller()}>
        {servers.map((server) => {
          const isCurrent = server.id === currentServerId;
          const unread = serverUnreadCounts[server.id] || 0;
          const {
            serverRow: serverRowSlot,
            check,
            serverText,
            serverName,
            serverSlug,
            unread: unreadSlot,
          } = serverSwitcherMenu({ theme, current: isCurrent });
          return (
            <BaseButton
              key={server.id}
              type="button"
              onClick={() => {
                onSelectServer(server);
                onClose?.();
              }}
              className={serverRowSlot()}
            >
              <Check size={14} className={check()} />
              <div className={serverText()}>
                <div className={serverName()}>{server.name}</div>
                <div className={serverSlug()}>/{server.slug}</div>
              </div>
              {!isCurrent && unread > 0 && <span className={unreadSlot()}>{unread}</span>}
            </BaseButton>
          );
        })}
      </div>

      <div className="border-t-2 border-black" />

      {joinOptions.map((option) => (
        <BaseButton
          key={option.slug}
          type="button"
          onClick={() => onJoinCommunity?.(option.slug)}
          className={actionRow()}
        >
          <Plus size={14} />
          <span className={actionLabel()}>{option.label}</span>
        </BaseButton>
      ))}

      <BaseButton
        type="button"
        onClick={() => {
          onClose?.();
          onSwitchOrCreate?.();
        }}
        className={actionRow()}
      >
        <Plus size={14} />
        <span className={actionLabel()}>Switch or Create Server</span>
      </BaseButton>
    </div>
  );
}
