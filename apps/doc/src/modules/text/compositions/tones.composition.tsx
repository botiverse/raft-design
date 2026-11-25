import { Text } from "@botiverse/raft-ui";

export function TextTonesComposition() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-1">
      <Text.Sans variant="success">Deployed to production</Text.Sans>
      <Text.Sans variant="warning">A person's message waited 2m</Text.Sans>
      <Text.Sans variant="danger">Deleting the channel can't be undone</Text.Sans>
      <Text.Sans variant="information">Synced 3 minutes ago</Text.Sans>
      <Text.Sans variant="accent">2 new comments</Text.Sans>
      <Text.Sans variant="primary">Raft Yellow</Text.Sans>
    </div>
  );
}
