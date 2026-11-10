import { Download, MessageSquare, X } from "lucide-react";
import {
  Badge,
  Button,
  Lightbox,
  LightboxActions,
  LightboxClose,
  LightboxContent,
  LightboxHeaderMeta,
  LightboxTitle,
  LightboxToolbar,
  LightboxTrigger,
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@botiverse/raft-ui";
import { PopoverBody } from "@botiverse/raft-ui/wip";

export function DocumentPreviewShellComposition() {
  return (
    <Lightbox modal="trap-focus">
      <LightboxTrigger render={<Button type="button" variant="default" />}>
        Open document preview
      </LightboxTrigger>
      <LightboxContent render={<section aria-label="Document preview" />}>
        <LightboxToolbar>
          <LightboxHeaderMeta title="q3-report.md · Markdown">
            <Badge variant="primary">Markdown</Badge>
            <LightboxTitle>q3-report.md</LightboxTitle>
          </LightboxHeaderMeta>
          <LightboxActions>
            <Popover>
              <PopoverTrigger
                render={<Button type="button" variant="default" size="icon-md" />}
                aria-label="Comments"
              >
                <MessageSquare />
              </PopoverTrigger>
              <PopoverContent align="end">
                <PopoverBody>
                  <PopoverTitle>Comments</PopoverTitle>
                  <PopoverDescription>No comments on this file yet.</PopoverDescription>
                </PopoverBody>
              </PopoverContent>
            </Popover>
            <Tooltip>
              <TooltipTrigger
                render={<Button type="button" variant="default" size="icon-md" />}
                aria-label="Download"
              >
                <Download />
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
            <LightboxClose
              aria-label="Close"
              render={<Button type="button" variant="default" size="icon-md" />}
            >
              <X />
            </LightboxClose>
          </LightboxActions>
        </LightboxToolbar>
        <ScrollArea
          className="pointer-events-auto min-h-0 flex-1 bg-layer-canvas"
          contentClassName="mx-auto max-w-2xl px-6 py-8 stack-y-6"
        >
          <article className="stack-y-2">
            <h2 className="text-headline font-bold text-foreground">Summary</h2>
            <p className="text-body text-foreground-muted">
              Weekly active teams grew 12% over the quarter, led by teams that invited an agent in
              their first week. Retention at 30 days held at 81%, the same as the quarter before,
              while the number of teams doubled.
            </p>
          </article>
          <article className="stack-y-2">
            <h2 className="text-headline font-bold text-foreground">Activation</h2>
            <p className="text-body text-foreground-muted">
              Teams that connected a repository on their first day sent three times as many messages
              in their second week as teams that didn't. The step to connect one now comes before
              the first channel is created, and half of new teams take it.
            </p>
          </article>
          <article className="stack-y-2">
            <h2 className="text-headline font-bold text-foreground">Retention</h2>
            <p className="text-body text-foreground-muted">
              Teams of one or two people who never opened a thread made up most of the churn. A
              prompt to reply in a thread after the first mention is in testing with a tenth of new
              teams, and early numbers point to fewer of them leaving.
            </p>
          </article>
          <article className="stack-y-2">
            <h2 className="text-headline font-bold text-foreground">Support</h2>
            <p className="text-body text-foreground-muted">
              Questions about billing fell by a third after seats were shown on the plan page. Most
              remaining tickets ask how to move a channel between servers, which the next release
              answers in the channel's settings.
            </p>
          </article>
          <article className="stack-y-2">
            <h2 className="text-headline font-bold text-foreground">Next quarter</h2>
            <p className="text-body text-foreground-muted">
              Ship shared drafts, bring file comments to the phone, and count seats at the end of
              each month instead of at each change, so a team that adds and removes a guest in a
              week isn't billed for them.
            </p>
          </article>
        </ScrollArea>
      </LightboxContent>
    </Lightbox>
  );
}
