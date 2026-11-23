import {
  Button,
  Drawer,
  DrawerActions,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@botiverse/raft-ui";

// A content-sized bottom sheet, with no snap points: as tall as what it holds,
// and still with the grab handle at its top edge, which DrawerContent draws.
export function DrawerBottomSheetComposition() {
  return (
    <Drawer swipeDirection="down">
      <DrawerTrigger render={<Button variant="primary" />}>Open sheet</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Pin this channel?</DrawerTitle>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerActions>
            <DrawerClose render={<Button variant="ghost" size="lg" />}>Cancel</DrawerClose>
            <Button variant="primary" size="lg">
              Pin channel
            </Button>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
