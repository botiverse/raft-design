import {
  Banner,
  BannerAction,
  BannerDescription,
  BannerTitle,
  Button,
  Text,
} from "@botiverse/raft-ui";
import {
  KbdButton,
  KbdButtonCaret,
  KbdButtonPlaceholder,
  KbdShortcut,
} from "@botiverse/raft-ui/wip";
import type { KbdKeyName } from "@botiverse/raft-ui/wip";
import { TriangleAlert } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { KeyboardEvent, MouseEvent, ReactNode } from "react";

type Command = "open" | "search" | "sidebar";

const LABELS: Record<Command, string> = {
  open: "Open keyboard shortcuts",
  search: "Search",
  sidebar: "Collapse or expand the sidebar",
};

const WHERE: Record<Command, string> = {
  open: "Anywhere",
  search: "Anywhere, even while typing",
  sidebar: "In a wide window",
};

const MODIFIERS = new Set(["Meta", "Control", "Alt", "Shift"]);

/** The keys of a key press, by name; ⌘ and Ctrl are both `mod`. */
function pressed(event: KeyboardEvent): KbdKeyName[] {
  const keys: KbdKeyName[] = [];
  if (event.metaKey || event.ctrlKey) keys.push("mod");
  if (event.altKey) keys.push("alt");
  if (event.shiftKey) keys.push("shift");
  if (MODIFIERS.has(event.key)) return keys;
  if (event.code.startsWith("Key")) keys.push(event.code.slice(3).toLowerCase());
  else if (event.code.startsWith("Digit")) keys.push(event.code.slice(5));
  else keys.push(event.key);
  return keys;
}

/** The keys as `aria-keyshortcuts` writes them: Meta+Shift+K. */
function ariaKeys(keys: readonly KbdKeyName[]) {
  const names: Record<string, string> = { mod: "Meta", alt: "Alt", shift: "Shift" };
  return keys.map((key) => names[key] ?? key.toUpperCase()).join("+");
}

const same = (a: readonly KbdKeyName[], b: readonly KbdKeyName[]) => a.join(" ") === b.join(" ");

const commandOf = (event: { currentTarget: HTMLElement }) =>
  event.currentTarget.dataset.command as Command;

type Conflict = { command: Command; keys: KbdKeyName[]; owner: Command };

export function KbdButtonShortcutsPanelContent() {
  const [bindings, setBindings] = useState<Record<Command, KbdKeyName[]>>({
    open: ["mod", "/"],
    search: ["mod", "k"],
    sidebar: ["mod", "\\"],
  });
  const [recording, setRecording] = useState<Command | null>(null);
  const [held, setHeld] = useState<KbdKeyName[]>([]);
  const [refused, setRefused] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const buttons = useRef<Partial<Record<Command, HTMLButtonElement>>>({});

  const register = useCallback((element: HTMLButtonElement | null) => {
    if (element) buttons.current[element.dataset.command as Command] = element;
  }, []);

  const stop = useCallback((focus?: Command) => {
    setRecording(null);
    setHeld([]);
    setRefused(null);
    setConflict(null);
    if (focus) buttons.current[focus]?.focus();
  }, []);

  const start = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setRecording((current) => current ?? commandOf(event));
  }, []);

  const record = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      const command = commandOf(event);
      if (recording !== command) return;
      if (conflict) {
        if (event.key === "Escape") stop(command);
        return;
      }
      // Tab with no modifier leaves the field, so recording never traps the keyboard.
      if (event.key === "Tab" && !event.metaKey && !event.ctrlKey && !event.altKey) return;
      event.preventDefault();
      if (event.key === "Escape") {
        stop(command);
        return;
      }
      const keys = pressed(event);
      setHeld(keys);
      setRefused(null);
      if (MODIFIERS.has(event.key)) return;
      if (!event.metaKey && !event.ctrlKey && !event.altKey) {
        setRefused("Add ⌘, ⌥ or ⌃. Single keys aren't supported.");
        return;
      }
      const owner = (Object.keys(bindings) as Command[]).find(
        (other) => other !== command && same(bindings[other], keys),
      );
      if (owner) {
        setConflict({ command, keys, owner });
        return;
      }
      setBindings({ ...bindings, [command]: keys });
      stop(command);
    },
    [bindings, conflict, recording, stop],
  );

  const leave = useCallback(() => {
    if (!conflict) stop();
  }, [conflict, stop]);

  const resolve = useCallback(
    (swap: boolean) => {
      if (!conflict) return;
      const { command, keys, owner } = conflict;
      setBindings({ ...bindings, [command]: keys, [owner]: swap ? bindings[command] : [] });
      stop(command);
    },
    [bindings, conflict, stop],
  );
  const swap = useCallback(() => resolve(true), [resolve]);
  const replace = useCallback(() => resolve(false), [resolve]);
  const cancel = useCallback(() => stop(conflict?.command), [conflict, stop]);

  const row = (command: Command): ReactNode => {
    const isRecording = recording === command;
    const keys = isRecording ? held : bindings[command];
    const hintId = `kbd-button-panel-${command}`;
    return (
      <>
        <div
          data-recording={isRecording ? "" : undefined}
          className="flex min-h-11 items-center justify-between gap-4 rounded-control px-2 py-1.5 data-recording:bg-fill-cell-selected pointer-coarse:py-2.5"
        >
          <div className="min-w-0">
            <Text.Sans>{LABELS[command]}</Text.Sans>
            <Text.Sans
              size="small"
              variant={isRecording && refused ? "danger" : undefined}
              id={hintId}
            >
              {isRecording ? (refused ?? "Press the new shortcut, Esc to cancel") : WHERE[command]}
            </Text.Sans>
          </div>
          <KbdButton
            ref={register}
            data-command={command}
            recording={isRecording}
            invalid={isRecording && refused !== null}
            aria-label={`Change the shortcut for ${LABELS[command]}`}
            aria-keyshortcuts={
              bindings[command].length > 0 ? ariaKeys(bindings[command]) : undefined
            }
            aria-describedby={hintId}
            onClick={start}
            onKeyDown={record}
            onBlur={isRecording ? leave : undefined}
          >
            {keys.length > 0 ? (
              <KbdShortcut keys={keys} size="md" platform="mac" />
            ) : (
              <KbdButtonPlaceholder>
                {isRecording ? "Press a shortcut" : "No shortcut"}
              </KbdButtonPlaceholder>
            )}
            {isRecording && !refused && !conflict ? <KbdButtonCaret /> : null}
          </KbdButton>
        </div>
        {conflict?.command === command ? (
          <Banner status="warning" size="sm">
            <TriangleAlert />
            <BannerTitle>
              <KbdShortcut keys={conflict.keys} platform="mac" /> is used by{" "}
              {LABELS[conflict.owner]}
            </BannerTitle>
            <BannerDescription>
              Swap gives it this shortcut&rsquo;s old keys. Replace leaves it without a shortcut.
            </BannerDescription>
            <BannerAction>
              <Button variant="ghost" size="md" onClick={cancel}>
                Cancel
              </Button>
              <Button variant="default" size="md" onClick={swap}>
                Swap
              </Button>
              <Button variant="default" size="md" onClick={replace}>
                Replace
              </Button>
            </BannerAction>
          </Banner>
        ) : null}
      </>
    );
  };

  return (
    <div className="flex w-full max-w-100 flex-col gap-1">
      <Text.Sans size="group" render={<h3 />}>
        Global
      </Text.Sans>
      <div className="-mx-2 flex flex-col gap-0.5">
        {row("open")}
        {row("search")}
        {row("sidebar")}
      </div>
    </div>
  );
}
