import { TextLink } from "@botiverse/raft-ui";
import { useCallback, useState } from "react";

export function TextLinkInASentenceContent() {
  const [runtime, setRuntime] = useState("Claude Code");
  const switchRuntime = useCallback(
    () => setRuntime((r) => (r === "Claude Code" ? "Codex" : "Claude Code")),
    [],
  );
  return (
    <p className="m-0 w-[220px] max-w-full rounded-container border border-line-hairline p-3 text-footnote text-foreground-muted">
      Sign in, and Cindy will start in {runtime}. Or{" "}
      <TextLink variant="strong" nativeButton={false} render={<span />} onClick={switchRuntime}>
        switch to another runtime
      </TextLink>
      .
    </p>
  );
}
