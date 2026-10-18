import { createFileRoute, Outlet } from "@tanstack/react-router";

import { ProposalShell } from "#/proposal/shell.tsx";

// Proposal mock (B3) of the redesigned site, under /proposal so the current
// site stays reachable for comparison. See apps/doc/PROPOSAL.md.
export const Route = createFileRoute("/proposal")({
  ssr: false,
  staticData: { standalone: true },
  component: () => (
    <ProposalShell>
      <Outlet />
    </ProposalShell>
  ),
});
