/** @vitest-environment jsdom */
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { ComboboxSelect } from "./combobox-select";

const options = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
];

afterEach(cleanup);

test("create mode still selects existing options without calling onCreate", async () => {
  const onCreate = vi.fn();
  const onValueChange = vi.fn();
  render(
    <ComboboxSelect
      options={options}
      create
      defaultOpen
      onCreate={onCreate}
      onValueChange={onValueChange}
      aria-label="Framework"
    />,
  );

  fireEvent.click(await screen.findByRole("option", { name: "Vue" }));

  expect(onCreate).not.toHaveBeenCalled();
  expect(onValueChange).toHaveBeenCalledWith("vue", options[1], expect.anything());
  await waitFor(() => expect(screen.getByRole<HTMLInputElement>("combobox").value).toBe("Vue"));
});

test("creating an option returns its normalized value and keeps it selectable", async () => {
  const createdOption = { value: "solid-id", label: "Solid" };
  const onCreate = vi.fn(() => createdOption);
  const onValueChange = vi.fn();
  render(
    <ComboboxSelect
      options={options}
      create
      defaultOpen
      inputValue="Solid"
      onCreate={onCreate}
      onValueChange={onValueChange}
      aria-label="Framework"
    />,
  );

  fireEvent.click(await screen.findByRole("option", { name: "Create “Solid”" }));

  expect(onCreate).toHaveBeenCalledWith("Solid");
  expect(onValueChange).toHaveBeenCalledWith("solid-id", createdOption, expect.anything());
  fireEvent.click(screen.getByRole("button", { name: "Toggle options" }));
  expect(await screen.findByRole("option", { name: "Solid", selected: true })).toBeTruthy();
});

test("returning null from onCreate preserves the current selection", async () => {
  const onCreate = vi.fn(() => null);
  const onValueChange = vi.fn();
  render(
    <ComboboxSelect
      options={options}
      create
      defaultOpen
      defaultValue="react"
      inputValue="Rejected"
      onCreate={onCreate}
      onValueChange={onValueChange}
      aria-label="Framework"
    />,
  );

  fireEvent.click(await screen.findByRole("option", { name: "Create “Rejected”" }));

  expect(onCreate).toHaveBeenCalledWith("Rejected");
  expect(onValueChange).not.toHaveBeenCalled();
});

test("grouped disabled options cannot change the selection", async () => {
  const onValueChange = vi.fn();
  const groupedOptions = [
    {
      type: "group" as const,
      key: "provider",
      label: "Provider",
      children: [options[0]!, { value: "unavailable", label: "Unavailable", disabled: true }],
    },
  ];
  render(<ComboboxSelect options={groupedOptions} defaultOpen onValueChange={onValueChange} />);

  expect(await screen.findByRole("group", { name: "Provider" })).toBeTruthy();
  const disabledOption = screen.getByRole("option", { name: "Unavailable" });
  expect(disabledOption.getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(disabledOption);
  expect(onValueChange).not.toHaveBeenCalled();

  fireEvent.click(screen.getByRole("option", { name: "React" }));
  expect(onValueChange).toHaveBeenCalledWith("react", options[0], expect.anything());
});

test("multiple selection removes chips and clears to an empty array", async () => {
  const onValueChange = vi.fn();
  const onClear = vi.fn();
  render(
    <ComboboxSelect
      options={options}
      multiple
      defaultValue={["react", "vue"]}
      clearable
      onValueChange={onValueChange}
      onClear={onClear}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Remove React" }));
  expect(onValueChange).toHaveBeenLastCalledWith(["vue"], [options[1]], expect.anything());
  fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
  expect(onValueChange).toHaveBeenLastCalledWith([], [], expect.anything());
  expect(onClear).toHaveBeenCalledOnce();
});

test("remote search keeps server results and retains the selected label across result windows", async () => {
  const onSearch = vi.fn();
  render(
    <ComboboxSelect
      options={options}
      value="react"
      remote
      defaultOpen
      inputValue="server query"
      onSearch={onSearch}
      aria-label="Framework"
    />,
  );

  expect(await screen.findByRole("option", { name: "Vue" })).toBeTruthy();

  expect(screen.getByRole<HTMLInputElement>("combobox").value).toBe("server query");
});
