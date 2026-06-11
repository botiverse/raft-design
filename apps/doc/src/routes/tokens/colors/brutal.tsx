import { createFileRoute } from "@tanstack/react-router";

import { ColorsDoc } from "#/routes/tokens/colors.tsx";

export const Route = createFileRoute("/tokens/colors/brutal")({
  component: BrutalColorsDoc,
});

function BrutalColorsDoc() {
  return <ColorsDoc theme="brutal" />;
}
