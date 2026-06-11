import { createFileRoute } from "@tanstack/react-router";

import { TypographyDoc } from "#/routes/tokens/typography.tsx";

export const Route = createFileRoute("/tokens/typography/brutal")({
  component: BrutalTypographyDoc,
});

function BrutalTypographyDoc() {
  return <TypographyDoc theme="brutal" />;
}
