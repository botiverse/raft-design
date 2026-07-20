import { useState, type ReactNode } from "react";
import type { AnyRenderableServerComponent } from "@tanstack/react-start/rsc";

import { Preview } from "#/components/preview.tsx";
import { usePreviewTheme } from "#/components/preview-theme.tsx";
import { AppShellCollapsibleSidebarComposition } from "./compositions/collapsible-sidebar.composition.tsx";

const VIEWPORTS = ["Desktop", "Mobile"] as const;

type CodeContent = ReactNode | AnyRenderableServerComponent;

type AppShellPreviewProps = {
  code: CodeContent;
  collapsedCode?: CodeContent;
};

export function AppShellPreview({ code, collapsedCode }: AppShellPreviewProps) {
  const [viewport, setViewport] = useState<(typeof VIEWPORTS)[number]>("Desktop");

  return (
    <Preview previewClassName="!min-h-[28rem] !items-stretch !p-0">
      <Preview.Canvas>
        <div className="flex min-h-[28rem] w-full min-w-0 items-center justify-center overflow-hidden">
          {viewport === "Desktop" ? (
            <AppShellCollapsibleSidebarComposition />
          ) : (
            <AppShellMobilePreviewFrame />
          )}
        </div>
      </Preview.Canvas>
      <Preview.Controls>
        <Preview.Control label="Viewport">
          <Preview.Radio
            label="Viewport"
            options={VIEWPORTS}
            value={viewport}
            onValueChange={(value) => setViewport(value as (typeof VIEWPORTS)[number])}
          />
        </Preview.Control>
      </Preview.Controls>
      <Preview.Code html={code} collapsedHtml={collapsedCode} />
    </Preview>
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
