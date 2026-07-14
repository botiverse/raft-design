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
  type DrawerProps,
} from "raft-ui";

const SNAP_POINTS: NonNullable<DrawerProps["snapPoints"]> = [0.4, 0.75];

export function DrawerSnapPointsComposition() {
  return (
    <Drawer snapPoints={SNAP_POINTS} defaultSnapPoint={SNAP_POINTS[0]}>
      <DrawerTrigger render={<Button variant="primary" />}>Open resizable drawer</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Review changes</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <DrawerDescription>
            Drag the handle to resize the drawer between its compact and expanded snap points.
          </DrawerDescription>
          <div className="mt-6 w-full space-y-3 text-left text-sm leading-6 text-foreground-muted">
            <p>3 files changed</p>
            <p>12 additions, 4 deletions</p>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerActions>
            <DrawerClose render={<Button variant="primary" />}>Review</DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
