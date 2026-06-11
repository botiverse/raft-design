import { createFileRoute } from "@tanstack/react-router";

import { ColorsDoc } from "#/routes/tokens/colors.tsx";

export const Route = createFileRoute("/tokens/colors/elegant")({
  component: ElegantColorsDoc,
});

function ElegantColorsDoc() {
  return <ColorsDoc theme="elegant" />;
}
