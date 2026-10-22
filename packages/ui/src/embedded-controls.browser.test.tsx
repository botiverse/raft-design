import "./head-edges.test.css";
import { afterAll, afterEach, expect, test } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { CSSProperties, ReactNode } from "react";
import { ThemeProvider } from "./lib/theme/theme-provider";
import { Button } from "./components/button/button";
import {
  CodeBlock,
  CodeBlockAction,
  CodeBlockActions,
  CodeBlockBody,
  CodeBlockPre,
} from "./components/code-block";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxClear,
  ComboboxContent,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "./components/combobox";
import { ComboboxSelect } from "./components/combobox-select";
import {
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerSubmit,
  ComposerSuggestionList,
  ComposerSuggestionOption,
  ComposerToolbar,
} from "./components/composer";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "./components/context-menu/context-menu";
import {
  LightboxInfoActions,
  LightboxInfoBar,
  LightboxInfoTitle,
} from "./components/lightbox/lightbox";
import {
  MessageAttachmentAction,
  MessageAttachmentCard,
  MessageAttachmentMeta,
  MessageAttachmentMetaEnd,
  MessageAttachmentMetaStart,
  MessageAttachmentTitle,
  MessageImageGallery,
  MessageImageGalleryAction,
  MessageImageGalleryItem,
  MessageVideoPreview,
  MessageVideoPreviewAction,
} from "./components/message-attachment";
import {
  MessageMultiSelectToolbar,
  MessageMultiSelectToolbarActions,
} from "./components/message-item/message-multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "./components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./components/dropdown-menu/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./components/input-group";
import {
  MessageItemToolbar,
  MessageItemToolbarButton,
} from "./components/message-item/message-item-toolbar";
import { SegmentedControl, SegmentedControlItem } from "./components/segmented-control";
import { ToggleGroup, ToggleGroupItem } from "./components/toggle-group";

// A control embedded in another component's frame wears `radius-chip` and
// sits the same distance from the frame's outer edge on every side, and as far
// from its sibling: 6px in a field, the composer and a corner, 4px in a
// floating toolbar, 4px for a popup's highlight, 3px between the segments of a
// track (design/foundations/shape.md#inside-a-frame). In a field the chips and
// buttons are the field's height less 12px, so the field keeps its height.
// Real layout only: jsdom has no boxes to measure.

const it = test.skipIf(typeof window === "undefined");

// Turning touch emulation off again leaves Chromium reporting `pointer: none`,
// so the mouse screen runs first.
const SCREENS = [
  { name: "desktop 1280", width: 1280, height: 800, touch: false, control: 32 },
  { name: "phone 390", width: 390, height: 844, touch: true, control: 44 },
] as const;
type Screen = (typeof SCREENS)[number];

let touching = false;
async function setScreen(s: Screen) {
  const { cdp, page } = await import("vite-plus/test/browser/context");
  await page.viewport(s.width, s.height);
  if (s.touch && !touching) {
    touching = true;
    await cdp().send("Emulation.setEmulatedMedia", {
      features: [{ name: "pointer", value: "coarse" }],
    });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
  }
}

afterEach(cleanup);
afterAll(async () => {
  if (typeof window === "undefined") return;
  const { cdp, page } = await import("vite-plus/test/browser/context");
  if (touching) {
    await cdp().send("Emulation.setEmulatedMedia", { features: [{ name: "pointer", value: "" }] });
    await cdp().send("Emulation.setTouchEmulationEnabled", { enabled: false, maxTouchPoints: 1 });
  }
  await page.viewport(414, 896);
});

function show(ui: ReactNode) {
  return render(
    <ThemeProvider mode="light">
      <div style={{ width: 370, padding: 10 }}>{ui}</div>
    </ThemeProvider>,
  );
}

/** Where `inner` sits inside `frame`'s outer edge, and its own size and corner. */
function inset(frame: Element, inner: Element) {
  const f = frame.getBoundingClientRect();
  const r = inner.getBoundingClientRect();
  return {
    left: r.left - f.left,
    top: r.top - f.top,
    right: f.right - r.right,
    bottom: f.bottom - r.bottom,
    width: r.width,
    height: r.height,
    radius: getComputedStyle(inner).borderTopLeftRadius,
  };
}

const near = (actual: number, expected: number) =>
  expect(Math.abs(actual - expected), `${actual} ≈ ${expected}`).toBeLessThanOrEqual(0.25);

const ICON = <svg viewBox="0 0 24 24" />;
const CITIES = [
  { value: "sh", label: "Rome" },
  { value: "ld", label: "Oslo" },
];
const CITY_VALUES = ["sh", "ld"];
const PEOPLE = ["Bugen", "Rin"];
const SHOWN_TOOLBAR: CSSProperties = { opacity: 1, pointerEvents: "auto" };
const LEFT = ["left"];
const MANY_CITIES = [
  { value: "a", label: "Amsterdam" },
  { value: "b", label: "Barcelona" },
  { value: "c", label: "Copenhagen" },
  { value: "d", label: "Dubrovnik" },
];
const MANY_VALUES = ["a", "b", "c", "d"];
const ONE_PERSON = ["Bugen"];
const IMAGE_BOX: CSSProperties = { width: 144, height: 144 };
const LONG_CODE = `const message = "${"a line far too long for the block ".repeat(4)}";`;

for (const s of SCREENS) {
  const embedded = s.control - 12;

  it(`${s.name}: ComboboxSelect chips and actions sit 6px inside the field`, async () => {
    await setScreen(s);
    show(<ComboboxSelect multiple clearable options={CITIES} defaultValue={CITY_VALUES} />);
    const chips = await waitFor(() => {
      const found = document.querySelectorAll(".r-combobox-select__chip");
      expect(found.length).toBe(2);
      return found;
    });
    const field = document.querySelector(".r-combobox-select__control")!;
    expect(field.getBoundingClientRect().height).toBe(s.control);
    const chip = inset(field, chips[0]!);
    near(chip.left, 6);
    near(chip.top, 6);
    near(chip.height, embedded);
    expect(chip.radius).toBe("6px");
    near(chips[1]!.getBoundingClientRect().left - chips[0]!.getBoundingClientRect().right, 6);
    const remove = inset(chips[0]!, chips[0]!.querySelector(".r-combobox-select__remove")!);
    near(remove.right, 2);
    expect(remove.radius).toBe("4px");
    const actions = document.querySelectorAll(".r-combobox-select__action");
    const last = inset(field, actions[actions.length - 1]!);
    near(last.right, 6);
    near(last.top, 6);
    near(last.width, embedded);
    expect(last.radius).toBe("6px");
    near(actions[1]!.getBoundingClientRect().left - actions[0]!.getBoundingClientRect().right, 6);
  });

  it(`${s.name}: Combobox chips sit 6px inside the field`, async () => {
    await setScreen(s);
    show(
      <Combobox<string, true> multiple items={PEOPLE} defaultValue={PEOPLE}>
        <ComboboxChips data-testid="chips">
          <ComboboxChip data-testid="chip">
            <span>Bugen</span>
            <ComboboxChipRemove />
          </ComboboxChip>
          <ComboboxInput aria-label="Add" />
        </ComboboxChips>
      </Combobox>,
    );
    const field = screen.getByTestId("chips");
    expect(field.getBoundingClientRect().height).toBe(s.control);
    const chip = inset(field, screen.getByTestId("chip"));
    near(chip.left, 6);
    near(chip.top, 6);
    near(chip.height, embedded);
    expect(chip.radius).toBe("6px");
  });

  it(`${s.name}: a Button ending an InputGroup sits 6px inside it`, async () => {
    await setScreen(s);
    show(
      <InputGroup data-testid="group">
        <InputGroupInput aria-label="Search" defaultValue="design" />
        <InputGroupAddon align="inline-end">
          <Button variant="ghost" size="icon-md" aria-label="Clear search" data-testid="clear">
            {ICON}
          </Button>
        </InputGroupAddon>
      </InputGroup>,
    );
    const button = inset(screen.getByTestId("group"), screen.getByTestId("clear"));
    near(button.right, 6);
    near(button.top, 6);
    near(button.width, embedded);
    expect(button.radius).toBe("6px");
  });

  it(`${s.name}: the composer's buttons sit 6px inside its frame`, async () => {
    await setScreen(s);
    show(
      <Composer data-testid="composer">
        <ComposerInput aria-label="Message" />
        <ComposerToolbar>
          <ComposerActions>
            <ComposerIconButton aria-label="Attach" data-testid="attach">
              {ICON}
            </ComposerIconButton>
          </ComposerActions>
          <ComposerMeta>
            <ComposerSubmit aria-label="Send" size="icon-md" data-testid="send">
              {ICON}
            </ComposerSubmit>
          </ComposerMeta>
        </ComposerToolbar>
      </Composer>,
    );
    const composer = screen.getByTestId("composer");
    const attach = inset(composer, screen.getByTestId("attach"));
    const send = inset(composer, screen.getByTestId("send"));
    near(attach.left, 6);
    near(attach.bottom, 6);
    near(send.right, 6);
    near(send.bottom, 6);
    expect(attach.radius).toBe("6px");
    expect(send.radius).toBe("6px");
  });

  it(`${s.name}: a floating toolbar leaves 4px around and between its buttons`, async () => {
    await setScreen(s);
    show(
      <div style={{ position: "relative", paddingTop: 40 }}>
        <MessageItemToolbar data-testid="toolbar" style={SHOWN_TOOLBAR}>
          <MessageItemToolbarButton aria-label="Reply" data-testid="first">
            {ICON}
          </MessageItemToolbarButton>
          <MessageItemToolbarButton aria-label="React" data-testid="second">
            {ICON}
          </MessageItemToolbarButton>
        </MessageItemToolbar>
      </div>,
    );
    const toolbar = screen.getByTestId("toolbar");
    const first = inset(toolbar, screen.getByTestId("first"));
    const second = screen.getByTestId("second").getBoundingClientRect();
    expect(toolbar.getBoundingClientRect().height).toBe(36);
    near(first.left, 4);
    near(first.top, 4);
    near(second.left - screen.getByTestId("first").getBoundingClientRect().right, 4);
    expect(first.radius).toBe("6px");
  });

  it(`${s.name}: a code block's copy button sits 6px from the corner and covers no code`, async () => {
    await setScreen(s);
    show(
      <CodeBlock data-testid="block">
        <CodeBlockBody data-testid="body">
          <CodeBlockActions>
            <CodeBlockAction aria-label="Copy code" data-testid="copy">
              {ICON}
            </CodeBlockAction>
          </CodeBlockActions>
          <pre>
            <code>{"export const message = 'a line long enough to run under the button';"}</code>
          </pre>
        </CodeBlockBody>
      </CodeBlock>,
    );
    const copy = inset(screen.getByTestId("block"), screen.getByTestId("copy"));
    near(copy.top, 6);
    near(copy.right, 6);
    expect(copy.radius).toBe("6px");
    // The code, scrolled or not, ends before the button: no line runs under it.
    const code = screen.getByTestId("body").querySelector("pre")!.getBoundingClientRect();
    expect(code.right).toBeLessThanOrEqual(screen.getByTestId("copy").getBoundingClientRect().left);
  });

  it(`${s.name}: segments sit as far apart as they sit from the track`, async () => {
    await setScreen(s);
    show(
      <>
        <SegmentedControl aria-label="View" defaultValue="board">
          <SegmentedControlItem value="board" data-testid="seg-a">
            Board
          </SegmentedControlItem>
          <SegmentedControlItem value="list" data-testid="seg-b">
            List
          </SegmentedControlItem>
        </SegmentedControl>
        <ToggleGroup aria-label="Align" defaultValue={LEFT}>
          <ToggleGroupItem value="left" data-testid="tog-a">
            Left
          </ToggleGroupItem>
          <ToggleGroupItem value="right" data-testid="tog-b">
            Right
          </ToggleGroupItem>
        </ToggleGroup>
      </>,
    );
    const gap = (a: string, b: string) =>
      screen.getByTestId(b).getBoundingClientRect().left -
      screen.getByTestId(a).getBoundingClientRect().right;
    near(gap("seg-a", "seg-b"), 3);
    near(gap("tog-a", "tog-b"), 3);
  });

  it(`${s.name}: a popup's highlight sits 4px inside it with radius-chip`, async () => {
    await setScreen(s);
    show(
      <DropdownMenu open>
        <DropdownMenuTrigger>Open</DropdownMenuTrigger>
        <DropdownMenuContent data-testid="menu">
          <DropdownMenuItem data-testid="item">Rename</DropdownMenuItem>
          <DropdownMenuItem>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    const menu = await screen.findByTestId("menu");
    const item = inset(menu, screen.getByTestId("item"));
    near(item.left, 4);
    near(item.top, 4);
    expect(item.radius).toBe("6px");
  });
  moreCases(s);
}

/** The highlight of a popup's first item: 4px inside the popup, radius-chip. */
async function expectHighlight(frame: Element, item: Element) {
  const box = inset(frame, item);
  near(box.left, 4);
  near(box.top, 4);
  near(box.right, 4);
  expect(box.radius).toBe("6px");
}

function moreCases(s: Screen) {
  const embedded = s.control - 12;

  it(`${s.name}: chips that wrap keep 6px between lines and to the field`, async () => {
    await setScreen(s);
    show(
      <div style={{ width: 240 }}>
        <ComboboxSelect multiple options={MANY_CITIES} defaultValue={MANY_VALUES} />
      </div>,
    );
    const chips = await waitFor(() => {
      const found = [...document.querySelectorAll(".r-combobox-select__chip")];
      expect(found.length).toBe(4);
      return found;
    });
    const field = document.querySelector(".r-combobox-select__control")!;
    const first = inset(field, chips[0]!);
    const last = inset(field, chips[3]!);
    expect(last.top).toBeGreaterThan(first.top);
    // Down a field the inset is counted on the 1.5px border, so the one-line
    // field keeps its height in every engine; Chromium draws that border at
    // 1px, so wrapped chips sit 5.5px from it there.
    expect(Math.abs(first.top - 6)).toBeLessThanOrEqual(0.5);
    expect(Math.abs(last.bottom - 6)).toBeLessThanOrEqual(0.5);
    const lines = [...new Set(chips.map((chip) => chip.getBoundingClientRect().top))].sort(
      (a, b) => a - b,
    );
    near(lines[1]! - lines[0]! - embedded, 6);
  });

  for (const [size, height, chip, gap] of [
    ["sm", 28, 22, 3],
    ["lg", 52, 40, 6],
  ] as const) {
    it(`${s.name}: ComboboxSelect ${size} keeps its ${height}px field with chips in it`, async () => {
      await setScreen(s);
      show(<ComboboxSelect multiple size={size} options={CITIES} defaultValue={CITY_VALUES} />);
      const chips = await waitFor(() => {
        const found = document.querySelectorAll(".r-combobox-select__chip");
        expect(found.length).toBe(2);
        return found;
      });
      const field = document.querySelector(".r-combobox-select__control")!;
      expect(field.getBoundingClientRect().height).toBe(height);
      const box = inset(field, chips[0]!);
      near(box.height, chip);
      near(box.top, gap);
      near(box.left, gap);
    });
  }

  it(`${s.name}: Combobox's clear sits 6px inside the field, a chip's × 2px inside the chip`, async () => {
    await setScreen(s);
    show(
      <>
        <Combobox<string> items={PEOPLE} defaultValue="Bugen">
          <ComboboxControl data-testid="control">
            <ComboboxInput aria-label="Person" />
            <ComboboxClear aria-label="Clear" data-testid="clear" />
          </ComboboxControl>
        </Combobox>
        <Combobox<string, true> multiple items={PEOPLE} defaultValue={ONE_PERSON}>
          <ComboboxChips>
            <ComboboxChip data-testid="chip">
              <span>Bugen</span>
              <ComboboxChipRemove data-testid="remove" />
            </ComboboxChip>
            <ComboboxInput aria-label="Add" />
          </ComboboxChips>
        </Combobox>
      </>,
    );
    const clear = inset(screen.getByTestId("control"), screen.getByTestId("clear"));
    near(clear.right, 6);
    near(clear.top, 6);
    near(clear.width, embedded);
    expect(clear.radius).toBe("6px");
    const remove = inset(screen.getByTestId("chip"), screen.getByTestId("remove"));
    near(remove.right, 2);
    near(remove.top, 2);
    expect(remove.radius).toBe("4px");
  });

  it(`${s.name}: every popup's highlight sits 4px inside it`, async () => {
    await setScreen(s);
    show(
      <>
        <Select defaultValue="one" defaultOpen>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-56" data-testid="select">
            <SelectList>
              <SelectItem value="one" data-testid="select-item">
                <SelectItemText>Sonnet</SelectItemText>
              </SelectItem>
            </SelectList>
          </SelectContent>
        </Select>
      </>,
    );
    await expectHighlight(await screen.findByTestId("select"), screen.getByTestId("select-item"));
    cleanup();

    show(
      <Combobox<string> items={PEOPLE} defaultOpen>
        <ComboboxControl className="w-56">
          <ComboboxInput aria-label="Person" />
        </ComboboxControl>
        <ComboboxContent className="w-56" data-testid="combobox">
          <ComboboxList>
            <ComboboxItem value="Bugen" data-testid="combobox-item">
              Bugen
            </ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>,
    );
    await expectHighlight(
      await screen.findByTestId("combobox"),
      screen.getByTestId("combobox-item"),
    );
    cleanup();

    show(<ComboboxSelect defaultOpen options={CITIES} />);
    const option = await waitFor(() => {
      const found = document.querySelector(".r-combobox-select__option");
      expect(found).not.toBeNull();
      return found!;
    });
    await expectHighlight(document.querySelector(".r-combobox-select__popup")!, option);
    cleanup();

    show(
      <ContextMenu>
        <ContextMenuTrigger data-testid="area" className="block h-20 w-40">
          Area
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56" data-testid="context">
          <ContextMenuItem data-testid="context-item">Copy</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByTestId("area"), { clientX: 20, clientY: 20 });
    await expectHighlight(
      await screen.findByTestId("context"),
      await screen.findByTestId("context-item"),
    );
    cleanup();

    show(
      <div style={{ position: "relative", marginTop: 200 }}>
        <ComposerSuggestionList data-testid="suggestions">
          <ComposerSuggestionOption data-testid="suggestion">Bugen</ComposerSuggestionOption>
        </ComposerSuggestionList>
      </div>,
    );
    await expectHighlight(screen.getByTestId("suggestions"), screen.getByTestId("suggestion"));
  });

  it(`${s.name}: the lightbox bar and the multi-select bar are 36px floating toolbars`, async () => {
    await setScreen(s);
    show(
      <>
        <LightboxInfoBar data-testid="lightbox">
          <LightboxInfoTitle>photo.png</LightboxInfoTitle>
          <LightboxInfoActions>
            <Button variant="ghost" size="icon-md" aria-label="Download" data-testid="download">
              {ICON}
            </Button>
          </LightboxInfoActions>
        </LightboxInfoBar>
        <MessageMultiSelectToolbar data-testid="multi">
          <span>1 selected</span>
          <MessageMultiSelectToolbarActions>
            <Button size="md" data-testid="cancel">
              Cancel
            </Button>
            <Button size="icon-md" aria-label="More" data-testid="more">
              {ICON}
            </Button>
          </MessageMultiSelectToolbarActions>
        </MessageMultiSelectToolbar>
      </>,
    );
    for (const [bar, last] of [
      ["lightbox", "download"],
      ["multi", "more"],
    ] as const) {
      const frame = screen.getByTestId(bar);
      expect(frame.getBoundingClientRect().height).toBe(36);
      const button = inset(frame, screen.getByTestId(last));
      near(button.right, 4);
      near(button.top, 4);
      near(button.width, 28);
      expect(button.radius).toBe("6px");
    }
    const cancel = screen.getByTestId("cancel").getBoundingClientRect();
    near(screen.getByTestId("more").getBoundingClientRect().left - cancel.right, 4);
    // On a touch screen each 28px button still takes a 44px tap: its hit
    // area reaches 8px past its top and bottom (and past an icon's sides).
    if (s.touch) {
      for (const id of ["download", "cancel", "more"]) {
        const button = screen.getByTestId(id);
        const box = button.getBoundingClientRect();
        const x = box.left + box.width / 2;
        for (const y of [box.top - 7.5, box.bottom + 7.5]) {
          expect(document.elementFromPoint(x, y)?.closest("[data-testid]"), `${id} at ${y}`).toBe(
            button,
          );
        }
      }
      const more = screen.getByTestId("more").getBoundingClientRect();
      expect(
        document
          .elementFromPoint(more.right + 7.5, more.top + more.height / 2)
          ?.closest("[data-testid]"),
      ).toBe(screen.getByTestId("more"));
    }
    // A tap in the 4px between two buttons lands on the nearer one: each hit
    // area reaches half the gap toward its neighbour, never over it.
    const more = screen.getByTestId("more").getBoundingClientRect();
    const y = cancel.top + cancel.height / 2;
    const at = (x: number) => document.elementFromPoint(x, y)?.closest("[data-testid]");
    expect(at(cancel.right + 1), "1px right of Cancel").toBe(screen.getByTestId("cancel"));
    expect(at(more.left - 1), "1px left of More").toBe(screen.getByTestId("more"));
    expect(at(cancel.right - 1), "inside Cancel's edge").toBe(screen.getByTestId("cancel"));
  });

  it(`${s.name}: corner actions on a video, an image and a file card sit 6px from the corner`, async () => {
    await setScreen(s);
    show(
      <>
        <MessageVideoPreview data-testid="video">
          <MessageVideoPreviewAction aria-label="Download" data-testid="video-action">
            {ICON}
          </MessageVideoPreviewAction>
        </MessageVideoPreview>
        <MessageImageGallery>
          <MessageImageGalleryItem data-testid="image" style={IMAGE_BOX}>
            <MessageImageGalleryAction aria-label="Download" data-testid="image-action">
              {ICON}
            </MessageImageGalleryAction>
          </MessageImageGalleryItem>
        </MessageImageGallery>
        <MessageAttachmentCard data-testid="card">
          <MessageAttachmentTitle>migration.diff</MessageAttachmentTitle>
          <MessageAttachmentMeta>
            <MessageAttachmentMetaStart>18 KB</MessageAttachmentMetaStart>
            <MessageAttachmentMetaEnd>
              <MessageAttachmentAction aria-label="Download" data-testid="card-action">
                {ICON}
              </MessageAttachmentAction>
            </MessageAttachmentMetaEnd>
          </MessageAttachmentMeta>
        </MessageAttachmentCard>
      </>,
    );
    // It shows on hover and keyboard focus; only its place is measured here.
    screen.getByTestId("image-action").style.display = "flex";
    const video = inset(screen.getByTestId("video"), screen.getByTestId("video-action"));
    near(video.top, 6);
    near(video.right, 6);
    expect(video.radius).toBe("6px");
    const image = inset(screen.getByTestId("image"), screen.getByTestId("image-action"));
    near(image.bottom, 6);
    near(image.right, 6);
    expect(image.radius).toBe("6px");
    const card = inset(screen.getByTestId("card"), screen.getByTestId("card-action"));
    near(card.bottom, 6);
    near(card.right, 6);
    expect(card.radius).toBe("6px");
  });

  it(`${s.name}: a one-line code block keeps 6px under its button, and long code scrolls beside two`, async () => {
    await setScreen(s);
    show(
      <>
        <CodeBlock data-testid="short">
          <CodeBlockBody>
            <CodeBlockActions>
              <CodeBlockAction aria-label="Copy code" data-testid="short-copy">
                {ICON}
              </CodeBlockAction>
            </CodeBlockActions>
            <CodeBlockPre data-testid="short-code">
              <code>ok</code>
            </CodeBlockPre>
          </CodeBlockBody>
        </CodeBlock>
        <CodeBlock data-testid="long">
          <CodeBlockBody>
            <CodeBlockActions>
              <CodeBlockAction aria-label="Wrap lines" data-testid="wrap">
                {ICON}
              </CodeBlockAction>
              <CodeBlockAction aria-label="Copy code" data-testid="long-copy">
                {ICON}
              </CodeBlockAction>
            </CodeBlockActions>
            <CodeBlockPre data-testid="long-code">
              <code>{LONG_CODE}</code>
            </CodeBlockPre>
          </CodeBlockBody>
        </CodeBlock>
      </>,
    );
    const short = inset(screen.getByTestId("short"), screen.getByTestId("short-copy"));
    near(short.top, 6);
    near(short.bottom, 6);
    near(short.right, 6);
    const code = screen.getByTestId("long-code");
    expect(code.scrollWidth).toBeGreaterThan(code.clientWidth);
    // Code that scrolls is a named region the keyboard reaches; code that
    // fits adds no Tab stop.
    await waitFor(() => expect(code.getAttribute("role")).toBe("region"));
    expect(code.getAttribute("tabindex")).toBe("0");
    expect(code.getAttribute("aria-label")).toBe("Code");
    const fits = screen.getByTestId("short-code");
    expect(fits.hasAttribute("tabindex")).toBe(false);
    expect(fits.hasAttribute("role")).toBe(false);
    expect(code.getBoundingClientRect().right).toBeLessThanOrEqual(
      screen.getByTestId("wrap").getBoundingClientRect().left,
    );
    near(inset(screen.getByTestId("long"), screen.getByTestId("long-copy")).right, 6);
  });
}
