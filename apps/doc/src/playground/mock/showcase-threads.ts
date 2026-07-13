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
