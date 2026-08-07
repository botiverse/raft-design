import {
  Panel,
  type PanelEdge,
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
} from "raft-ui";

export type PanelCompositionProps = {
  edge?: PanelEdge;
};

export function PanelComposition({ edge = "inset" }: PanelCompositionProps = {}) {
  return (
    <Panel edge={edge} className="flex size-full min-h-0  flex-col bg-layer-panel">
      <PanelHeader className="border-b border-line">
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
              <Text.Mono render={<h3 aria-label="Description" />} size="eyebrow">
                Description
              </Text.Mono>
              <Text.Sans className="mt-2" color="muted" size="small">
                Shared workspace for product, design, and engineering coordination.
              </Text.Sans>
            </PanelSection>

            <PanelSection>
              <Text.Mono render={<h3 aria-label="Access" />} size="eyebrow">
                Access
              </Text.Mono>
              <Text.Sans className="mt-2" size="small">
                Everyone in the organization can view this workspace.
              </Text.Sans>
            </PanelSection>

            <PanelSection>
              <Text.Mono render={<h3 aria-label="Retention" />} size="eyebrow">
                Retention
              </Text.Mono>
              <Text.Sans className="mt-2" size="small">
                Messages and files are retained for one year.
              </Text.Sans>
            </PanelSection>

            <PanelSection>
              <Text.Mono render={<h3 aria-label="Guest access" />} size="eyebrow">
                Guest access
              </Text.Mono>
              <Text.Sans className="mt-2" size="small">
                Guests can view channels they have been invited to.
              </Text.Sans>
            </PanelSection>

            <PanelSection>
              <Text.Mono render={<h3 aria-label="File uploads" />} size="eyebrow">
                File uploads
              </Text.Mono>
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
