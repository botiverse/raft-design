import { Kbd, KbdGroup, Text } from "@botiverse/raft-ui";

export function KbdGroupContent() {
  return (
    <Text.Sans size="small">
      On the Windows runner, press{" "}
      <KbdGroup aria-hidden="true">
        <Kbd>Ctrl</Kbd>
        <Kbd>Alt</Kbd>
        <Kbd>Del</Kbd>
      </KbdGroup>
      <span className="sr-only">Control Alt Delete</span> to sign in.
    </Text.Sans>
  );
}
