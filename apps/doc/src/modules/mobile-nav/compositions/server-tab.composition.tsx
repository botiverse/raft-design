import { ArrowLeft, Check, Globe, Monitor, Plus, Settings, UserPlus, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  Badge,
  Button,
  MobileNavItem,
  MobileNavLabel,
  MobileNavRoot,
  PopoverSeparator,
  Status,
  Text,
} from "@botiverse/raft-ui";
import type { AvatarBadgeOffset } from "@botiverse/raft-ui";
import {
  MobileNavServerItem,
  MobileNavServerPopover,
  MobileNavServerPopoverContent,
  MobileNavServerPopoverDestination,
  MobileNavServerPopoverDestinations,
  MobileNavServerPopoverGroup,
  MobileNavServerPopoverList,
  MobileNavServerPopoverRow,
  MobileNavServerPopoverRowBody,
  MobileNavServerPopoverRowDescription,
  MobileNavServerPopoverRowLabel,
} from "@botiverse/raft-ui/wip";
import { SERVERS, TABS } from "../server-tab.fixtures";

const TOP_RIGHT: AvatarBadgeOffset = ["100%", 0];

export function MobileNavServerTabComposition() {
  const [serverId, setServerId] = useState("hq");
  const [tab, setTab] = useState("activity");
  const [page, setPage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [computerAttention, setComputerAttention] = useState(true);
  const serverTab = useRef<HTMLButtonElement>(null);
  const focusServerTab = useRef(false);
  const server = SERVERS.find((item) => item.id === serverId) ?? SERVERS[0];
  const otherUnread = SERVERS.some((item) => item.id !== serverId && item.unread && !item.muted);

  const handleTab = useCallback((event: MouseEvent<HTMLElement>) => {
    setTab(event.currentTarget.dataset.tab ?? "home");
  }, []);
  // Switching keeps the tab: the person goes on with the same task in another server.
  const handleServer = useCallback((event: MouseEvent<HTMLElement>) => {
    setServerId(event.currentTarget.dataset.server ?? "hq");
    setOpen(false);
  }, []);
  const handlePage = useCallback((event: MouseEvent<HTMLElement>) => {
    const next = event.currentTarget.dataset.page ?? null;
    if (next === "Computers") setComputerAttention(false);
    setPage(next);
    setOpen(false);
  }, []);
  // Back returns focus to the tab that opened the popover, not to the page body.
  const handleBack = useCallback(() => {
    focusServerTab.current = true;
    setPage(null);
  }, []);
  useEffect(() => {
    if (page || !focusServerTab.current) return;
    focusServerTab.current = false;
    serverTab.current?.focus();
  }, [page]);

  return (
    <div className="flex h-[720px] w-[390px] max-w-full flex-col overflow-hidden rounded-container border border-line-seam bg-layer-page">
      {/* @docs-source-strip-start */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        {page ? (
          <div className="-ml-2 flex items-center gap-1">
            <Button variant="ghost" size="icon-md" aria-label="Back" onClick={handleBack}>
              <ArrowLeft />
            </Button>
            <Text.Heading level={6}>{page}</Text.Heading>
          </div>
        ) : (
          <Text.Heading level={6}>{TABS.find((item) => item.id === tab)?.label}</Text.Heading>
        )}
        <Text.Sans size="small">{server.name}</Text.Sans>
      </div>
      {/* @docs-source-strip-end */}
      {page ? null : (
        <MobileNavRoot aria-label="Primary">
          {TABS.map((item) => (
            <MobileNavItem
              key={item.id}
              data-tab={item.id}
              selected={tab === item.id}
              onClick={handleTab}
            >
              {item.icon}
              <MobileNavLabel>{item.label}</MobileNavLabel>
            </MobileNavItem>
          ))}
          <MobileNavServerPopover open={open} onOpenChange={setOpen}>
            <MobileNavServerItem
              ref={serverTab}
              aria-label={
                otherUnread ? `${server.name}, another server has unread items` : server.name
              }
            >
              <Avatar type="server" size="xs">
                <AvatarFallback>{server.name.slice(0, 1)}</AvatarFallback>
                {otherUnread ? (
                  <AvatarBadge
                    offset={TOP_RIGHT}
                    render={<Status aria-hidden variant="accent" size="sm" />}
                  />
                ) : null}
              </Avatar>
              <MobileNavLabel>{server.name}</MobileNavLabel>
            </MobileNavServerItem>
            <MobileNavServerPopoverContent aria-label="Servers">
              <MobileNavServerPopoverList>
                {SERVERS.map((item) => (
                  <MobileNavServerPopoverRow
                    key={item.id}
                    aria-current={item.id === serverId ? "true" : undefined}
                    data-server={item.id}
                    onClick={handleServer}
                  >
                    <Avatar type="server" size="xs">
                      <AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <MobileNavServerPopoverRowBody>
                      <MobileNavServerPopoverRowLabel>{item.name}</MobileNavServerPopoverRowLabel>
                      <MobileNavServerPopoverRowDescription>
                        {item.slug}
                      </MobileNavServerPopoverRowDescription>
                    </MobileNavServerPopoverRowBody>
                    {item.id === serverId ? (
                      <Check aria-label="Current server" />
                    ) : item.muted && item.unread ? (
                      <Text.Mono size="meta" render={<span />}>
                        {item.unread}
                      </Text.Mono>
                    ) : item.unread ? (
                      <Badge variant="accent" role="img" aria-label={`${item.unread} unread`}>
                        {item.unread}
                      </Badge>
                    ) : null}
                  </MobileNavServerPopoverRow>
                ))}
              </MobileNavServerPopoverList>
              <PopoverSeparator />
              <MobileNavServerPopoverGroup>
                <MobileNavServerPopoverRow data-page="Join Community" onClick={handlePage}>
                  <Globe />
                  <MobileNavServerPopoverRowLabel>Join Community</MobileNavServerPopoverRowLabel>
                </MobileNavServerPopoverRow>
                <MobileNavServerPopoverRow data-page="Switch or Create Server" onClick={handlePage}>
                  <Plus />
                  <MobileNavServerPopoverRowLabel>
                    Switch or Create Server
                  </MobileNavServerPopoverRowLabel>
                </MobileNavServerPopoverRow>
                <MobileNavServerPopoverRow data-page="Invite Human" onClick={handlePage}>
                  <UserPlus />
                  <MobileNavServerPopoverRowLabel>Invite Human</MobileNavServerPopoverRowLabel>
                </MobileNavServerPopoverRow>
              </MobileNavServerPopoverGroup>
              <PopoverSeparator />
              <MobileNavServerPopoverDestinations aria-label={server.name}>
                <MobileNavServerPopoverDestination data-page="Members" onClick={handlePage}>
                  <Users />
                  <span>Members</span>
                </MobileNavServerPopoverDestination>
                <MobileNavServerPopoverDestination
                  data-page="Computers"
                  aria-label={
                    computerAttention ? "Computers, a computer needs attention" : undefined
                  }
                  onClick={handlePage}
                >
                  <Monitor />
                  <span>Computers</span>
                  {computerAttention ? <Status aria-hidden variant="accent" size="sm" /> : null}
                </MobileNavServerPopoverDestination>
                <MobileNavServerPopoverDestination data-page="Settings" onClick={handlePage}>
                  <Settings />
                  <span>Settings</span>
                </MobileNavServerPopoverDestination>
              </MobileNavServerPopoverDestinations>
            </MobileNavServerPopoverContent>
          </MobileNavServerPopover>
        </MobileNavRoot>
      )}
    </div>
  );
}
