import { ComponentPlayground } from "#/components/component-playground.tsx";
import { AppShellDesktopComposition } from "./compositions/desktop.composition.tsx";
import { AppShellMobileRootComposition } from "./compositions/mobile-root.composition.tsx";

const VIEWPORTS = ["Desktop", "Mobile"] as const;

type PreviewValues = {
  viewport: (typeof VIEWPORTS)[number];
};

export function AppShellPreview() {
  return (
    <ComponentPlayground<PreviewValues>
      defaultValues={{ viewport: "Desktop" }}
      controls={[
        {
          name: "viewport",
          label: "Viewport",
          type: "radio",
          options: VIEWPORTS,
        },
      ]}
      layout="stack"
      previewClassName="!min-h-[28rem] !items-stretch !p-0"
      render={({ viewport }) => (
        <div className="flex min-h-[28rem] w-full min-w-0 items-center justify-center overflow-hidden">
          {viewport === "Desktop" ? (
            <AppShellDesktopComposition />
          ) : (
            <AppShellMobileRootComposition />
          )}
        </div>
      )}
    />
  );
}
