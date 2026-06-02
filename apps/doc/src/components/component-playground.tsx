import { useState, type ReactNode } from "react";
import { ComponentPreview } from "./component-preview.tsx";

type ControlValue = string | boolean;

type Control<T> = {
  name: keyof T & string;
  label: string;
} & ({ type: "select"; options: readonly string[] } | { type: "boolean" } | { type: "text" });

type ComponentPlaygroundProps<T extends Record<string, ControlValue>> = {
  initial: T;
  controls: readonly Control<T>[];
  render: (values: T) => ReactNode;
};

/**
 * Storybook-style preview: renders the live component above an editable control
 * panel. `controls` describe how to edit the typed `values` shape `T`, and
 * `render` maps the current values to the element under test.
 */
export function ComponentPlayground<T extends Record<string, ControlValue>>({
  initial,
  controls,
  render,
}: ComponentPlaygroundProps<T>) {
  const [values, setValues] = useState<T>(initial);

  // DOM inputs surface their value as string | boolean; narrow it back into the
  // generic value slot T[keyof T] — unavoidable at the framework boundary.
  const update = (name: keyof T, value: ControlValue) =>
    setValues((prev) => ({ ...prev, [name]: value as T[keyof T] }));

  return (
    <div className="space-y-3">
      <ComponentPreview>
        {/* Stable canvas height so changing a size control doesn't reflow the page. */}
        <div className="flex min-h-24 w-full items-center justify-center">{render(values)}</div>
      </ComponentPreview>
      <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
        {controls.map((control) => {
          let input: ReactNode;
          if (control.type === "select") {
            input = (
              <select
                id={control.name}
                aria-label={control.label}
                value={String(values[control.name])}
                onChange={(event) => update(control.name, event.target.value)}
                className="rounded border border-gray-200 bg-white px-2 py-1 font-mono text-xs text-gray-900"
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
              <input
                id={control.name}
                aria-label={control.label}
                type="checkbox"
                checked={Boolean(values[control.name])}
                onChange={(event) => update(control.name, event.target.checked)}
                className="size-4 accent-gray-900"
              />
            );
          } else {
            input = (
              <input
                id={control.name}
                aria-label={control.label}
                type="text"
                value={String(values[control.name])}
                onChange={(event) => update(control.name, event.target.value)}
                className="rounded border border-gray-200 bg-white px-2 py-1 text-sm text-gray-900"
              />
            );
          }

          return (
            <div key={control.name} className="flex items-center gap-4 px-4 py-2.5">
              <label
                htmlFor={control.name}
                className="w-24 shrink-0 text-sm font-medium text-gray-700"
              >
                {control.label}
              </label>
              {input}
            </div>
          );
        })}
      </div>
    </div>
  );
}
