import type { CSSProperties } from "react";
import {
  Button,
  Drawer,
  DrawerActions,
  DrawerBody,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  type DrawerProps,
} from "raft-ui";

const EXPANDED_HEIGHT = "24rem";
const SNAP_POINTS = ["8rem", EXPANDED_HEIGHT] satisfies NonNullable<DrawerProps["snapPoints"]>;
const SNAP_CONTENT_STYLE = {
  "--drawer-content-height": EXPANDED_HEIGHT,
} as CSSProperties;

export function DrawerSnapPointsComposition() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Drawer swipeDirection="down" snapPoints={SNAP_POINTS} defaultSnapPoint={SNAP_POINTS[0]}>
        <DrawerTrigger render={<Button variant="primary" />}>
          Open bottom notification
        </DrawerTrigger>
        <DrawerContent style={SNAP_CONTENT_STYLE}>
          <DrawerHeader className="py-3">
            <DrawerTitle>Release ready</DrawerTitle>
            <DrawerDescription>raft-ui 0.0.21 passed all release checks.</DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <dl className="mt-6 grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-left text-sm leading-6">
              <dt className="text-foreground-muted">Owner</dt>
              <dd className="text-foreground-strong">Maya Chen</dd>
              <dt className="text-foreground-muted">Due</dt>
              <dd className="text-foreground-strong">July 16, 2026</dd>
              <dt className="text-foreground-muted">Checklist</dt>
              <dd className="text-foreground-strong">3 of 5 complete</dd>
            </dl>
            <DrawerActions className="mt-6">
              <DrawerClose render={<Button variant="primary" />}>Dismiss notification</DrawerClose>
            </DrawerActions>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
      <Drawer swipeDirection="up" snapPoints={SNAP_POINTS} defaultSnapPoint={SNAP_POINTS[0]}>
        <DrawerTrigger render={<Button variant="primary" />}>Open top notification</DrawerTrigger>
        <DrawerContent style={SNAP_CONTENT_STYLE}>
          <DrawerBody>
            <dl className="grid w-full grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-left text-sm leading-6">
              <dt className="text-foreground-muted">Owner</dt>
              <dd className="text-foreground-strong">Maya Chen</dd>
              <dt className="text-foreground-muted">Due</dt>
              <dd className="text-foreground-strong">July 16, 2026</dd>
              <dt className="text-foreground-muted">Checklist</dt>
              <dd className="text-foreground-strong">3 of 5 complete</dd>
            </dl>
            <DrawerActions className="mt-6">
              <DrawerClose render={<Button variant="primary" />}>Dismiss notification</DrawerClose>
            </DrawerActions>
          </DrawerBody>
          <DrawerHeader className="py-3">
            <DrawerTitle>Release ready</DrawerTitle>
            <DrawerDescription>raft-ui 0.0.21 passed all release checks.</DrawerDescription>
          </DrawerHeader>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
