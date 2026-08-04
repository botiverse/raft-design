import { describe, expect, it } from "vitest";
import type { PlaygroundMessageAttachment } from "../mock/index.ts";
import { groupPlaygroundSentAttachments } from "./group-playground-sent-attachments.ts";

describe("groupPlaygroundSentAttachments", () => {
  it("preserves mixed-media order and groups only adjacent card attachments", () => {
    const attachments: PlaygroundMessageAttachment[] = [
      {
        name: "brief.pdf",
        mediaType: "application/pdf",
        state: { kind: "ready", size: "2 MB" },
      },
      {
        name: "cover.png",
        mediaType: "image/png",
        state: { kind: "ready", previewUrl: "/cover.png" },
      },
      {
        name: "notes.txt",
        mediaType: "text/plain",
        state: { kind: "ready", size: "4 KB" },
      },
      {
        name: "voice.mp3",
        mediaType: "audio/mpeg",
        state: { kind: "ready", previewUrl: "/voice.mp3" },
      },
      {
        name: "demo.mp4",
        mediaType: "video/mp4",
        state: { kind: "ready", previewUrl: "/demo.mp4" },
      },
      {
        name: "archive.zip",
        mediaType: "application/zip",
        state: { kind: "processing", label: "Uploading" },
      },
    ];

    const runs = groupPlaygroundSentAttachments(attachments).map((run) =>
      run.kind === "card-group"
        ? run.attachments.map((attachment) => attachment.name)
        : run.attachment.name,
    );

    expect(runs).toEqual([
      ["brief.pdf"],
      "cover.png",
      ["notes.txt", "voice.mp3"],
      "demo.mp4",
      ["archive.zip"],
    ]);
  });
});
