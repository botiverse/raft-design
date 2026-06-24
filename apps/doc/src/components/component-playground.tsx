import { useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectList,
  SelectTrigger,
  SelectValue,
} from "raft-ui";
import { ComponentDemoFrame } from "./component-demo-frame.tsx";

type ControlValue = string | boolean;

type Control<T> = {
  name: keyof T & string;
  label: string;
} & ({ type: "select"; options: readonly string[] } | { type: "boolean" } | { type: "text" });

type ComponentPlaygroundProps<T extends Record<string, ControlValue>> = {
  defaultValues: T;
  controls: readonly Control<T>[];
  previewClassName?: string;
  render: (values: T) => ReactNode;
};

type SelectControlInputProps = {
  id: string;
  label: string;
  options: readonly string[];
  value: string;
  onValueChange: (value: string) => void;
};

function SelectControlInput({ id, label, options, value, onValueChange }: SelectControlInputProps) {
  const portalRef = useRef<HTMLDivElement>(null);
  const items = options.map((option) => ({ value: option, label: option }));

  return (
    <div ref={portalRef} className="relative min-w-0">
      <Select
        value={value}
        onValueChange={(nextValue) => {
          if (nextValue) {
            onValueChange(nextValue);
          }
        }}
        items={items}
        modal={false}
      >
        <SelectTrigger id={id} aria-label={label} className="h-7 w-full px-2 font-mono text-xs">
          <SelectValue />
          <SelectIcon />
        </SelectTrigger>
        <SelectContent
          positionMethod="absolute"
          portalProps={{ container: portalRef as RefObject<HTMLElement | null> }}
          className="w-full min-w-[var(--anchor-width)]"
        >
          <SelectList>
            {options.map((option) => (
              <SelectItem key={option} value={option}>
                <SelectItemText>{option}</SelectItemText>
                <SelectItemIndicator />
              </SelectItem>
            ))}
          </SelectList>
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * Storybook-style preview: renders the live component above an editable control
 * panel. `controls` describe how to edit the typed `values` shape `T`, and
 * `render` maps the current values to the element under test.
 */
export function ComponentPlayground<T extends Record<string, ControlValue>>({
  defaultValues,
  controls,
  previewClassName,
  render,
}: ComponentPlaygroundProps<T>) {
  const [values, setValues] = useState<T>(defaultValues);

  // DOM inputs surface their value as string | boolean; narrow it back into the
  // generic value slot T[keyof T] — unavoidable at the framework boundary.
  const update = (name: keyof T, value: ControlValue) =>
    setValues((prev) => ({ ...prev, [name]: value as T[keyof T] }));

  return (
    <ComponentDemoFrame
      layout="split"
      previewClassName={previewClassName}
      footer={
        <div className="grid gap-y-4">
          <div className="font-mono text-[10px] leading-none font-medium text-foreground-placeholder uppercase">
            CONTROLS
          </div>
          {controls.map((control) => {
            let input: ReactNode;
            if (control.type === "select") {
              input = (
                <SelectControlInput
                  id={control.name}
                  label={control.label}
                  options={control.options}
                  value={String(values[control.name])}
                  onValueChange={(nextValue) => update(control.name, nextValue)}
                />
              );
            } else if (control.type === "boolean") {
              input = (
                <Checkbox
                  id={control.name}
                  aria-label={control.label}
                  checked={Boolean(values[control.name])}
                  onCheckedChange={(checked) => update(control.name, checked)}
                  size="sm"
                />
              );
            } else {
              input = (
                <Input
                  id={control.name}
                  aria-label={control.label}
                  type="text"
                  value={String(values[control.name])}
                  onChange={(event) => update(control.name, event.target.value)}
                  className="h-7 w-full px-2 py-1 text-sm"
                  suppressPasswordManager
                />
              );
            }

            return (
              <div
                key={control.name}
                className="grid grid-cols-[5rem_minmax(0,1fr)] items-center gap-2"
              >
                <label htmlFor={control.name} className="text-xs font-medium text-foreground-muted">
                  {control.label}
                </label>
                {input}
              </div>
            );
          })}
        </div>
      }
      footerClassName="pt-6"
    >
      {render(values)}
    </ComponentDemoFrame>
  );
}
