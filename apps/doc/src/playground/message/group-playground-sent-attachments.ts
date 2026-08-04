import type { PlaygroundMessageAttachment } from "../mock/index.ts";

type PlaygroundSentAttachmentRun =
  | {
      kind: "card-group";
      attachments: [PlaygroundMessageAttachment, ...PlaygroundMessageAttachment[]];
    }
  | { kind: "standalone"; attachment: PlaygroundMessageAttachment };

export function groupPlaygroundSentAttachments(
  attachments: readonly PlaygroundMessageAttachment[],
) {
  const runs: PlaygroundSentAttachmentRun[] = [];

  for (const attachment of attachments) {
    if (isStandaloneMediaAttachment(attachment)) {
      runs.push({ kind: "standalone", attachment });
      continue;
    }

    const previousRun = runs.at(-1);
    if (previousRun?.kind === "card-group") {
      previousRun.attachments.push(attachment);
    } else {
      runs.push({ kind: "card-group", attachments: [attachment] });
    }
  }

  return runs;
}

function isStandaloneMediaAttachment(attachment: PlaygroundMessageAttachment) {
  if (attachment.mediaType.startsWith("video/")) {
    return (
      attachment.state.kind === "failed" ||
      (attachment.state.kind === "ready" && Boolean(attachment.state.previewUrl))
    );
  }

  return (
    attachment.mediaType.startsWith("image/") &&
    attachment.state.kind === "ready" &&
    Boolean(attachment.state.previewUrl)
  );
}
