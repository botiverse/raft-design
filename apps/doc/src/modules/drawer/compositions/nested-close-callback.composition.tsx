import { useCallback, useState } from "react";
import { createToastManager, ToastProvider } from "raft-ui";

import { MemberDetailsDrawer } from "./workspace-settings/member-details-drawer.tsx";
import { RemoveMemberDrawer } from "./workspace-settings/remove-member-drawer.tsx";
import { WorkspaceSettingsDrawer } from "./workspace-settings/workspace-settings-drawer.tsx";

export function DrawerNestedCloseCallbackComposition() {
  const [toastManager] = useState(() => createToastManager());
  const [memberDetailsOpen, setMemberDetailsOpen] = useState(false);
  const [removeMemberOpen, setRemoveMemberOpen] = useState(false);

  const notifyClosed = useCallback(
    (title: string) => {
      toastManager.add({ title, type: "info" });
    },
    [toastManager],
  );

  const handleWorkspaceSettingsOpenChangeComplete = useCallback(
    (open: boolean) => {
      if (!open) notifyClosed("Workspace settings closed");
    },
    [notifyClosed],
  );

  const handleMemberDetailsOpenChangeComplete = useCallback(
    (open: boolean) => {
      if (!open) notifyClosed("Member details closed");
    },
    [notifyClosed],
  );

  const handleRemoveMemberOpenChangeComplete = useCallback(
    (open: boolean) => {
      if (!open) notifyClosed("Remove member closed");
    },
    [notifyClosed],
  );

  const handleRemove = useCallback(() => {
    setRemoveMemberOpen(false);
    setMemberDetailsOpen(false);
  }, []);

  return (
    <ToastProvider
      toastManager={toastManager}
      timeout={2400}
      limit={3}
      viewportPlacement="top-center"
    >
      <WorkspaceSettingsDrawer onOpenChangeComplete={handleWorkspaceSettingsOpenChangeComplete}>
        <MemberDetailsDrawer
          open={memberDetailsOpen}
          onOpenChange={setMemberDetailsOpen}
          onOpenChangeComplete={handleMemberDetailsOpenChangeComplete}
        >
          <RemoveMemberDrawer
            open={removeMemberOpen}
            onOpenChange={setRemoveMemberOpen}
            onOpenChangeComplete={handleRemoveMemberOpenChangeComplete}
            onRemove={handleRemove}
          />
        </MemberDetailsDrawer>
      </WorkspaceSettingsDrawer>
    </ToastProvider>
  );
}
