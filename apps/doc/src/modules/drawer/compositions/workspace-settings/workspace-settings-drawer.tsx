import type { ReactNode } from "react";
import {
  Button,
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@botiverse/raft-ui";
import type { DrawerProps } from "@botiverse/raft-ui";

type WorkspaceSettingsDrawerProps = Pick<DrawerProps, "onOpenChangeComplete"> & {
  children: ReactNode;
};

export function WorkspaceSettingsDrawer({
  children,
  onOpenChangeComplete,
}: WorkspaceSettingsDrawerProps) {
  return (
    <Drawer onOpenChangeComplete={onOpenChangeComplete}>
      <DrawerTrigger render={<Button variant="primary" />}>Manage workspace</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Workspace settings</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <DrawerDescription>
            Manage the workspace profile, access, and members for Acme Design.
          </DrawerDescription>

          <div className="mt-6 rounded-lg border border-line-hairline bg-layer-canvas px-4 py-3 text-left">
            <p className="truncate text-sm font-medium text-foreground">Acme Design</p>
            <p className="mt-1 text-xs text-foreground-muted">Pro plan · 12 members</p>
          </div>

          <div className="mt-6 text-left">
            <p className="text-xs font-medium text-foreground-muted">Members</p>
            {children}
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerActions>
            <DrawerClose render={<Button variant="outline" />}>Close settings</DrawerClose>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
