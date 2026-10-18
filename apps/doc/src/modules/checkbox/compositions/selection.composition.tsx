import { Card, CardHeader, CardLeading, CardTitle, Checkbox } from "raft-ui";

export function CheckboxSelectionContent() {
  return (
    <div className="grid min-w-64 gap-2">
      <Card variant="option" render={<label />}>
        <CardHeader>
          <CardLeading>
            <Checkbox defaultChecked aria-label="Select conversation" />
          </CardLeading>
          <CardTitle>Customer handoff</CardTitle>
        </CardHeader>
      </Card>
      <Card variant="option" render={<label />}>
        <CardHeader>
          <CardLeading>
            <Checkbox aria-label="Select message" />
          </CardLeading>
          <CardTitle>Message selection</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
