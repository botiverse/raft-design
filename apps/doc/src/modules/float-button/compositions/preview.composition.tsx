import { MessageSquare } from "lucide-react";
import { FloatButton } from "raft-ui";

export function FloatButtonPreviewContent() {
  return (
    <FloatButton
      position="relative"
      variant="primary"
      shape="circle"
      size="md"
      icon={<MessageSquare />}
      aria-label="Feedback"
    />
  );
}
