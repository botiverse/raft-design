import { createFileRoute } from "@tanstack/react-router";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";
import { ResponsiveShellComposition } from "#/modules/responsive/responsive-shell.composition.tsx";
import {
  ResponsiveShellOwnership,
  ResponsiveShellValidation,
} from "#/modules/responsive/responsive-shell-guide.tsx";

const TOC = [
  { id: "modes", title: "Shell modes" },
  { id: "ownership", title: "Ownership" },
  { id: "validation", title: "Validation" },
] as const;

export const Route = createFileRoute("/components/responsive")({
  component: ResponsiveDoc,
});

function ResponsiveDoc() {
  return (
    <DocPage
      title="Responsive shell"
      description="How the Playground changes panel placement and scroll ownership across breakpoints."
      toc={TOC}
      articleClassName="max-w-none"
    >
      <DocSection id="modes" title="Shell modes">
        <ResponsiveShellComposition />
      </DocSection>

      <DocSection id="ownership" title="Ownership">
        <ResponsiveShellOwnership />
      </DocSection>

      <DocSection id="validation" title="Validation">
        <ResponsiveShellValidation />
      </DocSection>
    </DocPage>
  );
}
