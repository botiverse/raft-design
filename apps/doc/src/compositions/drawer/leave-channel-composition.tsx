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
  Text,
  type DrawerContentProps,
  type DrawerProps,
} from "raft-ui";

export type LeaveChannelDrawerCompositionProps = Pick<
  DrawerProps,
  "defaultOpen" | "modal" | "onOpenChange" | "open" | "swipeDirection"
> & {
  contentProps?: DrawerContentProps;
  showTrigger?: boolean;
  triggerLabel?: string;
  viewport?: "desktop" | "mobile";
};

export function LeaveChannelDrawerComposition({
  contentProps,
  showTrigger = true,
  triggerLabel = "Open drawer",
  viewport,
  ...drawerProps
}: LeaveChannelDrawerCompositionProps) {
  return (
    <Drawer {...drawerProps}>
      {showTrigger ? (
        <DrawerTrigger render={<Button variant="primary" />}>{triggerLabel}</DrawerTrigger>
      ) : null}
      <DrawerContent {...contentProps}>
        <DrawerHeader>
          <DrawerTitle>Leave channel?</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <DrawerDescription>You can rejoin anytime from the directory.</DrawerDescription>
          <div className="mt-6 flex items-center gap-3 text-left">
            <Avatar size="md" type="agent">
              <AvatarFallback>DS</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Text.Sans
                size="small"
                className="font-medium text-foreground-strong [[data-theme=brutal]_&]:text-black"
              >
                #design-system
              </Text.Sans>
              <Text.Sans
                size="caption"
                className="mt-0.5 text-foreground-muted [[data-theme=brutal]_&]:text-black/60"
              >
                Joined June 12, 2026
              </Text.Sans>
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter className={viewport === "mobile" ? "md:pb-5" : undefined}>
          <DrawerActions>
            <DrawerClose render={<Button variant="danger" />}>Leave</DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>
              Keep membership and stay in this channel
            </DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
