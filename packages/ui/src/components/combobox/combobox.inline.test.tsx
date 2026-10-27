/** @vitest-environment jsdom */
import { useCallback, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { ComboboxRootChangeEventDetails } from "@base-ui/react/combobox";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vite-plus/test";
import { Dialog, DialogContent, DialogTitle } from "../dialog/dialog";
import {
  Combobox,
  ComboboxControl,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  ComboboxList,
} from "./combobox";

// An inline list (combobox.md, "Inline list"): always open, the arrow keys
// move a highlight and only Enter or a click chooses, so a choice that costs
// something (asking the server about the row) happens once, for the row chosen.

afterEach(cleanup);

const conversations = ["#launch-week", "#design", "#dev"];

function Picker({
  onChoose,
  onSubmit,
  onOpenChange,
}: {
  onChoose: (value: string | null) => void;
  onSubmit: () => void;
  onOpenChange: (open: boolean) => void;
}) {
  const [chosen, setChosen] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const shown = useMemo(() => conversations.filter((c) => c.includes(query)), [query]);
  const choose = useCallback(
    (value: string | null) => {
      setChosen(value);
      onChoose(value);
    },
    [onChoose],
  );
  // The caller's own search: only typing changes its text.
  const changeQuery = useCallback((value: string, details: ComboboxRootChangeEventDetails) => {
    if (details.reason === "input-change" || details.reason === "input-clear") setQuery(value);
  }, []);
  const submit = useCallback(
    (event: FormEvent) => {
      event.preventDefault();
      onSubmit();
    },
    [onSubmit],
  );
  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogTitle>Send to a conversation</DialogTitle>
        <form onSubmit={submit}>
          <Combobox
            inline
            open
            items={shown}
            filter={null}
            value={chosen}
            onValueChange={choose}
            inputValue={query}
            onInputValueChange={changeQuery}
          >
            <ComboboxControl>
              <ComboboxInput aria-label="Search conversations" />
            </ComboboxControl>
            <ComboboxList aria-label="Recent">
              {(conversation: string) => (
                <ComboboxItem key={conversation} value={conversation}>
                  {conversation}
                  <ComboboxItemIndicator />
                </ComboboxItem>
              )}
            </ComboboxList>
          </Combobox>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function setup() {
  const onChoose = vi.fn();
  const onSubmit = vi.fn();
  const onOpenChange = vi.fn();
  render(<Picker onChoose={onChoose} onSubmit={onSubmit} onOpenChange={onOpenChange} />);
  const input = screen.getByRole("combobox", { name: "Search conversations" }) as HTMLInputElement;
  input.focus();
  return { input, onChoose, onSubmit, onOpenChange };
}

const option = (name: string) => screen.getByRole("option", { name });

test("the list is open from the start, a listbox the search field controls", () => {
  const { input } = setup();
  const list = screen.getByRole("listbox", { name: "Recent" });
  expect(input.getAttribute("aria-controls")).toBe(list.id);
  expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(conversations);
});

test("the arrow keys move the highlight and choose nothing; focus stays in the search", () => {
  const { input, onChoose } = setup();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(onChoose).not.toHaveBeenCalled();
  expect(document.activeElement).toBe(input);
  expect(option("#design").hasAttribute("data-highlighted")).toBe(true);
  expect(input.getAttribute("aria-activedescendant")).toBe(option("#design").id);
  expect(option("#design").getAttribute("aria-selected")).toBe("false");
});

test("Enter chooses the highlighted row once, and doesn't submit the form", async () => {
  const { input, onChoose, onSubmit } = setup();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  const notPrevented = fireEvent.keyDown(input, { key: "Enter" });
  await act(async () => {});
  expect(onChoose.mock.calls).toEqual([["#launch-week"]]);
  expect(notPrevented).toBe(false);
  expect(onSubmit).not.toHaveBeenCalled();
  expect(option("#launch-week").getAttribute("aria-selected")).toBe("true");
  // The highlight moves on without choosing again.
  fireEvent.keyDown(input, { key: "ArrowDown" });
  expect(onChoose).toHaveBeenCalledTimes(1);
});

test("a click chooses the row", async () => {
  const { onChoose } = setup();
  fireEvent.click(option("#dev"));
  await act(async () => {});
  expect(onChoose.mock.calls).toEqual([["#dev"]]);
  expect(option("#dev").getAttribute("aria-selected")).toBe("true");
});

test("choosing leaves the search text as it was", async () => {
  const { input, onChoose } = setup();
  fireEvent.change(input, { target: { value: "de" } });
  expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["#design", "#dev"]);
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Enter" });
  await act(async () => {});
  expect(onChoose.mock.calls).toEqual([["#design"]]);
  expect(input.value).toBe("de");
});

test("Esc reaches the dialog around the list", () => {
  const { input, onOpenChange } = setup();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.keyDown(input, { key: "Escape" });
  expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
});

// jsdom has no implicit submission, so these read whether Enter's default
// (submitting the form) was let through.
test("with no row highlighted, Enter is left to submit the form", () => {
  const { input, onChoose } = setup();
  const notPrevented = fireEvent.keyDown(input, { key: "Enter" });
  expect(notPrevented).toBe(true);
  expect(onChoose).not.toHaveBeenCalled();
});
