import { ToastComposition } from "../toast.composition.tsx";

export function ToastPreviewContent() {
  return (
    <ToastComposition
      controls
      demoOptions={{
        mode: "stacked",
        placement: "bottom-center",
        side: "bottom",
        align: "center",
        icon: true,
        description: true,
        action: true,
        dismissible: true,
      }}
      className="h-full min-h-84 w-full"
    />
  );
}
