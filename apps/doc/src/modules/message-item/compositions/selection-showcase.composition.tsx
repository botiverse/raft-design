import { useCallback, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import {
  Check,
  Copy,
  Forward,
  Image as ImageIcon,
  ListChecks,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MessageItem,
  MessageItemAvatarSlot,
  MessageItemBody,
  MessageItemContent,
  MessageItemHeader,
  MessageItemSender,
  MessageItemTime,
  MessageMultiSelect,
  MessageMultiSelectCheckbox,
  MessageMultiSelectToolbar,
  MessageMultiSelectToolbarActions,
  TextLink,
} from "@botiverse/raft-ui";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";
import { moveFocusInToolbar, useSelectionToolbarFit } from "../selection-toolbar-fit.ts";

const messages = (count: number) => `${count} ${count === 1 ? "message" : "messages"}`;

export function MessageSelectionShowcaseComposition() {
  const [active, setActive] = useState(true);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(["decision"]));
  const [copied, setCopied] = useState<"link" | "markdown" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const reenterRef = useRef<HTMLButtonElement>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const count = selected.size;
  // One row at any width: Copy Link shows its label only when it fits,
  // otherwise only its icon; if there is still no room it moves into More.
  const fit = useSelectionToolbarFit(
    { area: areaRef, toolbar: toolbarRef, actions: actionsRef },
    `${count}|${copied ?? ""}`,
  );
  const portalProps = useMemo(
    () => (portalContainer ? { container: portalContainer } : undefined),
    [portalContainer],
  );

  const setChecked = useCallback((id: string, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);
  const handleDecisionChange = useCallback(
    (checked: boolean) => setChecked("decision", checked),
    [setChecked],
  );
  const handleReplyChange = useCallback(
    (checked: boolean) => setChecked("reply", checked),
    [setChecked],
  );
  const handleSelectAll = useCallback(() => setSelected(new Set(["decision", "reply"])), []);
  const showCopied = useCallback((what: "link" | "markdown") => {
    setCopied(what);
    window.setTimeout(() => setCopied(null), 1500);
  }, []);
  const handleCopyLink = useCallback(() => showCopied("link"), [showCopied]);
  const handleCopyMarkdown = useCallback(() => showCopied("markdown"), [showCopied]);
  const handleForward = useCallback(
    () => setAnnouncement(`Forwarding ${messages(count)}`),
    [count],
  );
  const handleGenerateImage = useCallback(
    () => setAnnouncement(`Generating an image of ${messages(count)}`),
    [count],
  );
  const handleCancel = useCallback(() => {
    setActive(false);
    setSelected(new Set());
    setAnnouncement("");
    // The toolbar is gone: focus moves to what took its place, not the page.
    requestAnimationFrame(() => reenterRef.current?.focus());
  }, []);
  // Escape ends the selection, as × does; inside the More menu it only closes the menu.
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      if (event.target instanceof Element && event.target.closest('[role="menu"]')) return;
      event.preventDefault();
      handleCancel();
    },
    [handleCancel],
  );
  const handleReenter = useCallback(() => {
    setActive(true);
    setSelected(new Set(["decision"]));
  }, []);

  if (!active) {
    return (
      <TextLink ref={reenterRef} className="text-footnote" onClick={handleReenter}>
        Select Messages
      </TextLink>
    );
  }

  return (
    <div ref={setPortalContainer} className="grid w-full max-w-3xl gap-6" onKeyDown={handleKeyDown}>
      <MessageMultiSelect>
        <MessageItem>
          <MessageMultiSelectCheckbox
            aria-label="Select message from Maya Chen"
            checked={selected.has("decision")}
            value="decision"
            onCheckedChange={handleDecisionChange}
          />
          <MessageItemAvatarSlot>
            <Avatar size="md" type="human">
              <AvatarFallback>MC</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Maya Chen</MessageItemSender>
              <MessageItemTime>10:04 AM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>
              Decision from yesterday's review: we keep the skip link on every step.
            </MessageItemBody>
          </MessageItemContent>
        </MessageItem>
        <MessageItem>
          <MessageMultiSelectCheckbox
            aria-label="Select message from Remy"
            checked={selected.has("reply")}
            value="reply"
            onCheckedChange={handleReplyChange}
          />
          <MessageItemAvatarSlot>
            <Avatar size="md" type="agent">
              <AvatarImage src={MESSAGE_FIXTURE_AVATAR_SRC} alt="" />
              <AvatarFallback>RE</AvatarFallback>
            </Avatar>
          </MessageItemAvatarSlot>
          <MessageItemContent>
            <MessageItemHeader>
              <MessageItemSender>Remy</MessageItemSender>
              <MessageItemTime>10:09 AM</MessageItemTime>
            </MessageItemHeader>
            <MessageItemBody>Agreed. The copy for step 2 should say "server".</MessageItemBody>
          </MessageItemContent>
        </MessageItem>
      </MessageMultiSelect>

      <div ref={areaRef} className="flex min-w-0 justify-center">
        <MessageMultiSelectToolbar
          ref={toolbarRef}
          role="toolbar"
          aria-label="Selected message actions"
          onKeyDown={moveFocusInToolbar}
          className="min-w-0 max-w-full flex-nowrap"
        >
          <span
            aria-live="polite"
            aria-atomic="true"
            className="shrink-0 whitespace-nowrap text-control font-bold tabular-nums text-foreground"
          >
            {count} selected
          </span>
          <MessageMultiSelectToolbarActions ref={actionsRef} className="flex-none flex-nowrap">
            {fit.copyLink === "more" ? null : (
              <Button
                variant="ghost"
                size={fit.copyLink === "icon" ? "icon-md" : "md"}
                aria-label="Copy Link"
                title={copied === "link" ? "Copied" : "Copy Link"}
                disabled={count === 0}
                onClick={handleCopyLink}
              >
                {copied === "link" ? <Check /> : <Copy />}
                {fit.copyLink === "icon" ? null : (
                  <span>{copied === "link" ? "Copied" : "Copy Link"}</span>
                )}
              </Button>
            )}
            <Button
              variant="primary"
              size={fit.forwardIconOnly ? "icon-md" : "md"}
              aria-label="Forward"
              title="Forward"
              disabled={count === 0}
              onClick={handleForward}
            >
              <Forward />
              {fit.forwardIconOnly ? null : <span>Forward</span>}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-md"
                    aria-label="More selected message actions"
                    title="More"
                  >
                    <MoreHorizontal />
                  </Button>
                }
              />
              <DropdownMenuContent side="top" align="end" sideOffset={8} portalProps={portalProps}>
                <DropdownMenuItem onClick={handleSelectAll}>
                  <ListChecks size={14} />
                  Select All
                </DropdownMenuItem>
                {fit.copyLink === "more" ? (
                  <DropdownMenuItem disabled={count === 0} onClick={handleCopyLink}>
                    {copied === "link" ? <Check size={14} /> : <Copy size={14} />}
                    {copied === "link" ? "Copied" : "Copy Link"}
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem disabled={count === 0} onClick={handleGenerateImage}>
                  <ImageIcon size={14} />
                  Generate Image
                </DropdownMenuItem>
                <DropdownMenuItem disabled={count === 0} onClick={handleCopyMarkdown}>
                  {copied === "markdown" ? <Check size={14} /> : <Copy size={14} />}
                  {copied === "markdown" ? "Copied MD" : "Copy MD"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="icon-md"
              aria-label="Cancel"
              title="Cancel"
              onClick={handleCancel}
            >
              <X />
            </Button>
          </MessageMultiSelectToolbarActions>
        </MessageMultiSelectToolbar>
      </div>
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
