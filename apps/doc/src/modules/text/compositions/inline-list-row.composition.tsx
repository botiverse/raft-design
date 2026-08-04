import { Text } from "raft-ui";

export function TextInlineListRowComposition() {
  return (
    <div className="flex w-full max-w-sm min-w-0 items-center gap-4">
      <Text.Sans render={<span />} size="small" className="min-w-0 flex-1 truncate">
        Example document with a long descriptive name.txt
      </Text.Sans>
      <Text.Mono render={<span />} size="meta" variant="muted" className="shrink-0 text-right">
        24 KB
      </Text.Mono>
    </div>
  );
}
