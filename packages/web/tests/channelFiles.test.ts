import assert from "node:assert/strict";
import test from "node:test";
import { formatChannelFileSize, getChannelFileType, type ChannelFileLike } from "../src/utils/channelFiles";

function file(partial: Partial<ChannelFileLike> & Pick<ChannelFileLike, "filename" | "mimeType">): ChannelFileLike {
  return {
    filename: partial.filename,
    mimeType: partial.mimeType,
  };
}

test("getChannelFileType classifies v0 file badges from mime type and filename", () => {
  assert.equal(getChannelFileType(file({ filename: "shot.png", mimeType: "image/png" })), "image");
  assert.equal(getChannelFileType(file({ filename: "clip.mov", mimeType: "video/quicktime" })), "video");
  assert.equal(getChannelFileType(file({ filename: "paper.bin", mimeType: "application/pdf" })), "pdf");
  assert.equal(getChannelFileType(file({ filename: "bundle.zip", mimeType: "application/octet-stream" })), "archive");
  assert.equal(getChannelFileType(file({ filename: "notes.txt", mimeType: "text/plain" })), "other");
});

test("formatChannelFileSize uses compact binary units", () => {
  assert.equal(formatChannelFileSize(0), "0 B");
  assert.equal(formatChannelFileSize(512), "512 B");
  assert.equal(formatChannelFileSize(1536), "1.5 KB");
  assert.equal(formatChannelFileSize(5 * 1024 * 1024), "5.0 MB");
});
