import { RAFT_UI_MIGRATION_THREAD_IDS, getPlaygroundThread } from "./conversations.ts";
import type { PlaygroundChannelId, PlaygroundMessageId } from "./conversations.ts";

export type PlaygroundFile = {
  id: PlaygroundFileId;
  channelId: PlaygroundChannelId;
  filename: string;
  size: string;
  createdAt: string;
  type: "archive" | "file" | "image" | "pdf" | "video";
  previewUrl: string;
  thumbnailUrl?: string;
  imageFit?: "contain" | "cover";
  sourceMessageId: PlaygroundMessageId;
};

export type PlaygroundFileId = `file:${PlaygroundChannelId}:${string}`;

type FileSeed = {
  slug: string;
  filename: string;
  size: string;
  createdAt: string;
  type: PlaygroundFile["type"];
  previewUrl: string;
  thumbnailUrl?: string;
  imageFit?: PlaygroundFile["imageFit"];
  sourceMessageId: PlaygroundMessageId;
};

const textPreview = (body: string) => `data:text/plain;charset=utf-8,${encodeURIComponent(body)}`;
const markdownPreview = (body: string) =>
  `data:text/markdown;charset=utf-8,${encodeURIComponent(body)}`;
const jsonPreview = (body: string) =>
  `data:application/json;charset=utf-8,${encodeURIComponent(body)}`;
const htmlPreview = (body: string) => `data:text/html;charset=utf-8,${encodeURIComponent(body)}`;
const csvPreview = (body: string) => `data:text/csv;charset=utf-8,${encodeURIComponent(body)}`;

/** Dense `#raft-ui-migration` file seeds — every supported preview type, enough to page. */
const RAFT_UI_MIGRATION_FILE_SEEDS = [
  {
    slug: "raft-ui-mark",
    filename: "raft-ui-mark.svg",
    size: "6 KB",
    createdAt: "Today, 10:32 AM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "state-ownership-notes",
    filename: "state-ownership-migration-notes.md",
    size: "147 B",
    createdAt: "Today, 10:28 AM",
    type: "file",
    previewUrl: markdownPreview(
      "Raft UI migration notes\n\n## Ownership boundary\n\nKeep server state outside the local message store.\nAssign interaction state to the narrowest owner.",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "invite-security-acceptance",
    filename: "invite-security-acceptance.txt",
    size: "122 B",
    createdAt: "Yesterday, 4:18 PM",
    type: "file",
    previewUrl: textPreview(
      "Invite security acceptance\n\nRate-limit workspace probes.\nKeep rejection copy generic.\nLog the migration security decision.",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "canonical-composition-source-index",
    filename: "canonical-composition-source-index.txt",
    size: "150 B",
    createdAt: "Yesterday, 3:54 PM",
    type: "file",
    previewUrl: textPreview(
      "Canonical composition source index\n\nMessage items: message-item-compositions.tsx\nFiles: files-panel-composition.tsx\nTasks: tasks-panel-composition.tsx",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "migration-checklist",
    filename: "migration-checklist.md",
    size: "2.1 KB",
    createdAt: "Today, 9:14 AM",
    type: "file",
    previewUrl: markdownPreview(
      "# Migration checklist\n\n- [ ] Panel chrome\n- [ ] Files pagination\n- [ ] Task board DnD\n- [ ] Empty states",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "token-audit",
    filename: "token-audit.csv",
    size: "4.8 KB",
    createdAt: "Today, 9:02 AM",
    type: "file",
    previewUrl: csvPreview(
      "token,usage,notes\nlayer-panel,high,surfaces\nline-muted,high,borders\nforeground-muted,medium,meta",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "theme-contract",
    filename: "theme-contract.json",
    size: "3.2 KB",
    createdAt: "Today, 8:55 AM",
    type: "file",
    previewUrl: jsonPreview(
      '{\n  "modes": ["light", "dark"],\n  "slots": ["panel", "row", "thumbnail"]\n}',
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "files-panel-anatomy",
    filename: "files-panel-anatomy.html",
    size: "1.4 KB",
    createdAt: "Today, 8:41 AM",
    type: "file",
    previewUrl: htmlPreview(
      "<!doctype html><title>Files anatomy</title><h1>FilesPanel</h1><p>List, row, thumbnail, actions.</p>",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "composer-drop-spec",
    filename: "composer-drop-spec.docx",
    size: "88 KB",
    createdAt: "Yesterday, 6:12 PM",
    type: "file",
    previewUrl: textPreview("Composer drop overlay spec (docx stub for preview badge)."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "release-notes-draft",
    filename: "release-notes-draft.doc",
    size: "54 KB",
    createdAt: "Yesterday, 5:48 PM",
    type: "file",
    previewUrl: textPreview("Release notes draft (doc stub)."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "component-inventory",
    filename: "component-inventory.pdf",
    size: "412 KB",
    createdAt: "Yesterday, 5:21 PM",
    type: "pdf",
    previewUrl: textPreview("Component inventory PDF stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "a11y-audit",
    filename: "a11y-audit-report.pdf",
    size: "276 KB",
    createdAt: "Yesterday, 4:55 PM",
    type: "pdf",
    previewUrl: textPreview("Accessibility audit report PDF stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "fixture-pack",
    filename: "playground-fixture-pack.zip",
    size: "1.8 MB",
    createdAt: "Yesterday, 4:02 PM",
    type: "archive",
    previewUrl: textPreview("Playground fixture pack archive stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "legacy-assets",
    filename: "legacy-assets.zip",
    size: "940 KB",
    createdAt: "Yesterday, 3:18 PM",
    type: "archive",
    previewUrl: textPreview("Legacy assets archive stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "board-walkthrough",
    filename: "board-walkthrough.mp4",
    size: "12.4 MB",
    createdAt: "Yesterday, 2:44 PM",
    type: "video",
    previewUrl: textPreview("Board walkthrough video stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "mobile-files-pass",
    filename: "mobile-files-pass.mov",
    size: "8.1 MB",
    createdAt: "Yesterday, 2:11 PM",
    type: "video",
    previewUrl: textPreview("Mobile files pass video stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "empty-state-shot",
    filename: "empty-state-shot.png",
    size: "188 KB",
    createdAt: "Yesterday, 1:36 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "cover",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "header-align-ref",
    filename: "header-align-ref.jpg",
    size: "96 KB",
    createdAt: "Yesterday, 1:12 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "badge-matrix",
    filename: "file-preview-badge-matrix.jpeg",
    size: "142 KB",
    createdAt: "Yesterday, 12:48 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "cover",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "drag-overlay-loop",
    filename: "drag-overlay-loop.gif",
    size: "640 KB",
    createdAt: "Yesterday, 12:05 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "surface-tokens",
    filename: "surface-tokens.webp",
    size: "74 KB",
    createdAt: "Mon, 5:40 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "cover",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "mention-combobox-notes",
    filename: "mention-combobox-notes.md",
    size: "890 B",
    createdAt: "Mon, 5:12 PM",
    type: "file",
    previewUrl: markdownPreview(
      "## Mention combobox\n\nKeep collision avoidance enabled in product filters.",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "scroll-budget",
    filename: "scroll-budget.ts",
    size: "1.1 KB",
    createdAt: "Mon, 4:33 PM",
    type: "file",
    previewUrl: textPreview(
      "export const FILES_PAGE_SIZE = 50;\nexport const LOAD_MORE_THRESHOLD_PX = 320;\n",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "viewport-sentinel",
    filename: "viewport-sentinel.tsx",
    size: "2.4 KB",
    createdAt: "Mon, 4:01 PM",
    type: "file",
    previewUrl: textPreview(
      "export function nearBottom(el: HTMLElement, threshold = 320) {\n  return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;\n}\n",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "channel-files-contract",
    filename: "channel-files-contract.json",
    size: "980 B",
    createdAt: "Mon, 3:22 PM",
    type: "file",
    previewUrl: jsonPreview('{\n  "limit": 50,\n  "nextCursor": "opaque",\n  "files": []\n}'),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "filter-clear-copy",
    filename: "filter-clear-copy.txt",
    size: "68 B",
    createdAt: "Mon, 2:58 PM",
    type: "file",
    previewUrl: textPreview("Clear\nShown when Creator or Assignee filters are active."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "task-status-matrix",
    filename: "task-status-matrix.csv",
    size: "1.6 KB",
    createdAt: "Mon, 2:14 PM",
    type: "file",
    previewUrl: csvPreview(
      "status,count,notes\ntodo,12,seeded\nin-progress,9,seeded\ndone,14,seeded",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "panel-padding-notes",
    filename: "panel-padding-notes.md",
    size: "520 B",
    createdAt: "Mon, 1:41 PM",
    type: "file",
    previewUrl: markdownPreview(
      "Mobile header `pl-5 pr-3.5`.\nTasks toolbar matches on small screens.",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "rail-trigger-spec",
    filename: "rail-trigger-spec.pdf",
    size: "198 KB",
    createdAt: "Mon, 1:05 PM",
    type: "pdf",
    previewUrl: textPreview("App rail trigger spec PDF stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "dm-header-parity",
    filename: "dm-header-parity.png",
    size: "210 KB",
    createdAt: "Sun, 6:20 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "members-empty",
    filename: "members-empty-state.webp",
    size: "55 KB",
    createdAt: "Sun, 5:51 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "cover",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "thread-search-clip",
    filename: "thread-search-clip.mp4",
    size: "5.6 MB",
    createdAt: "Sun, 5:10 PM",
    type: "video",
    previewUrl: textPreview("Thread search clip video stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "source-snippets",
    filename: "source-snippets.zip",
    size: "2.2 MB",
    createdAt: "Sun, 4:28 PM",
    type: "archive",
    previewUrl: textPreview("Source snippets archive stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "oklch-swatches",
    filename: "oklch-swatches.html",
    size: "3.7 KB",
    createdAt: "Sun, 3:55 PM",
    type: "file",
    previewUrl: htmlPreview(
      "<!doctype html><title>OKLCH swatches</title><body style='font:14px sans-serif'>layer / line / foreground</body>",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "badge-types",
    filename: "badge-types.json",
    size: "640 B",
    createdAt: "Sun, 3:12 PM",
    type: "file",
    previewUrl: jsonPreview(
      '["pdf","doc","docx","txt","md","csv","json","zip","html","png","jpg","gif","webp","mp4","mov"]',
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "load-more-copy",
    filename: "load-more-copy.txt",
    size: "42 B",
    createdAt: "Sun, 2:40 PM",
    type: "file",
    previewUrl: textPreview("Load more\nLoading more files…"),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "pagination-decision",
    filename: "pagination-decision.md",
    size: "1.0 KB",
    createdAt: "Sun, 2:08 PM",
    type: "file",
    previewUrl: markdownPreview(
      "## Files pagination\n\nMatch source: page size 50, cursor append, near-bottom auto-load at 320px, keep Load more as fallback.",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "thumbnail-width-notes",
    filename: "thumbnail-width-notes.md",
    size: "710 B",
    createdAt: "Sun, 1:33 PM",
    type: "file",
    previewUrl: markdownPreview(
      "FileThumbnail is a layout spacer (`size-14`). FilePreview inside stays 48×60 without chrome.",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "export-bundle",
    filename: "docs-export-bundle.zip",
    size: "3.5 MB",
    createdAt: "Sat, 7:05 PM",
    type: "archive",
    previewUrl: textPreview("Docs export bundle archive stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "qa-pass-recording",
    filename: "qa-pass-recording.mov",
    size: "15.2 MB",
    createdAt: "Sat, 6:22 PM",
    type: "video",
    previewUrl: textPreview("QA pass recording video stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "pdf-cover",
    filename: "migration-brief-cover.pdf",
    size: "320 KB",
    createdAt: "Sat, 5:47 PM",
    type: "pdf",
    previewUrl: textPreview("Migration brief cover PDF stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "spreadsheet-export",
    filename: "callsite-inventory.csv",
    size: "6.3 KB",
    createdAt: "Sat, 5:01 PM",
    type: "file",
    previewUrl: csvPreview(
      "component,callsites,owner\nFileRow,4,files\nFilePreview,12,files\nTasksPanel,8,tasks",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "handshake-log",
    filename: "websocket-handshake-log.txt",
    size: "9.4 KB",
    createdAt: "Sat, 4:18 PM",
    type: "file",
    previewUrl: textPreview("websocket handshake log stub\nok\nresume\nack"),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "icon-sheet",
    filename: "status-icon-sheet.png",
    size: "133 KB",
    createdAt: "Sat, 3:36 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "contain",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "codeowners-snippet",
    filename: "CODEOWNERS",
    size: "180 B",
    createdAt: "Sat, 2:59 PM",
    type: "file",
    previewUrl: textPreview("* @cuvii\npackages/ui/ @raft-ui\napps/doc/ @raft-ui"),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "eslint-disable-inventory",
    filename: "eslint-disable-inventory.json",
    size: "2.8 KB",
    createdAt: "Sat, 2:21 PM",
    type: "file",
    previewUrl: jsonPreview('{"react-doctor":12,"oxlint":4}'),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "motion-guidelines-clip",
    filename: "motion-guidelines-clip.mp4",
    size: "4.3 MB",
    createdAt: "Fri, 6:44 PM",
    type: "video",
    previewUrl: textPreview("Motion guidelines clip video stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "archive-screenshots",
    filename: "archive-screenshots.zip",
    size: "7.7 MB",
    createdAt: "Fri, 5:58 PM",
    type: "archive",
    previewUrl: textPreview("Archive screenshots stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "readme-snippet",
    filename: "README.md",
    size: "1.2 KB",
    createdAt: "Fri, 5:10 PM",
    type: "file",
    previewUrl: markdownPreview(
      "# raft-ui\n\nPlayground files tab seeds for pagination and preview coverage.",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "playwright-trace",
    filename: "playwright-trace.zip",
    size: "11 MB",
    createdAt: "Fri, 4:27 PM",
    type: "archive",
    previewUrl: textPreview("Playwright trace archive stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
  {
    slug: "cover-photo",
    filename: "channel-cover.jpeg",
    size: "420 KB",
    createdAt: "Fri, 3:49 PM",
    type: "image",
    previewUrl: "/raft-logo.svg",
    thumbnailUrl: "/raft-logo.svg",
    imageFit: "cover",
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.selectorPerformance,
  },
  {
    slug: "spec-addendum",
    filename: "pagination-spec-addendum.docx",
    size: "66 KB",
    createdAt: "Fri, 3:02 PM",
    type: "file",
    previewUrl: textPreview("Pagination spec addendum docx stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.apiDocs,
  },
  {
    slug: "security-signoff",
    filename: "security-signoff.pdf",
    size: "155 KB",
    createdAt: "Fri, 2:18 PM",
    type: "pdf",
    previewUrl: textPreview("Security signoff PDF stub."),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.inviteSecurity,
  },
  {
    slug: "final-changelog",
    filename: "FINAL_CHANGELOG.txt",
    size: "3.0 KB",
    createdAt: "Fri, 1:30 PM",
    type: "file",
    previewUrl: textPreview(
      "FINAL CHANGELOG\n\n- Seed denser files\n- Align files pagination with source (50 / cursor / near-end)",
    ),
    sourceMessageId: RAFT_UI_MIGRATION_THREAD_IDS.stateModel,
  },
] satisfies readonly FileSeed[];

export const PLAYGROUND_FILES: readonly PlaygroundFile[] = RAFT_UI_MIGRATION_FILE_SEEDS.map(
  (seed) => ({
    id: `file:all:${seed.slug}`,
    channelId: "all",
    filename: seed.filename,
    size: seed.size,
    createdAt: seed.createdAt,
    type: seed.type,
    previewUrl: seed.previewUrl,
    thumbnailUrl: seed.thumbnailUrl,
    imageFit: seed.imageFit,
    sourceMessageId: seed.sourceMessageId,
  }),
);

for (const file of PLAYGROUND_FILES) {
  const source = getPlaygroundThread(file.sourceMessageId);
  if (!source) {
    throw new Error(`Unknown source message for playground file: ${file.id}`);
  }
  if (source.channelId !== file.channelId) {
    throw new Error(`Playground file source is in another channel: ${file.id}`);
  }
}

export function getPlaygroundFiles(channelId: PlaygroundChannelId): readonly PlaygroundFile[] {
  return PLAYGROUND_FILES.filter((file) => file.channelId === channelId);
}

export function getPlaygroundFilesForMessage(
  messageId: PlaygroundMessageId,
): readonly PlaygroundFile[] {
  return PLAYGROUND_FILES.filter((file) => file.sourceMessageId === messageId);
}

export function getPlaygroundFile(id: string): PlaygroundFile | undefined {
  return PLAYGROUND_FILES.find((file) => file.id === id);
}

export function requirePlaygroundFile(id: string): PlaygroundFile {
  const file = getPlaygroundFile(id);
  if (!file) throw new Error(`Unknown playground file: ${id}`);
  return file;
}
