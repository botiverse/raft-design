// `slock attachment view --id <attachmentId> --output <path>`
// → GET /api/attachments/:id    (NOT /internal/* — this endpoint serves binary)
//
// Streams the response body to disk. Caller controls where the file lands.

import { writeFileSync } from "node:fs";

import type { Command } from "commander";

import { ApiClient } from "../../client.js";
import { loadAgentContext, AgentBootstrapError } from "../../auth/env.js";
import { fail } from "../../output.js";

interface ViewOpts {
  id: string;
  output: string;
}

export function registerAttachmentViewCommand(parent: Command): void {
  parent
    .command("view")
    .description("Download an attachment by id and save it to a local path")
    .requiredOption("--id <attachmentId>", "Attachment UUID")
    .requiredOption("--output <path>", "Local path to write the file to")
    .action(async (opts: ViewOpts) => {
      let ctx;
      try {
        ctx = loadAgentContext();
      } catch (err) {
        if (err instanceof AgentBootstrapError) fail(err.code, err.message);
        throw err;
      }

      const client = new ApiClient(ctx);
      const res = await client.requestRaw(
        "GET",
        `/api/attachments/${encodeURIComponent(opts.id)}`,
      );
      if (!res.ok) {
        const code = res.status >= 500 ? "SERVER_5XX" : "VIEW_FAILED";
        fail(code, res.error ?? `HTTP ${res.status}`);
      }

      const buffer = Buffer.from(await res.response.arrayBuffer());
      writeFileSync(opts.output, buffer);

      process.stdout.write(`Downloaded to: ${opts.output}\n`);
    });
}
