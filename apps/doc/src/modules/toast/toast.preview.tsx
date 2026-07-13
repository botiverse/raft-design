import { ComponentPlayground } from "#/components/component-playground.tsx";
import { ToastComposition, type ToastDemoOptions } from "./toast.composition.tsx";

type PreviewPlaygroundValues = ToastDemoOptions;

export function ToastPlaygroundPreview() {
  return (
    <ComponentPlayground<PreviewPlaygroundValues>
      defaultValues={{
        mode: "stacked",
        placement: "bottom-center",
        icon: true,
        description: true,
        action: true,
        dismissible: true,
      }}
      controls={[
        { name: "mode", label: "Mode", type: "radio", options: ["stacked", "anchored"] },
        {
          name: "placement",
          label: "Placement",
          type: "select",
          options: ["bottom-center", "bottom-right", "top-center", "top-right"],
        },
        { name: "icon", label: "Icon", type: "boolean" },
        { name: "description", label: "Description", type: "boolean" },
        { name: "action", label: "Action", type: "boolean" },
        { name: "dismissible", label: "Dismiss", type: "boolean" },
      ]}
      previewClassName="min-h-84"
      render={(values) => (
        <ToastComposition
          key={values.mode}
          controls
          demoOptions={values}
          className="h-full min-h-84 w-full"
        />
      )}
    />
  );
}
