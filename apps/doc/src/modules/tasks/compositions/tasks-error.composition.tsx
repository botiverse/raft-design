import {
  helperText,
  Banner,
  BannerAction,
  BannerDescription,
  Button,
  TasksPanelRoot,
  TasksPanelViewport,
} from "@botiverse/raft-ui";
import { RotateCcw } from "lucide-react";

function reloadPage() {
  window.location.reload();
}

export function TasksErrorComposition() {
  return (
    <div className="flex min-h-80 w-full">
      <TasksPanelRoot>
        <TasksPanelViewport>
          <Banner status="warning">
            <RotateCcw aria-hidden />
            <BannerDescription>
              {helperText("Couldn't load tasks.", { why: "recovery", about: "task" })}
            </BannerDescription>
            <BannerAction>
              <Button variant="outline" size="md" onClick={reloadPage}>
                Retry
              </Button>
            </BannerAction>
          </Banner>
        </TasksPanelViewport>
      </TasksPanelRoot>
    </div>
  );
}
