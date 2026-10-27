import {
  Avatar,
  AvatarFallback,
  AvatarGroupCount,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@botiverse/raft-ui";
import { AvatarGroupButton, PopoverBody } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function AvatarGroupButtonContent() {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <AvatarGroupButton aria-label="Martin viewing, Bugen writing, Wug and 2 others read this version" />
        }
      >
        <Avatar size="xs" type="human">
          <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <Avatar size="xs" type="agent" />
        <Avatar size="xs" type="agent" />
        <AvatarGroupCount size="xs">+2</AvatarGroupCount>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" aria-label="Who's here">
        <PopoverBody>
          <ul className="flex min-w-48 flex-col gap-1.5 text-callout">
            <li>Martin viewing</li>
            <li>Bugen writing</li>
            <li>Wug read this version</li>
            <li>Atlas read this version</li>
            <li>Niko read this version</li>
          </ul>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}

// @docs-source-strip-start
export function AvatarGroupButtonComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <AvatarGroupButtonContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
