import { UserMinus } from "lucide-react";
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

type RemoveMemberDrawerProps = Pick<
  DrawerProps,
  "onOpenChange" | "onOpenChangeComplete" | "open"
> & {
  onRemove: () => void;
};

export function RemoveMemberDrawer({
  onOpenChange,
  onOpenChangeComplete,
  onRemove,
  open,
}: RemoveMemberDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} onOpenChangeComplete={onOpenChangeComplete}>
      <DrawerTrigger render={<Button variant="danger-outline" className="w-full" />}>
        <UserMinus aria-hidden />
        Remove member…
      </DrawerTrigger>

      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Remove Alex Rivera?</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <DrawerDescription>
            Alex will lose access to Acme Design and its private channels. Their messages and shared
            files will remain.
          </DrawerDescription>
        </DrawerBody>
        <DrawerFooter>
          <DrawerActions>
            <DrawerClose render={<Button variant="danger" />} onClick={onRemove}>
              Remove member
            </DrawerClose>
            <DrawerClose render={<Button variant="outline" />}>Keep member</DrawerClose>
          </DrawerActions>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
