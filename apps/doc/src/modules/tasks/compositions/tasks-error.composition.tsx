import {
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
            <BannerDescription>Couldn&apos;t load tasks.</BannerDescription>
            <BannerAction>
              <Button variant="outline" size="sm" onClick={reloadPage}>
                Retry
              </Button>
            </BannerAction>
          </Banner>
        </TasksPanelViewport>
      </TasksPanelRoot>
    </div>
  );
}
