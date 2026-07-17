import { ComponentPlayground } from "#/components/component-playground.tsx";
import { usePreviewTheme } from "#/components/preview-theme.tsx";
import { AppShellCollapsibleSidebarComposition } from "./compositions/collapsible-sidebar.composition.tsx";

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
            <AppShellCollapsibleSidebarComposition />
          ) : (
            <AppShellMobilePreviewFrame />
          )}
        </div>
      )}
    />
  );
}

function AppShellMobilePreviewFrame() {
  const { mode, theme } = usePreviewTheme();
  const params = new URLSearchParams({ mode, theme });

  return (
    <iframe
      key={`${theme}-${mode}`}
      title={`App shell mobile preview in ${theme} ${mode}`}
      src={`/iframe/app-shell-mobile?${params.toString()}`}
      sandbox="allow-scripts"
      className="block h-[360px] w-[375px] max-w-full border-0 bg-transparent"
    />
  );
}
