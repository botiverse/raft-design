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
          <Drawer swipeDirection={swipeDirection}>
            <DrawerTrigger render={<Button className="mt-6" variant="outline" />}>
              Open nested drawer
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Nested drawer</DrawerTitle>
                {showCornerClose ? <DrawerClose /> : null}
              </DrawerHeader>
              <DrawerBody>
                <DrawerDescription>
                  This drawer was opened from inside another drawer.
                </DrawerDescription>
                <Drawer swipeDirection={swipeDirection}>
                  <DrawerTrigger render={<Button className="mt-6" variant="outline" />}>
                    Open another drawer
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader>
                      <DrawerTitle>Third drawer</DrawerTitle>
                      {showCornerClose ? <DrawerClose /> : null}
                    </DrawerHeader>
                    <DrawerBody>
                      <DrawerDescription>
                        This is the second nested level in the drawer stack.
                      </DrawerDescription>
                    </DrawerBody>
                    <DrawerFooter>
                      <DrawerActions>
                        <DrawerClose render={<Button variant="primary" />}>Done</DrawerClose>
                      </DrawerActions>
                    </DrawerFooter>
                  </DrawerContent>
                </Drawer>
              </DrawerBody>
              <DrawerFooter>
                <DrawerActions>
                  <DrawerClose render={<Button variant="primary" />}>Done</DrawerClose>
                </DrawerActions>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
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

const SIDE_FULL_WIDTH_LOREM = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.",
  "Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis. Morbi in sem quis dui placerat ornare. Pellentesque odio nisi, euismod in, pharetra a, ultricies in, diam.",
  "Sed arcu. Cras consequat. Praesent dapibus, neque id cursus faucibus, tortor neque egestas augue, eu vulputate magna eros eu erat. Aliquam erat volutpat. Nam dui mi, tincidunt quis, accumsan porttitor, facilisis luctus, metus.",
  "Phasellus ultrices nulla quis nibh. Quisque a lectus. Donec consectetuer ligula vulputate sem tristique cursus. Nam nulla quam, gravida non, commodo a, sodales sit amet, nisi. Pellentesque fermentum dolor.",
  "Aliquam quam lectus, facilisis auctor, ultrices ut, elementum vulputate, nunc. Sed adipiscing ornare risus. Morbi est est, blandit sit amet, sagittis vel, euismod vel, velit. Pellentesque egestas sem.",
  "Suspendisse nisl elit, rhoncus eget, elementum ac, condimentum eget, diam. Nam at tortor in tellus interdum sagittis. Vestibulum fringilla pede sit amet augue. In turpis. Pellentesque posuere.",
  "Maecenas malesuada. Praesent congue erat at massa. Sed cursus turpis vitae tortor. Donec posuere vulputate arcu. Phasellus accumsan cursus velit. Vestibulum ante ipsum primis in faucibus orci luctus.",
  "Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem.",
  "Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante. Etiam sit amet orci eget eros faucibus tincidunt. Duis leo. Sed fringilla mauris sit amet nibh.",
  "Donec sodales sagittis magna. Sed consequat, leo eget bibendum sodales, augue velit cursus nunc, quis gravida magna mi a libero. Fusce vulputate eleifend sapien. Vestibulum purus quam, scelerisque ut.",
] as const;

export function DrawerSideFullWidthUsage() {
  return (
    <Drawer swipeDirection="left">
      <DrawerTrigger render={<Button variant="primary" />}>Open side drawer</DrawerTrigger>
      <DrawerContent className="max-md:right-3 max-md:w-auto max-md:max-w-none">
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerClose />
        </DrawerHeader>
        <DrawerBody className="min-h-0 overflow-y-auto overscroll-contain">
          <DrawerDescription>
            On small screens the panel spans the floating inset. From md up it keeps the default
            narrow side width. Scroll the body to verify long content.
          </DrawerDescription>
          <div className="mt-6 w-full space-y-4 text-left text-sm leading-6 text-foreground/70">
            {SIDE_FULL_WIDTH_LOREM.map((paragraph) => (
              <p key={paragraph.slice(0, 24)}>{paragraph}</p>
            ))}
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerActions>
            <DrawerClose render={<Button variant="primary" />}>Apply</DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>Reset</DrawerClose>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
