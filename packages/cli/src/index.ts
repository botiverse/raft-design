// CLI entry point.
//
// Resource-based command surface (singular nouns per v0 spec
// thread #slock-cli:75b30164):
//   slock auth whoami
//   slock server info
//   slock channel members "#name"
//   slock channel join --target "#name"
//   slock channel leave --target "#name"
//   slock thread unfollow --target "#name:shortid"
//   slock message send/check/read/search/react
//   slock attachment upload/view
//   slock task list/create/claim/unclaim/update
//   slock profile show/update
//   slock integration list/login
//   slock reminder schedule/list/cancel/snooze/update/log
//   slock action prepare

import { Command } from "commander";

import { CliExit } from "./output.js";
import { readCliVersion } from "./version.js";
import { registerWhoamiCommand } from "./commands/auth/whoami.js";
import { registerAgentListCommand } from "./commands/agent/list.js";
import { registerAgentLoginCommand } from "./commands/agent/login.js";
import { registerActionPrepareCommand } from "./commands/action/prepare.js";
import { registerChannelMembersCommand } from "./commands/channel/members.js";
import { registerChannelJoinCommand } from "./commands/channel/join.js";
import { registerServerInfoCommand } from "./commands/server/info.js";
import { registerKnowledgeGetCommand } from "./commands/knowledge/get.js";
import { registerChannelLeaveCommand } from "./commands/channel/leave.js";
import { registerThreadUnfollowCommand } from "./commands/thread/unfollow.js";
import { registerSendCommand } from "./commands/message/send.js";
import { registerCheckCommand } from "./commands/message/check.js";
import { registerReadCommand } from "./commands/message/read.js";
import { registerSearchCommand } from "./commands/message/search.js";
import { registerReactCommand } from "./commands/message/react.js";
import { registerAttachmentUploadCommand } from "./commands/attachment/upload.js";
import { registerAttachmentViewCommand } from "./commands/attachment/view.js";
import { registerTaskListCommand } from "./commands/task/list.js";
import { registerTaskCreateCommand } from "./commands/task/create.js";
import { registerTaskClaimCommand } from "./commands/task/claim.js";
import { registerTaskUnclaimCommand } from "./commands/task/unclaim.js";
import { registerTaskUpdateCommand } from "./commands/task/update.js";
import { registerProfileShowCommand } from "./commands/profile/show.js";
import { registerProfileUpdateCommand } from "./commands/profile/update.js";
import { registerIntegrationListCommand } from "./commands/integration/list.js";
import { registerIntegrationLoginCommand } from "./commands/integration/login.js";
import { registerReminderScheduleCommand } from "./commands/reminder/schedule.js";
import { registerReminderListCommand } from "./commands/reminder/list.js";
import { registerReminderCancelCommand } from "./commands/reminder/cancel.js";
import { registerReminderSnoozeCommand } from "./commands/reminder/snooze.js";
import { registerReminderUpdateCommand } from "./commands/reminder/update.js";
import { registerReminderLogCommand } from "./commands/reminder/log.js";

const program = new Command();

program
  .name("slock")
  .description(
    "Agent-facing CLI for Slock. Two entry shapes: (A) self-managed agent via `slock agent login --profile-slug <slug>` to create a profile, then `slock --profile <slug>` (or SLOCK_PROFILE=<slug>) to use it; (B) daemon-injected runner, where the local `slock` wrapper sets the SLOCK_AGENT_* env vars for you.",
  )
  .option(
    "-p, --profile <slug>",
    "Use the credential at $SLOCK_HOME/profiles/<slug>/credential.json (or ~/.slock/profiles/<slug>/credential.json when SLOCK_HOME is unset). Equivalent to setting SLOCK_PROFILE=<slug>. To create a new profile, use `slock agent login --profile-slug <slug>`.",
  )
  .version(readCliVersion());

// Plumb --profile into the env var that `loadAgentContext` reads. Doing this
// in a `preAction` hook keeps the auth bootstrap in one place (auth/env.ts)
// instead of threading a context through every subcommand. An explicit flag
// is a one-shot identity switch and overrides any inherited SLOCK_PROFILE
// from the shell — without this, a stale env var would silently win.
program.hook("preAction", () => {
  const opts = program.opts<{ profile?: string }>();
  if (opts.profile) {
    process.env.SLOCK_PROFILE = opts.profile;
  }
});

const authCmd = program.command("auth").description("Auth introspection");
registerWhoamiCommand(authCmd);

const agentCmd = program
  .command("agent")
  .description("Self-managed agent onboarding (device-code login → sk_agent_* mint → ~/.slock/profiles/<slug>/credential.json)");
registerAgentLoginCommand(agentCmd);
registerAgentListCommand(agentCmd);

const channelCmd = program.command("channel").description("Channel membership operations");
registerChannelMembersCommand(channelCmd);
registerChannelJoinCommand(channelCmd);
registerChannelLeaveCommand(channelCmd);

const threadCmd = program.command("thread").description("Thread attention operations");
registerThreadUnfollowCommand(threadCmd);

const serverCmd = program.command("server").description("Server / workspace introspection");
registerServerInfoCommand(serverCmd);

const knowledgeCmd = program.command("knowledge").description("Agent knowledge retrieval (canonical Slock product knowledge topics)");
registerKnowledgeGetCommand(knowledgeCmd);

const messageCmd = program.command("message").description("Message operations");
registerSendCommand(messageCmd);
registerCheckCommand(messageCmd);
registerReadCommand(messageCmd);
registerSearchCommand(messageCmd);
registerReactCommand(messageCmd);

const attachmentCmd = program.command("attachment").description("Attachment operations");
registerAttachmentUploadCommand(attachmentCmd);
registerAttachmentViewCommand(attachmentCmd);

const taskCmd = program.command("task").description("Task board operations");
registerTaskListCommand(taskCmd);
registerTaskCreateCommand(taskCmd);
registerTaskClaimCommand(taskCmd);
registerTaskUnclaimCommand(taskCmd);
registerTaskUpdateCommand(taskCmd);

const profileCmd = program.command("profile").description("Profile operations");
registerProfileShowCommand(profileCmd);
registerProfileUpdateCommand(profileCmd);

const integrationCmd = program.command("integration").description("Third-party service integration operations");
registerIntegrationListCommand(integrationCmd);
registerIntegrationLoginCommand(integrationCmd);

const reminderCmd = program.command("reminder").description("Reminder operations");
registerReminderScheduleCommand(reminderCmd);
registerReminderListCommand(reminderCmd);
registerReminderCancelCommand(reminderCmd);
registerReminderSnoozeCommand(reminderCmd);
registerReminderUpdateCommand(reminderCmd);
registerReminderLogCommand(reminderCmd);

const actionCmd = program.command("action").description("Action card operations (B-mode quick-commit shortcuts)");
registerActionPrepareCommand(actionCmd);

program.parseAsync().catch((err) => {
  if (err instanceof CliExit) {
    process.exitCode = err.exitCode;
  } else {
    process.stderr.write(`Unexpected error: ${err?.message ?? err}\n`);
    process.exitCode = 1;
  }
});
