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
  type DrawerProps,
} from "raft-ui";

export type DrawerPreviewProps = Pick<DrawerProps, "swipeDirection"> & {
  triggerLabel: string;
};

export function DrawerPreview({ swipeDirection, triggerLabel }: DrawerPreviewProps) {
  const showCornerClose = swipeDirection === "left" || swipeDirection === "right";

  return (
    <Drawer swipeDirection={swipeDirection}>
      <DrawerTrigger render={<Button variant="primary" />}>{triggerLabel}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Leave channel?</DrawerTitle>
          {showCornerClose ? <DrawerClose /> : null}
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
        <DrawerFooter>
          <DrawerActions>
            <DrawerClose render={<Button variant="danger" />}>Leave</DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
