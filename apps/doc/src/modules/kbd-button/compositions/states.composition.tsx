import { Text } from "@botiverse/raft-ui";
import { useCallback, useState } from "react";
import {
  KbdButton,
  KbdButtonCaret,
  KbdButtonPlaceholder,
  KbdShortcut,
} from "@botiverse/raft-ui/wip";
import type { KbdKeyName } from "@botiverse/raft-ui/wip";

const SIDEBAR: KbdKeyName[] = ["mod", "\\"];
const HELD: KbdKeyName[] = ["mod", "shift"];
const NEW_TAB: KbdKeyName[] = ["mod", "t"];
const ASSISTANT: KbdKeyName[] = ["mod", "shift", "."];
const FIND: KbdKeyName[] = ["mod", "f"];

export function KbdButtonStatesContent() {
  // Each row starts in the state it shows; a click toggles it, as Esc would.
  const [sidebar, setSidebar] = useState(false);
  const [assistant, setAssistant] = useState(true);
  const [search, setSearch] = useState(true);
  const [find, setFind] = useState(true);
  const toggleSidebar = useCallback(() => setSidebar((on) => !on), []);
  const toggleAssistant = useCallback(() => setAssistant((on) => !on), []);
  const toggleSearch = useCallback(() => setSearch((on) => !on), []);
  const toggleFind = useCallback(() => setFind((on) => !on), []);
  return (
    <div className="flex w-full max-w-md flex-col gap-4">
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div className="min-w-0">
          <Text.Sans>Collapse or expand the sidebar</Text.Sans>
          <Text.Sans size="small">In a wide window</Text.Sans>
        </div>
        <KbdButton
          recording={sidebar}
          onClick={toggleSidebar}
          aria-label="Change the shortcut for Collapse or expand the sidebar"
          aria-keyshortcuts={"Meta+\\"}
        >
          {sidebar ? (
            <>
              <KbdButtonPlaceholder>Press a shortcut</KbdButtonPlaceholder>
              <KbdButtonCaret />
            </>
          ) : (
            <KbdShortcut keys={SIDEBAR} size="md" platform="mac" />
          )}
        </KbdButton>
      </div>
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div className="min-w-0">
          <Text.Sans>Hide or show your assistant</Text.Sans>
          <Text.Sans size="small" id="assistant-hint">
            {assistant
              ? "Press the new shortcut, Esc to cancel"
              : "Your assistant, when you're not typing"}
          </Text.Sans>
        </div>
        <KbdButton
          recording={assistant}
          onClick={toggleAssistant}
          aria-label="Change the shortcut for Hide or show your assistant"
          aria-keyshortcuts="Meta+Shift+."
          aria-describedby="assistant-hint"
        >
          {assistant ? (
            <>
              <KbdButtonPlaceholder>Press a shortcut</KbdButtonPlaceholder>
              <KbdButtonCaret />
            </>
          ) : (
            <KbdShortcut keys={ASSISTANT} size="md" platform="mac" />
          )}
        </KbdButton>
      </div>
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div className="min-w-0">
          <Text.Sans>Search this channel</Text.Sans>
          <Text.Sans size="small" id="search-hint">
            {search ? "Press the new shortcut, Esc to cancel" : "In a channel"}
          </Text.Sans>
        </div>
        <KbdButton
          recording={search}
          onClick={toggleSearch}
          aria-label="Change the shortcut for Search this channel"
          aria-keyshortcuts="Meta+F"
          aria-describedby="search-hint"
        >
          <KbdShortcut keys={search ? HELD : FIND} size="md" platform="mac" />
          {search ? <KbdButtonCaret /> : null}
        </KbdButton>
      </div>
      <div className="flex min-h-11 items-center justify-between gap-4">
        <div className="min-w-0">
          <Text.Sans>Find in the page</Text.Sans>
          <Text.Sans size="small" variant={find ? "danger" : undefined} id="find-error">
            {find ? "Your browser keeps ⌘T to open a tab" : "In an Artifact"}
          </Text.Sans>
        </div>
        <KbdButton
          recording={find}
          invalid={find}
          onClick={toggleFind}
          aria-label="Change the shortcut for Find in the page"
          aria-keyshortcuts="Meta+F"
          aria-describedby="find-error"
        >
          <KbdShortcut keys={find ? NEW_TAB : FIND} size="md" platform="mac" />
        </KbdButton>
      </div>
    </div>
  );
}
