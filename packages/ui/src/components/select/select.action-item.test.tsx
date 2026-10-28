/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Select,
  SelectActionItem,
  SelectContent,
  SelectItem,
  SelectItemText,
  SelectList,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

// A list action is an option to Base UI, so it joins navigation and typeahead,
// but the root never lets its value through: pressing it runs `onAction`, and
// the value and `onValueChange` stay as they were.

afterEach(cleanup);

const MULTIPLE_VALUE = ["a"];

function renderSelect(
  props: {
    onAction?: (event: Event) => void;
    onValueChange?: (value: unknown) => void;
    onOpenChange?: (open: boolean) => void;
    closeOnAction?: boolean;
    multiple?: boolean;
  } = {},
) {
  const { onAction, onValueChange, onOpenChange, closeOnAction, multiple } = props;
  return render(
    <Select
      defaultOpen
      defaultValue={multiple ? MULTIPLE_VALUE : "a"}
      multiple={multiple}
      onValueChange={onValueChange}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger data-testid="trigger">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectList>
          <SelectItem value="a">
            <SelectItemText>Alpha</SelectItemText>
          </SelectItem>
          <SelectItem value="b">
            <SelectItemText>Beta</SelectItemText>
          </SelectItem>
          <SelectSeparator />
          <SelectActionItem
            data-testid="action"
            aria-expanded={false}
            onAction={onAction}
            closeOnAction={closeOnAction}
          >
            Show All
          </SelectActionItem>
        </SelectList>
      </SelectContent>
    </Select>,
  );
}

test("pressing the action runs onAction and leaves the value alone", async () => {
  const onAction = vi.fn();
  const onValueChange = vi.fn();
  const onOpenChange = vi.fn();
  renderSelect({ onAction, onValueChange, onOpenChange });
  const action = await screen.findByTestId("action");
  await act(async () => {
    fireEvent.pointerDown(action, { pointerType: "mouse" });
    fireEvent.click(action);
  });
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(onValueChange).not.toHaveBeenCalled();
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByTestId("trigger").textContent).toBe("a");
  expect(screen.getByRole("listbox")).toBeTruthy();
});

test("closeOnAction lets the press close the list", async () => {
  const onAction = vi.fn();
  const onOpenChange = vi.fn();
  renderSelect({ onAction, onOpenChange, closeOnAction: true });
  const action = await screen.findByTestId("action");
  await act(async () => {
    fireEvent.pointerDown(action, { pointerType: "mouse" });
    fireEvent.click(action);
  });
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
});

test("in a multiple select the action is never added to the value", async () => {
  const onAction = vi.fn();
  const onValueChange = vi.fn();
  renderSelect({ onAction, onValueChange, multiple: true });
  const action = await screen.findByTestId("action");
  await act(async () => {
    fireEvent.pointerDown(action, { pointerType: "mouse" });
    fireEvent.click(action);
  });
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(onValueChange).not.toHaveBeenCalled();
});

test("an ordinary item still chooses its value after the action ran", async () => {
  const onValueChange = vi.fn();
  renderSelect({ onAction: () => {}, onValueChange });
  const action = await screen.findByTestId("action");
  await act(async () => {
    fireEvent.pointerDown(action, { pointerType: "mouse" });
    fireEvent.click(action);
  });
  const beta = screen.getByRole("option", { name: "Beta" });
  await act(async () => {
    fireEvent.pointerDown(beta, { pointerType: "mouse" });
    fireEvent.click(beta);
  });
  expect(onValueChange).toHaveBeenCalledWith("b", expect.anything());
});

test("the action is an option in the listbox, with its aria-expanded and never selected", async () => {
  renderSelect();
  const action = await screen.findByTestId("action");
  expect(action.getAttribute("role")).toBe("option");
  expect(action.getAttribute("aria-selected")).toBe("false");
  expect(action.getAttribute("aria-expanded")).toBe("false");
  expect(action.getAttribute("data-slot")).toBe("select-action-item");
  expect(action.className).toContain("text-foreground-muted");
});
