import { MessageReferenceText, PreviewCard, PreviewCardContent, PreviewCardTrigger } from "raft-ui";

export function MessageReferencePeopleMentionsComposition() {
  return (
    <div className="text-sm text-foreground">
      Ask{" "}
      <PreviewCard>
        <PreviewCardTrigger
          closeDelay={120}
          delay={200}
          render={
            <MessageReferenceText render={<button type="button" title="Preview mention" />} />
          }
        >
          @Atlas
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
            <MessageReferenceText
              variant="primary"
              render={<button type="button" title="Preview current member" />}
            />
          }
        >
          @Ada
        </PreviewCardTrigger>
        <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[17.5rem]">
          <p>Ada · current workspace member</p>
        </PreviewCardContent>
      </PreviewCard>
      .
    </div>
  );
}
