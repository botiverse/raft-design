import { Banner, BannerAction, BannerDescription, Button } from "raft-ui";
import { TasksPanelRoot, TasksPanelViewport } from "raft-ui/wip";
import { RotateCcw } from "lucide-react";

export function TasksErrorComposition() {
  return (
    <div className="flex min-h-80 w-full">
      <TasksPanelRoot>
        <TasksPanelViewport>
          <Banner status="warning">
            <RotateCcw aria-hidden />
            <BannerDescription>Couldn&apos;t load tasks.</BannerDescription>
            <BannerAction>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </BannerAction>
          </Banner>
        </TasksPanelViewport>
      </TasksPanelRoot>
    </div>
  );
}
