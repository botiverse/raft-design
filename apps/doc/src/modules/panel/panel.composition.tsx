import {
  Panel,
  PanelBody,
  PanelHeader,
  PanelHeaderContent,
  PanelHeading,
  PanelMeta,
  PanelScrollContent,
  PanelScrollViewport,
  PanelSection,
  PanelTitle,
  Text,
} from "@botiverse/raft-ui";
import type { PanelEdge } from "@botiverse/raft-ui";

export type PanelCompositionProps = {
  edge?: PanelEdge;
};

export function PanelComposition({ edge = "inset" }: PanelCompositionProps = {}) {
  return (
    <Panel edge={edge} className="flex size-full min-h-0  flex-col bg-layer-canvas">
      <PanelHeader className="border-b border-line-seam">
        <PanelHeaderContent>
          <PanelHeading>
            <PanelTitle>Workspace overview</PanelTitle>
          </PanelHeading>
          <PanelMeta>Botiverse</PanelMeta>
        </PanelHeaderContent>
      </PanelHeader>

      <PanelBody>
        <PanelScrollViewport>
          <PanelScrollContent>
            <PanelSection>
              <Text.Sans render={<h3 />} size="group">
                Description
              </Text.Sans>
              <Text.Sans className="mt-2" color="muted" size="small">
                Shared workspace for product, design, and engineering coordination.
              </Text.Sans>
            </PanelSection>

            <PanelSection>
              <Text.Sans render={<h3 />} size="group">
                Access
              </Text.Sans>
              <Text.Sans className="mt-2" size="small">
                Everyone in the organization can view this workspace.
              </Text.Sans>
            </PanelSection>

            <PanelSection>
              <Text.Sans render={<h3 />} size="group">
                Retention
              </Text.Sans>
              <Text.Sans className="mt-2" size="small">
                Messages and files are retained for one year.
              </Text.Sans>
            </PanelSection>

            <PanelSection>
              <Text.Sans render={<h3 />} size="group">
                Guest access
              </Text.Sans>
              <Text.Sans className="mt-2" size="small">
                Guests can view channels they have been invited to.
              </Text.Sans>
            </PanelSection>

            <PanelSection>
              <Text.Sans render={<h3 />} size="group">
                File uploads
              </Text.Sans>
              <Text.Sans className="mt-2" size="small">
                Workspace members can upload and share files.
              </Text.Sans>
            </PanelSection>
          </PanelScrollContent>
        </PanelScrollViewport>
      </PanelBody>
    </Panel>
  );
}
