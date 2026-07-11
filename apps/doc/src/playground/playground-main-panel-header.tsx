import {
  Bell,
  BellOff,
  GitBranch,
  Hash,
  Lock,
  Search,
  Settings,
  Square,
  Users,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Field,
  FieldLabel,
  Input,
  Status,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "raft-ui";
import {
  ChatMainPanelActions,
  ChatMainPanelHeader,
  ChatMainPanelHeaderIcon,
  ChatMainPanelMutedBadge,
  ChatMainPanelSubtitle,
  ChatMainPanelTitle,
  ChatMainPanelTitleBlock,
  ChatMainPanelTitleRow,
  PanelIconButton,
  PanelIconButtonCount,
  PanelToggleButton,
} from "raft-ui/wip";
import { useState } from "react";

import {
  getPlaygroundDmActor,
  getPlaygroundMembers,
  type PlaygroundChannel,
  type PlaygroundDirectMessage,
  type PlaygroundRoomChannel,
} from "./mock/index.ts";

type ChannelDialog = "edit" | "participants" | "search" | null;

function ChannelDialogContent({
  channel,
  dialog,
  onSave,
}: {
  channel: PlaygroundRoomChannel;
  dialog: Exclude<ChannelDialog, null>;
  onSave: () => void;
}) {
  if (dialog === "search") {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Search #{channel.name}</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-3">
          <DialogDescription>Search messages and files in this channel.</DialogDescription>
          <Field>
            <FieldLabel htmlFor={`channel-search-${channel.id}`}>Search</FieldLabel>
            <Input
              id={`channel-search-${channel.id}`}
              autoFocus
              placeholder="Search this channel"
            />
          </Field>
        </DialogBody>
      </DialogContent>
    );
  }

  if (dialog === "participants") {
    const members = getPlaygroundMembers(channel);

    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Members ({channel.memberCount})</DialogTitle>
          <DialogClose />
        </DialogHeader>
        <DialogBody className="grid gap-2">
          {members.map((member) => (
            <div key={member.id} className="flex min-w-0 items-center gap-3 py-1">
              <Avatar size="sm" type={member.type}>
                {member.avatarSrc ? <AvatarImage src={member.avatarSrc} alt="" /> : null}
                <AvatarFallback>{member.fallback}</AvatarFallback>
              </Avatar>
              <span className="min-w-0 truncate font-medium">{member.name}</span>
            </div>
          ))}
          {channel.memberCount > members.length ? (
            <p className="text-foreground-muted text-sm">
              And {channel.memberCount - members.length} more members
            </p>
          ) : null}
        </DialogBody>
      </DialogContent>
    );
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit channel</DialogTitle>
        <DialogClose />
      </DialogHeader>
      <DialogBody className="grid gap-3">
        <DialogDescription>Update channel details for the workspace.</DialogDescription>
        <Field>
          <FieldLabel htmlFor={`channel-name-${channel.id}`}>Name</FieldLabel>
          <Input id={`channel-name-${channel.id}`} defaultValue={channel.name} />
        </Field>
        <Field>
          <FieldLabel htmlFor={`channel-description-${channel.id}`}>Description</FieldLabel>
          <Input id={`channel-description-${channel.id}`} defaultValue={channel.subtitle} />
        </Field>
      </DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
        <DialogClose render={<Button variant="accent" onClick={onSave} />}>Save</DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}

function ChannelHeader({ channel }: { channel: PlaygroundRoomChannel }) {
  const Icon = channel.kind === "joint" ? GitBranch : channel.kind === "private" ? Lock : Hash;
  const [isMuted, setIsMuted] = useState(channel.navigation.muted);
  const [dialog, setDialog] = useState<ChannelDialog>(null);
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  return (
    <>
      <ChatMainPanelHeader>
        <ChatMainPanelHeaderIcon>
          <Icon />
        </ChatMainPanelHeaderIcon>
        <ChatMainPanelTitleBlock>
          <ChatMainPanelTitleRow>
            <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
            {isMuted ? (
              <ChatMainPanelMutedBadge title="Activity muted. Direct mentions can still notify you.">
                <BellOff />
                Muted
              </ChatMainPanelMutedBadge>
            ) : null}
          </ChatMainPanelTitleRow>
          <ChatMainPanelSubtitle>{channel.subtitle}</ChatMainPanelSubtitle>
        </ChatMainPanelTitleBlock>
        <TooltipProvider delay={650}>
          <ChatMainPanelActions>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PanelIconButton
                    aria-label="Search this channel"
                    onClick={() => setDialog("search")}
                  />
                }
              >
                <Search />
              </TooltipTrigger>
              <TooltipContent side="bottom">Search this channel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PanelToggleButton
                    pressed={isMuted}
                    onPressedChange={setIsMuted}
                    aria-label={
                      isMuted
                        ? "Unmute activity for this channel"
                        : "Mute activity for this channel"
                    }
                  />
                }
              >
                {isMuted ? <BellOff /> : <Bell />}
              </TooltipTrigger>
              <TooltipContent side="bottom">
                {isMuted ? "Unmute activity for this channel" : "Mute activity for this channel"}
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PanelIconButton
                    aria-label="Stop all agents in this channel"
                    onClick={() => setStopDialogOpen(true)}
                  />
                }
              >
                <Square />
              </TooltipTrigger>
              <TooltipContent side="bottom">Stop all agents in this channel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PanelIconButton aria-label="Edit channel" onClick={() => setDialog("edit")} />
                }
              >
                <Settings />
              </TooltipTrigger>
              <TooltipContent side="bottom">Edit channel</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger
                render={
                  <PanelIconButton
                    aria-label="View participants"
                    layout="label"
                    onClick={() => setDialog("participants")}
                  />
                }
              >
                <Users />
                <PanelIconButtonCount>{channel.memberCount}</PanelIconButtonCount>
              </TooltipTrigger>
              <TooltipContent side="bottom">View participants</TooltipContent>
            </Tooltip>
          </ChatMainPanelActions>
        </TooltipProvider>
      </ChatMainPanelHeader>

      <Dialog open={dialog !== null} onOpenChange={(open) => !open && setDialog(null)}>
        {dialog ? (
          <ChannelDialogContent
            channel={channel}
            dialog={dialog}
            onSave={() => setAnnouncement("Channel details saved")}
          />
        ) : null}
      </Dialog>

      <AlertDialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Stop all agents?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogBody>
            This stops every active agent run in #{channel.name}. You can start new runs afterward.
          </AlertDialogBody>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="danger"
              onClick={() => setAnnouncement(`All agent runs stopped in ${channel.name}`)}
            >
              Stop all agents
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}

function DmHeader({ channel }: { channel: PlaygroundDirectMessage }) {
  const actor = getPlaygroundDmActor(channel);
  const [isMuted, setIsMuted] = useState(channel.navigation.muted);
  const presenceVariant =
    actor.presence === "online" || actor.presence === "working"
      ? "success"
      : actor.presence === "idle"
        ? "warning"
        : "default";

  return (
    <ChatMainPanelHeader>
      <Avatar size="md" type={actor.type}>
        {actor.avatarSrc ? <AvatarImage src={actor.avatarSrc} alt="" /> : null}
        <AvatarFallback>{actor.fallback}</AvatarFallback>
      </Avatar>
      <ChatMainPanelTitleBlock>
        <ChatMainPanelTitleRow>
          <ChatMainPanelTitle>{channel.name}</ChatMainPanelTitle>
          {actor.presence ? (
            <Status
              aria-hidden
              size="md"
              variant={presenceVariant}
              pulse={actor.presence === "working"}
            />
          ) : null}
          <ChatMainPanelSubtitle size="md">{channel.subtitle}</ChatMainPanelSubtitle>
        </ChatMainPanelTitleRow>
      </ChatMainPanelTitleBlock>
      <TooltipProvider delay={650}>
        <ChatMainPanelActions>
          <Tooltip>
            <TooltipTrigger
              render={
                <PanelToggleButton
                  aria-label={isMuted ? "Unmute activity for this DM" : "Mute activity for this DM"}
                  pressed={isMuted}
                  onPressedChange={setIsMuted}
                />
              }
            >
              {isMuted ? <BellOff /> : <Bell />}
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {isMuted ? "Unmute activity for this DM" : "Mute activity for this DM"}
            </TooltipContent>
          </Tooltip>
        </ChatMainPanelActions>
      </TooltipProvider>
    </ChatMainPanelHeader>
  );
}

export function PlaygroundMainPanelHeader({ channel }: { channel: PlaygroundChannel }) {
  return channel.kind === "dm" ? (
    <DmHeader key={channel.id} channel={channel} />
  ) : (
    <ChannelHeader key={channel.id} channel={channel} />
  );
}
