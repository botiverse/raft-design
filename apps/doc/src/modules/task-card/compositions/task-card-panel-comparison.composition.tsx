import { TaskCardComparisonComposition } from "./task-card-comparison.composition.tsx";
import { TaskCardPanel, TaskCardPanelHeader } from "../task-card-panel.tsx";

export function TaskCardPanelComparisonComposition() {
  return (
    <TaskCardPanel>
      <TaskCardPanelHeader>Channel tasks</TaskCardPanelHeader>
      <TaskCardComparisonComposition showNotice={false} showChannelName />
    </TaskCardPanel>
  );
}
