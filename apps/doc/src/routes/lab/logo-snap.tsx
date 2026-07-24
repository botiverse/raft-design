import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { LogoSnapLab } from "#/modules/logo/logo-snap.lab.tsx";

export const Route = createFileRoute("/lab/logo-snap")({
  component: LogoSnapLabPage,
});

function LogoSnapLabPage() {
  return (
    <DocPage
      title="Logo snap"
      description="Sandbox for the Raft mark snap animation."
      toc={[]}
      showToc={false}
    >
      <LogoSnapLab />
    </DocPage>
  );
}
