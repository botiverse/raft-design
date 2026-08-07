import {
  Button,
  ConversationPanelContent,
  Input,
  PanelHeader,
  PanelHeaderContent,
  PanelMeta,
  PanelTitle,
} from "raft-ui";
import {
  ActivityInboxControls,
  ActivityInboxItem,
  ActivityInboxItemBody,
  ActivityInboxItemContent,
  ActivityInboxItemHeading,
  ActivityInboxItemOpen,
  ActivityInboxItemSender,
  ActivityInboxItemTimestamp,
  ActivityInboxItemTitle,
  ActivityInboxItemTrailing,
  ActivityInboxList,
  ActivityInboxNavigationCount,
  ActivityInboxNavigationItem,
  ActivityInboxNavigationLabel,
  ActivityInboxPanel,
  ActivityInboxSelectionToolbar,
  ActivityInboxSidebar,
  ActivityInboxViewport,
} from "raft-ui/wip";

export function ActivityPreviewComposition() {
  return (
    <ActivityInboxPanel>
      <PanelHeader>
        <PanelHeaderContent>
          <PanelTitle render={<h2 />}>Activity</PanelTitle>
          <PanelMeta render={<p />}>Triage what needs attention</PanelMeta>
        </PanelHeaderContent>
      </PanelHeader>
      <div data-slot="activity-inbox-layout" className="flex min-h-0 flex-1">
        <ActivityInboxSidebar>
          <ActivityInboxNavigationItem active disabled>
            <ActivityInboxNavigationLabel>Active</ActivityInboxNavigationLabel>
            <ActivityInboxNavigationCount>2</ActivityInboxNavigationCount>
          </ActivityInboxNavigationItem>
        </ActivityInboxSidebar>
        <ConversationPanelContent render={<section />} data-slot="activity-inbox-main">
          <ActivityInboxControls>
            <Input aria-label="Search activity" placeholder="Search activity" disabled />
          </ActivityInboxControls>
          <ActivityInboxSelectionToolbar>
            <Button size="xs" disabled>
              Select all
            </Button>
          </ActivityInboxSelectionToolbar>
          <ActivityInboxViewport>
            <ActivityInboxList>
              <ActivityInboxItem data-unread="">
                <ActivityInboxItemOpen aria-label="Open activity" disabled />
                <ActivityInboxItemContent>
                  <ActivityInboxItemHeading>
                    <ActivityInboxItemTitle>Review the search proposal</ActivityInboxItemTitle>
                  </ActivityInboxItemHeading>
                  <ActivityInboxItemBody>
                    <ActivityInboxItemSender>Mina</ActivityInboxItemSender> mentioned you in
                    #design.
                  </ActivityInboxItemBody>
                </ActivityInboxItemContent>
                <ActivityInboxItemTrailing>
                  <ActivityInboxItemTimestamp>5m</ActivityInboxItemTimestamp>
                </ActivityInboxItemTrailing>
              </ActivityInboxItem>
            </ActivityInboxList>
          </ActivityInboxViewport>
        </ConversationPanelContent>
      </div>
    </ActivityInboxPanel>
  );
}
