export const MESSAGE_FIXTURE_AVATAR_SRC = "/avatars/message-sender.jpg";

/** Same-origin JPEG so preview and download actions resolve to the same real asset. */
export const MESSAGE_FIXTURE_IMAGE_SRC = MESSAGE_FIXTURE_AVATAR_SRC;

/** Tiny valid WAV data URI shared by the playable preview and download fixture. */
export const MESSAGE_FIXTURE_AUDIO_SRC =
  "data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAJUK6xPlGrIe3R5iG6oUgAv7AFj22eye5YHhAOEo5Jzql/MK/rcIXhLYGUQeHB9GHBgWTg3wAjv4cO645v7h0OBS4znp0fEW/NEGvhCxGLgdPB8OHXAXDg/jBCX6GPDs55niwOCZ4uznGPAl+uMEDg9wFw4dPB+4HbEYvhDRBhb80fE56VLj0OD+4bjmcO47+PACTg0YFkYcHB9EHtgZ";

export const MESSAGE_PLAYGROUND_URLS = {
  apiDocsMessage: "/playground/s/raft/channel/all?thread=all%3Aapi-docs#message-all%3Aapi-docs",
  noahDm: "/playground/s/raft/dm/dm-noah",
  noahDmThread: "/playground/s/raft/dm/dm-noah?thread=dm-noah%3Areply",
  releaseNotesChannel: "/playground/s/raft/channel/release-notes",
  releaseNotesThread: "/playground/s/raft/channel/release-notes?thread=release-notes%3Areply",
  stateModelTask: "/playground/s/raft/channel/all?thread=all%3Astate-model&from=tasks",
} as const;

export const MESSAGE_QUICK_REACTIONS = ["👍", "❤️", "🎉", "👀", "🔥", "😂", "✅"] as const;

export const MESSAGE_REACTION_SPRITE_PATH = "/reactions/reaction-sprite.svg";
export const MESSAGE_REACTION_SPRITE_SIZE = { width: 168, height: 24 } as const;

export const MESSAGE_REACTION_SPRITE_ITEMS: Record<
  string,
  { id: string; x: number; width: number }
> = {
  "👍": { id: "thumbs_up", x: 0, width: 24 },
  "❤️": { id: "heart", x: 24, width: 24 },
  "❤": { id: "heart", x: 24, width: 24 },
  "🎉": { id: "party_popper", x: 48, width: 24 },
  "👀": { id: "eyes", x: 72, width: 24 },
  "🔥": { id: "fire", x: 96, width: 24 },
  "😂": { id: "joy", x: 120, width: 24 },
  "✅": { id: "check_mark", x: 144, width: 24 },
};

const MESSAGE_DOWNLOAD_FIXTURES = {
  "metrics.csv": {
    content: "metric,value\nmessage_parity,100\nsource_comparison,ready\n",
    mimeType: "text/csv;charset=utf-8",
  },
  "migration.diff": {
    content: [
      "diff --git a/message-item.tsx b/message-item.tsx",
      "index 7ad12ab..91c92ef 100644",
      "--- a/message-item.tsx",
      "+++ b/message-item.tsx",
      "@@ -18,1 +18,1 @@",
      "-const sourceParity = false;",
      "+const sourceParity = true;",
      "",
    ].join("\n"),
    mimeType: "text/x-diff;charset=utf-8",
  },
  "release-notes.md": {
    content: [
      "# Message docs truth pass",
      "",
      "- Match attachment MIME types to their content.",
      "- Keep sent-message states separate from structural previews.",
      "",
    ].join("\n"),
    mimeType: "text/markdown;charset=utf-8",
  },
  "screening.html": {
    content: [
      "<!doctype html>",
      '<html lang="en">',
      '<head><meta charset="utf-8"><title>Attachment screening</title></head>',
      "<body><h1>Attachment screening passed</h1><p>Sandbox preview fixture.</p></body>",
      "</html>",
    ].join("\n"),
    mimeType: "text/html;charset=utf-8",
  },
  "message-image.jpg": {
    mimeType: "image/jpeg",
    sourceUrl: MESSAGE_FIXTURE_IMAGE_SRC,
  },
  "message-preview.wav": {
    mimeType: "audio/wav",
    sourceUrl: MESSAGE_FIXTURE_AUDIO_SRC,
  },
} as const;

export type MessageDownloadFixtureName = keyof typeof MESSAGE_DOWNLOAD_FIXTURES;

function triggerFixtureDownload(name: MessageDownloadFixtureName, blob: Blob) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = name;
  link.href = objectUrl;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

export function downloadMessageFixture(name: MessageDownloadFixtureName) {
  const fixture = MESSAGE_DOWNLOAD_FIXTURES[name];
  if ("content" in fixture) {
    triggerFixtureDownload(name, new Blob([fixture.content], { type: fixture.mimeType }));
    return;
  }

  void fetch(fixture.sourceUrl)
    .then((response) => {
      if (!response.ok) throw new Error(`Fixture download failed: ${response.status}`);
      return response.arrayBuffer();
    })
    .then((content) => {
      triggerFixtureDownload(name, new Blob([content], { type: fixture.mimeType }));
    });
}

export function openMessageFixture() {
  window.open(MESSAGE_FIXTURE_IMAGE_SRC, "_blank", "noopener,noreferrer");
}
