export const MESSAGE_FIXTURE_AVATAR_SRC = "/avatars/message-sender.jpg";

/** Same-origin JPEG so preview and download actions resolve to the same real asset. */
export const MESSAGE_FIXTURE_IMAGE_SRC = MESSAGE_FIXTURE_AVATAR_SRC;

/** Tiny valid WAV data URI shared by the playable preview and download fixture. */
export const MESSAGE_FIXTURE_AUDIO_SRC =
  "data:audio/wav;base64,UklGRsQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAAAAAAAJUK6xPlGrIe3R5iG6oUgAv7AFj22eye5YHhAOEo5Jzql/MK/rcIXhLYGUQeHB9GHBgWTg3wAjv4cO645v7h0OBS4znp0fEW/NEGvhCxGLgdPB8OHXAXDg/jBCX6GPDs55niwOCZ4uznGPAl+uMEDg9wFw4dPB+4HbEYvhDRBhb80fE56VLj0OD+4bjmcO47+PACTg0YFkYcHB9EHtgZ";

/** Tiny valid WebM data URI for the inline video attachment fixture. */
export const MESSAGE_FIXTURE_VIDEO_SRC =
  "data:video/webm;base64,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";

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
  "demo-recording.webm": {
    mimeType: "video/webm",
    sourceUrl: MESSAGE_FIXTURE_VIDEO_SRC,
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
