// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import { definePlaygroundMessage, type PlaygroundThreadId } from "../mock/index.ts";
import { PlaygroundMessageWorkflowProvider } from "./playground-message-workflow-state.tsx";
import { usePlaygroundThreadReplies } from "./use-playground-message-workflow.ts";

const THREAD_ID = "all:reply" as PlaygroundThreadId;
const INITIAL_REPLY = definePlaygroundMessage(
  "all:thread-reply-1",
  "all",
  "atlas",
  "9:31 AM",
  "Initial reply",
);

function ThreadRepliesProbe() {
  const { appendReply, replies } = usePlaygroundThreadReplies(THREAD_ID, [INITIAL_REPLY]);
  return (
    <button
      type="button"
      onClick={() =>
        appendReply(definePlaygroundMessage("all:local-1", "all", "cuvii", "9:34 AM", "New reply"))
      }
    >
      {replies.length}
    </button>
  );
}

describe("playground thread reply workflow", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.replaceChildren();
  });

  it("appends a sent reply without dropping seeded thread history", () => {
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    const container = document.createElement("div");
    const root = createRoot(container);

    act(() => {
      root.render(
        <PlaygroundMessageWorkflowProvider>
          <ThreadRepliesProbe />
        </PlaygroundMessageWorkflowProvider>,
      );
    });
    expect(container.textContent).toBe("1");

    act(() => container.querySelector("button")?.click());
    expect(container.textContent).toBe("2");

    act(() => root.unmount());
  });
});
