import { useState, type ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { ToastComposition, type ToastDemoOptions } from "./toast.composition.tsx";

const MODE_OPTIONS = ["stacked", "anchored"] as const satisfies readonly ToastDemoOptions["mode"][];
const PLACEMENT_OPTIONS = [
  "bottom-center",
  "bottom-right",
  "top-center",
  "top-right",
] as const satisfies readonly ToastDemoOptions["placement"][];
const SIDE_OPTIONS = [
  "top",
  "right",
  "bottom",
  "left",
] as const satisfies readonly ToastDemoOptions["side"][];
const ALIGN_OPTIONS = [
  "start",
  "center",
  "end",
] as const satisfies readonly ToastDemoOptions["align"][];

type CodeContent = ReactNode | AnyRenderableServerComponent;

type ToastPlaygroundPreviewProps = {
  code: CodeContent;
};

export function ToastPlaygroundPreview({ code }: ToastPlaygroundPreviewProps) {
  const [mode, setMode] = useState<ToastDemoOptions["mode"]>("stacked");
  const [placement, setPlacement] = useState<ToastDemoOptions["placement"]>("bottom-center");
  const [side, setSide] = useState<ToastDemoOptions["side"]>("bottom");
  const [align, setAlign] = useState<ToastDemoOptions["align"]>("center");
  const [icon, setIcon] = useState(true);
  const [description, setDescription] = useState(true);
  const [action, setAction] = useState(true);
  const [dismissible, setDismissible] = useState(true);

  const demoOptions: ToastDemoOptions = {
    mode,
    placement,
    side,
    align,
    icon,
    description,
    action,
    dismissible,
  };

  return (
    <Preview previewClassName="min-h-84">
      <Preview.Canvas>
        <ToastComposition
          key={`${mode}-${side}-${align}`}
          controls
          demoOptions={demoOptions}
          className="h-full min-h-84 w-full"
        />
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Mode" htmlFor="toast-preview-mode">
          <Preview.Radio
            label="Mode"
            options={MODE_OPTIONS}
            value={mode}
            onValueChange={(value) => setMode(value as ToastDemoOptions["mode"])}
          />
        </Preview.Control>
        {mode === "stacked" ? (
          <Preview.Control label="Placement" htmlFor="toast-preview-placement">
            <Preview.Radio
              label="Placement"
              options={PLACEMENT_OPTIONS}
              value={placement}
              onValueChange={(value) => setPlacement(value as ToastDemoOptions["placement"])}
            />
          </Preview.Control>
        ) : null}
        {mode === "anchored" ? (
          <>
            <Preview.Control label="Side" htmlFor="toast-preview-side">
              <Preview.Radio
                label="Side"
                options={SIDE_OPTIONS}
                value={side}
                onValueChange={(value) => setSide(value as ToastDemoOptions["side"])}
              />
            </Preview.Control>
            <Preview.Control label="Align" htmlFor="toast-preview-align">
              <Preview.Radio
                label="Align"
                options={ALIGN_OPTIONS}
                value={align}
                onValueChange={(value) => setAlign(value as ToastDemoOptions["align"])}
              />
            </Preview.Control>
          </>
        ) : null}
        <Preview.Control label="Icon" htmlFor="toast-preview-icon">
          <Preview.Checkbox
            id="toast-preview-icon"
            label="Icon"
            checked={icon}
            onCheckedChange={setIcon}
          />
        </Preview.Control>
        <Preview.Control label="Description" htmlFor="toast-preview-description">
          <Preview.Checkbox
            id="toast-preview-description"
            label="Description"
            checked={description}
            onCheckedChange={setDescription}
          />
        </Preview.Control>
        <Preview.Control label="Action" htmlFor="toast-preview-action">
          <Preview.Checkbox
            id="toast-preview-action"
            label="Action"
            checked={action}
            onCheckedChange={setAction}
          />
        </Preview.Control>
        <Preview.Control label="Dismiss" htmlFor="toast-preview-dismiss">
          <Preview.Checkbox
            id="toast-preview-dismiss"
            label="Dismiss"
            checked={dismissible}
            onCheckedChange={setDismissible}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} />
    </Preview>
  );
}
