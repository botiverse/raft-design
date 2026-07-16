import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogBody,
  AlertDialogCancel,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Banner,
  BannerDescription,
} from "raft-ui";
import { CircleAlert } from "lucide-react";

export function ChatSidebarArchiveDialog({
  channelName,
  onOpenChange,
}: {
  channelName: string | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={channelName !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Channel</AlertDialogTitle>
          <AlertDialogClose />
        </AlertDialogHeader>
        <AlertDialogBody>
          <Banner status="warning">
            <CircleAlert />
            <BannerDescription>
              Archive "{channelName}"? Members keep read access and history, but writes will be
              frozen and the channel will be hidden from sidebars. You can unarchive it later.
            </BannerDescription>
          </Banner>
        </AlertDialogBody>
        <AlertDialogFooter>
          <AlertDialogCancel size="md">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="warning" size="md">
            Archive Channel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
