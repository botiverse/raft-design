import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
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

type MemberDetailsDrawerProps = Pick<
  DrawerProps,
  "onOpenChange" | "onOpenChangeComplete" | "open"
> & {
  children: ReactNode;
};

export function MemberDetailsDrawer({
  children,
  onOpenChange,
  onOpenChangeComplete,
  open,
}: MemberDetailsDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
      <DrawerTrigger
        render={
          <Button
            variant="outline"
            className="mt-2 h-auto w-full justify-start gap-3 px-3 py-3 text-left"
          />
        }
      >
        <Avatar size="sm" type="agent">
          <AvatarFallback>AR</AvatarFallback>
        </Avatar>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">Alex Rivera</span>
          <span className="block truncate text-xs font-normal text-foreground-muted">
            alex@acme.design
          </span>
        </span>
        <ChevronRight aria-hidden className="size-4 shrink-0 text-foreground-hint" />
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Member details</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <DrawerDescription>
            Review Alex Rivera's workspace access before making changes.
          </DrawerDescription>

          <div className="mt-6 flex min-w-0 items-center gap-3 text-left">
            <Avatar size="md" type="agent">
              <AvatarFallback>AR</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">Alex Rivera</p>
              <p className="truncate text-xs text-foreground-muted">alex@acme.design</p>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 border-y border-line-hairline py-4 text-left text-sm">
            <dt className="text-foreground-muted">Role</dt>
            <dd className="truncate text-right font-medium text-foreground">Editor</dd>
            <dt className="text-foreground-muted">Joined</dt>
            <dd className="truncate text-right font-medium text-foreground">June 12, 2026</dd>
          </dl>

          <div className="mt-6">{children}</div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerActions>
            <DrawerClose render={<Button variant="outline" />}>Back to workspace</DrawerClose>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
