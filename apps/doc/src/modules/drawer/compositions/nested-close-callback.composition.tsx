import { useState } from "react";
import { createToastManager, ToastProvider } from "raft-ui";

import { MemberDetailsDrawer } from "./workspace-settings/member-details-drawer.tsx";
import { RemoveMemberDrawer } from "./workspace-settings/remove-member-drawer.tsx";
import { WorkspaceSettingsDrawer } from "./workspace-settings/workspace-settings-drawer.tsx";

export function DrawerNestedCloseCallbackComposition() {
  const [toastManager] = useState(() => createToastManager());
  const [memberDetailsOpen, setMemberDetailsOpen] = useState(false);
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);

  const notifyClosed = (title: string) => {
    toastManager.add({ title, type: "info" });
  };

  return (
    <ToastProvider
      toastManager={toastManager}
      timeout={2400}
      limit={3}
      viewportPlacement="top-center"
    >
      <WorkspaceSettingsDrawer
        onOpenChangeComplete={(open) => {
          if (!open) notifyClosed("Workspace settings closed");
        }}
      >
        <MemberDetailsDrawer
          open={memberDetailsOpen}
          onOpenChange={setMemberDetailsOpen}
          onOpenChangeComplete={(open) => {
            if (!open) notifyClosed("Member details closed");
          }}
        >
          <RemoveMemberDrawer
            open={removeMemberOpen}
            onOpenChange={setRemoveMemberOpen}
            onOpenChangeComplete={(open) => {
              if (!open) notifyClosed("Remove member closed");
            }}
            onRemove={() => {
              setRemoveMemberOpen(false);
              setMemberDetailsOpen(false);
            }}
          />
        </MemberDetailsDrawer>
      </WorkspaceSettingsDrawer>
    </ToastProvider>
  );
}
