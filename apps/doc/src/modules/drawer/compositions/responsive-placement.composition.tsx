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
  Field,
  FieldDescription,
  FieldLabel,
  Input,
  Textarea,
} from "@botiverse/raft-ui";
import { useMediaQuery } from "foxact/use-media-query";

const PLACEHOLDER_NOTES = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris.",
  "Donec nec justo eget felis facilisis fermentum. Aliquam porttitor mauris sit amet orci. Aenean dignissim pellentesque felis. Morbi in sem quis dui placerat ornare.",
] as const;

export function DrawerResponsivePlacementComposition() {
  const isMobile = useMediaQuery("(max-width: 767px)", false);
  const swipeDirection = isMobile ? "down" : "right";

  return (
    <Drawer swipeDirection={swipeDirection}>
      <DrawerTrigger render={<Button variant="primary" />}>Open details</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit profile</DrawerTitle>
          {swipeDirection === "right" ? <DrawerClose /> : null}
        </DrawerHeader>
        <DrawerBody className="min-h-0 w-full items-stretch overflow-y-auto overscroll-contain text-left">
          <DrawerDescription className="text-left">
            Desktop opens from the right. Below md it switches to a bottom sheet. Scroll the body to
            verify longer form content.
          </DrawerDescription>
          <div className="mt-6 grid w-full gap-4">
            <Field>
              <FieldLabel htmlFor="drawer-responsive-name" required>
                Display name
              </FieldLabel>
              <Input id="drawer-responsive-name" defaultValue="Alex Rivera" />
            </Field>
            <Field>
              <FieldLabel htmlFor="drawer-responsive-email" required>
                Email
              </FieldLabel>
              <Input id="drawer-responsive-email" type="email" defaultValue="alex@example.com" />
            </Field>
            <Field>
              <FieldLabel htmlFor="drawer-responsive-title" optional>
                Title
              </FieldLabel>
              <Input id="drawer-responsive-title" defaultValue="Design engineer" />
              <FieldDescription>Shown on your profile and in mentions.</FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="drawer-responsive-location" optional>
                Location
              </FieldLabel>
              <Input id="drawer-responsive-location" defaultValue="San Francisco, CA" />
            </Field>
            <Field>
              <FieldLabel htmlFor="drawer-responsive-website" optional>
                Website
              </FieldLabel>
              <Input id="drawer-responsive-website" defaultValue="https://example.com" />
            </Field>
            <Field>
              <FieldLabel htmlFor="drawer-responsive-bio" optional>
                Bio
              </FieldLabel>
              <Textarea
                id="drawer-responsive-bio"
                className="min-h-28"
                defaultValue="Open Raft as a fullscreen app — faster, more focused. Prefer short updates and clear handoffs."
              />
            </Field>
            <div className="stack-y-3 text-sm leading-6 text-foreground/70">
              {PLACEHOLDER_NOTES.map((paragraph) => (
                <p key={paragraph.slice(0, 24)}>{paragraph}</p>
              ))}
            </div>
          </div>
        </DrawerBody>
        <DrawerFooter>
          <DrawerActions>
            <DrawerClose render={<Button variant="primary" />}>Save</DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>Cancel</DrawerClose>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
