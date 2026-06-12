import { useState, type ReactNode } from "react";
import { Checkbox, Input } from "@slock/ui";
import { ComponentDemoFrame } from "./component-demo-frame.tsx";

type ControlValue = string | boolean;

type Control<T> = {
  name: keyof T & string;
  label: string;
} & ({ type: "select"; options: readonly string[] } | { type: "boolean" } | { type: "text" });

type ComponentPlaygroundProps<T extends Record<string, ControlValue>> = {
  defaultValues: T;
  controls: readonly Control<T>[];
  render: (values: T) => ReactNode;
};

/**
 * Storybook-style preview: renders the live component above an editable control
 * panel. `controls` describe how to edit the typed `values` shape `T`, and
 * `render` maps the current values to the element under test.
 */
export function ComponentPlayground<T extends Record<string, ControlValue>>({
  defaultValues,
  controls,
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
      footer={
        <div className="grid gap-y-4">
          <div className="font-mono text-[10px] leading-none font-medium text-foreground-placeholder uppercase">
            CONTROLS
          </div>
          {controls.map((control) => {
            let input: ReactNode;
            if (control.type === "select") {
              input = (
                <select
                  id={control.name}
                  aria-label={control.label}
                  value={String(values[control.name])}
                  onChange={(event) => update(control.name, event.target.value)}
                  className="h-7 w-full rounded-sm border border-line-subtle bg-layer-field px-2 font-mono text-xs text-foreground outline-none transition duration-200 ease-out hover:bg-layer-muted focus:border-line-focus"
                >
                  {control.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
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
