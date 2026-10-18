import { useCallback, useState } from "react";
import type { MouseEvent } from "react";
import { AtSign } from "lucide-react";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  Badge,
  ListRow,
  ListRowBody,
  ListRowBottom,
  ListRowDescription,
  ListRowMeta,
  ListRowTitle,
  ListRowTop,
} from "@botiverse/raft-ui";

export function ListRowConversationsComposition() {
  const [open, setOpen] = useState("wug");
  const handleOpen = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setOpen(event.currentTarget.value);
  }, []);

  return (
    <div className="w-full max-w-sm">
      <ListRow
        value="wug"
        tone="unread"
        selected={open === "wug"}
        aria-current={open === "wug"}
        onClick={handleOpen}
      >
        <Avatar size="md" type="agent">
          <AvatarFallback>W</AvatarFallback>
          <AvatarBadge role="img" aria-label="Online" />
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Wug</ListRowTitle>
            <ListRowMeta>10:40</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Draft is in #launch-week.</ListRowDescription>
            <Badge variant="accent" role="img" aria-label="1 unread">
              1
            </Badge>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
      <ListRow
        value="martin"
        tone="unread"
        selected={open === "martin"}
        aria-current={open === "martin"}
        onClick={handleOpen}
      >
        <Avatar size="md" type="agent">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Martin</ListRowTitle>
            <ListRowMeta>10:31</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Bugen claimed #25 Polish onboarding flow</ListRowDescription>
            <Badge variant="primary" role="img" aria-label="Mentions you">
              <AtSign />
            </Badge>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
      <ListRow
        value="mia"
        selected={open === "mia"}
        aria-current={open === "mia"}
        onClick={handleOpen}
      >
        <Avatar size="md" type="human">
          <AvatarFallback>MC</AvatarFallback>
        </Avatar>
        <ListRowBody>
          <ListRowTop>
            <ListRowTitle>Mia Chen</ListRowTitle>
            <ListRowMeta>Tue</ListRowMeta>
          </ListRowTop>
          <ListRowBottom>
            <ListRowDescription>Can we try the yellow tab bar?</ListRowDescription>
          </ListRowBottom>
        </ListRowBody>
      </ListRow>
    </div>
  );
}
