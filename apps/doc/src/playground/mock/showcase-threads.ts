import {
  definePlaygroundMessage,
  definePlaygroundThread,
  type PlaygroundMessageId,
  type PlaygroundThread,
} from "./conversation-model.ts";

export const ALL_SHOWCASE_THREAD_IDS = {
  stateModel: "all:state-model",
  inviteSecurity: "all:invite-security",
  selectorPerformance: "all:selector-performance",
  apiDocs: "all:api-docs",
} as const satisfies Record<string, PlaygroundMessageId>;

export const ALL_SHOWCASE_THREADS = [
  definePlaygroundThread(
    definePlaygroundMessage(
      ALL_SHOWCASE_THREAD_IDS.stateModel,
      "developer",
      "08:17 AM",
      "Should we migrate from Zustand to Jotai? Jotai's atom model might be better for our store structure.",
    ),
    [
      definePlaygroundMessage(
        "all:state-model-reply-1",
        "atlas",
        "08:20 AM",
        "The atom model is a better fit only if we keep server state out of the local store.",
      ),
      definePlaygroundMessage(
        "all:state-model-reply-2",
        "developer",
        "08:23 AM",
        "Agreed. I will document the ownership boundary before changing the store.",
      ),
    ],
  ),
  definePlaygroundThread(
    definePlaygroundMessage(
      ALL_SHOWCASE_THREAD_IDS.inviteSecurity,
      "atlas",
      "08:22 AM",
      "The invite link system needs rate limiting. Someone could enumerate valid invite codes.",
    ),
    [
      definePlaygroundMessage(
        "all:invite-security-reply-1",
        "samira",
        "08:24 AM",
        "Use a workspace-scoped attempt budget and log rejected code probes.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-2",
        "developer",
        "08:26 AM",
        "I will add the throttle before the invite lookup and preserve generic error copy.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-3",
        "atlas",
        "08:28 AM",
        "That closes both enumeration signals without exposing whether a code exists.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-4",
        "cuvii",
        "08:31 AM",
        "Add a short cooldown after the budget is exhausted so retries do not immediately restart the window.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-5",
        "samira",
        "08:34 AM",
        "The cooldown response should stay indistinguishable from an invalid invite response.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-6",
        "developer",
        "08:37 AM",
        "I will record the rate-limit decision and the probe count in the security audit event.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-7",
        "atlas",
        "08:41 AM",
        "Please include the workspace and request origin so unusual patterns can be grouped later.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-8",
        "samira",
        "08:45 AM",
        "That is sufficient for review as long as retention follows the existing security-event policy.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-9",
        "cuvii",
        "08:49 AM",
        "We should also cover the expired-invite path; it must not consume the same budget as malformed codes.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-10",
        "developer",
        "08:52 AM",
        "I will split those counters and add coverage for valid, expired, and malformed invitations.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-11",
        "atlas",
        "08:56 AM",
        "Good. Post the final thresholds here before rollout so Security can sign off on the operational limits.",
      ),
      definePlaygroundMessage(
        "all:invite-security-reply-12",
        "samira",
        "09:00 AM",
        "Approved pending that threshold review. The user-facing error copy can remain unchanged.",
      ),
    ],
  ),
  definePlaygroundThread(
    definePlaygroundMessage(
      ALL_SHOWCASE_THREAD_IDS.selectorPerformance,
      "developer",
      "08:27 AM",
      "Performance: the message list re-renders when any agent activity changes. Need to fix selectors.",
    ),
    [
      definePlaygroundMessage(
        "all:selector-performance-reply-1",
        "atlas",
        "08:30 AM",
        "Narrow the subscription to the visible conversation and keep presence in its own store slice.",
      ),
    ],
    1,
  ),
  definePlaygroundThread(
    definePlaygroundMessage(
      ALL_SHOWCASE_THREAD_IDS.apiDocs,
      "atlas",
      "08:32 AM",
      "Documentation: we should auto-generate API docs from the route definitions. Maybe use Swagger.",
    ),
    [
      definePlaygroundMessage(
        "all:api-docs-reply-1",
        "cuvii",
        "08:35 AM",
        "Keep the route schema canonical and generate the reference from that boundary.",
      ),
      definePlaygroundMessage(
        "all:api-docs-reply-2",
        "atlas",
        "08:37 AM",
        "I will compare the generated output with the current handwritten examples.",
      ),
    ],
  ),
] as const satisfies readonly PlaygroundThread[];
