import { Text } from "raft-ui";

export function TextSemanticElementsComposition() {
  return (
    <dl className="grid w-full max-w-sm grid-cols-[auto_1fr] gap-x-4 gap-y-2">
      <Text.Mono render={<dt />} size="meta" variant="muted">
        Format
      </Text.Mono>
      <Text.Sans render={<dd />} size="small">
        Plain text
      </Text.Sans>
      <Text.Mono render={<dt />} size="meta" variant="muted">
        Encoding
      </Text.Mono>
      <Text.Sans render={<dd />} size="small">
        UTF-8
      </Text.Sans>
    </dl>
  );
}
