import { createFileRoute } from "@tanstack/react-router";

import { TypographyDoc } from "#/routes/tokens/typography.tsx";

export const Route = createFileRoute("/tokens/typography/elegant")({
  component: ElegantTypographyDoc,
});

function ElegantTypographyDoc() {
  return <TypographyDoc theme="elegant" />;
}
