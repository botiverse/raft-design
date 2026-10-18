import { CheckboxIndicator } from "raft-ui";

export function CheckboxIndicatorContent() {
  return (
    <div className="flex items-center gap-4">
      <CheckboxIndicator checked={false} />
      <CheckboxIndicator checked />
      <CheckboxIndicator checked mark="minus" />
      <CheckboxIndicator checked shape="circle" />
      <CheckboxIndicator checked disabled />
    </div>
  );
}
