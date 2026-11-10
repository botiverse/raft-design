import { useCallback, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { Check, FileText, Forward, Image as ImageIcon, Link } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
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
  TextLink,
} from "@botiverse/raft-ui";
import {
  SelectionToolbar,
  SelectionToolbarAction,
  SelectionToolbarActions,
  SelectionToolbarClose,
  SelectionToolbarCount,
  SelectionToolbarCountValue,
  SelectionToolbarDock,
  SelectionToolbarMore,
  SelectionToolbarMoreItems,
} from "@botiverse/raft-ui/wip";

import { MESSAGE_FIXTURE_AVATAR_SRC } from "../message-item.fixtures.ts";

const messages = (count: number) => `${count} ${count === 1 ? "message" : "messages"}`;

export function MessageSelectionShowcaseComposition() {
  const [active, setActive] = useState(true);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(["decision"]));
  const [copied, setCopied] = useState<"link" | "markdown" | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);
  const reenterRef = useRef<HTMLButtonElement>(null);
  const count = selected.size;
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
        Select messages
      </TextLink>
    );
  }

  return (
    <div
      ref={setPortalContainer}
      className="relative w-full max-w-3xl pb-20"
      onKeyDown={handleKeyDown}
    >
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

      <SelectionToolbarDock>
        <SelectionToolbar aria-label="Selected message actions">
          <SelectionToolbarCount>
            <SelectionToolbarCountValue>{count}</SelectionToolbarCountValue> selected
          </SelectionToolbarCount>
          <SelectionToolbarActions>
            <SelectionToolbarAction
              icon={<Forward />}
              disabled={count === 0}
              onClick={handleForward}
            >
              Forward
            </SelectionToolbarAction>
            <SelectionToolbarAction
              secondary
              icon={<ImageIcon />}
              disabled={count === 0}
              onClick={handleGenerateImage}
            >
              Generate image
            </SelectionToolbarAction>
            <SelectionToolbarAction
              secondary
              icon={copied === "link" ? <Check /> : <Link />}
              disabled={count === 0}
              onClick={handleCopyLink}
            >
              {copied === "link" ? "Copied" : "Copy link"}
            </SelectionToolbarAction>
            <SelectionToolbarAction
              secondary
              icon={copied === "markdown" ? <Check /> : <FileText />}
              disabled={count === 0}
              onClick={handleCopyMarkdown}
            >
              {copied === "markdown" ? "Copied" : "Copy Markdown"}
            </SelectionToolbarAction>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SelectionToolbarMore aria-label="More selected message actions" />}
              />
              <DropdownMenuContent side="top" align="end" sideOffset={8} portalProps={portalProps}>
                <SelectionToolbarMoreItems />
              </DropdownMenuContent>
            </DropdownMenu>
          </SelectionToolbarActions>
          <SelectionToolbarClose aria-label="Cancel" title="Cancel" onClick={handleCancel} />
        </SelectionToolbar>
      </SelectionToolbarDock>
      <span className="sr-only" role="status">
        {announcement}
      </span>
    </div>
  );
}
