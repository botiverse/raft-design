import { AtSign } from "lucide-react";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger } from "raft-ui";
import { MessageReference } from "raft-ui/wip";

export function MessageReferencePeopleMentionsComposition() {
  return (
    <p className="text-sm text-foreground">
      Ask{" "}
      <PreviewCard>
        <PreviewCardTrigger
          closeDelay={120}
          delay={200}
          render={
            <MessageReference
              variant="mention"
              render={<button type="button" title="Preview mention" />}
            />
          }
        >
          <AtSign size={12} />
          Atlas
        </PreviewCardTrigger>
        <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[17.5rem]">
          <p>Atlas · owner</p>
        </PreviewCardContent>
      </PreviewCard>{" "}
      to review the handoff with{" "}
      <PreviewCard>
        <PreviewCardTrigger
          closeDelay={120}
          delay={200}
          render={
            <MessageReference
              variant="self"
              render={<button type="button" title="Preview current member" />}
            />
          }
        >
          <AtSign size={12} />
          you
        </PreviewCardTrigger>
        <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[17.5rem]">
          <p>You · Current workspace member</p>
        </PreviewCardContent>
      </PreviewCard>
      .
    </p>
  );
}
