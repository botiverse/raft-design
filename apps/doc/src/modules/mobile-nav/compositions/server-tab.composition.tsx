import { ArrowLeft, Check, Monitor, Plus, Settings, UserPlus, Users } from "lucide-react";
import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  Badge,
  Button,
  ListRow,
  ListRowBody,
  ListRowChevron,
  ListRowDescription,
  ListRowIcon,
  ListRowTitle,
  ListRowValue,
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
  MobileNavServerMenu,
  MobileNavServerMenuContent,
} from "@botiverse/raft-ui/wip";
import { SERVERS, TABS } from "../server-tab.fixtures";

const TOP_RIGHT: AvatarBadgeOffset = ["100%", 0];

export function MobileNavServerTabComposition() {
  const [serverId, setServerId] = useState("hq");
  const [tab, setTab] = useState("activity");
  const [page, setPage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
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
    setPage(event.currentTarget.dataset.page ?? null);
    setOpen(false);
  }, []);
  const handleBack = useCallback(() => setPage(null), []);

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
          <MobileNavServerMenu open={open} onOpenChange={setOpen}>
            <MobileNavServerItem
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
            <MobileNavServerMenuContent aria-label="Servers">
              <div className="min-h-0 flex-1 overflow-y-auto py-1">
                {SERVERS.map((item) => (
                  <ListRow
                    key={item.id}
                    variant="plain"
                    aria-current={item.id === serverId ? "true" : undefined}
                    data-server={item.id}
                    onClick={handleServer}
                  >
                    <Avatar type="server" size="sm">
                      <AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
                    </Avatar>
                    <ListRowBody>
                      <ListRowTitle>{item.name}</ListRowTitle>
                      <ListRowDescription>{item.address}</ListRowDescription>
                    </ListRowBody>
                    {item.id === serverId ? (
                      <ListRowIcon>
                        <Check aria-label="Current server" />
                      </ListRowIcon>
                    ) : item.muted && item.unread ? (
                      <ListRowValue>{item.unread}</ListRowValue>
                    ) : item.unread ? (
                      <Badge variant="accent" role="img" aria-label={`${item.unread} unread`}>
                        {item.unread}
                      </Badge>
                    ) : null}
                  </ListRow>
                ))}
              </div>
              <PopoverSeparator />
              <div className="py-1">
                <Text.Sans size="group" className="px-4 pt-2 pb-1">
                  {server.name}
                </Text.Sans>
                <ListRow variant="plain" data-page="Members" onClick={handlePage}>
                  <ListRowIcon>
                    <Users />
                  </ListRowIcon>
                  <ListRowBody>
                    <ListRowTitle>Members</ListRowTitle>
                  </ListRowBody>
                  <ListRowChevron />
                </ListRow>
                <ListRow variant="plain" data-page="Computers" onClick={handlePage}>
                  <ListRowIcon>
                    <Monitor />
                  </ListRowIcon>
                  <ListRowBody>
                    <ListRowTitle>Computers</ListRowTitle>
                  </ListRowBody>
                  <ListRowChevron />
                </ListRow>
                <ListRow variant="plain" data-page="Settings" onClick={handlePage}>
                  <ListRowIcon>
                    <Settings />
                  </ListRowIcon>
                  <ListRowBody>
                    <ListRowTitle>Settings</ListRowTitle>
                  </ListRowBody>
                  <ListRowChevron />
                </ListRow>
              </div>
              <PopoverSeparator />
              <div className="py-1">
                <ListRow variant="plain" data-page="Switch or Create Server" onClick={handlePage}>
                  <ListRowIcon>
                    <Plus />
                  </ListRowIcon>
                  <ListRowBody>
                    <ListRowTitle>Switch or Create Server</ListRowTitle>
                  </ListRowBody>
                </ListRow>
                <ListRow variant="plain" data-page="Invite Human" onClick={handlePage}>
                  <ListRowIcon>
                    <UserPlus />
                  </ListRowIcon>
                  <ListRowBody>
                    <ListRowTitle>Invite Human</ListRowTitle>
                  </ListRowBody>
                </ListRow>
              </div>
            </MobileNavServerMenuContent>
          </MobileNavServerMenu>
        </MobileNavRoot>
      )}
    </div>
  );
}
