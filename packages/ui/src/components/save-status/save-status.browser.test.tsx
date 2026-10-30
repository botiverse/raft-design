import "./save-status.test.css";
import { afterEach, expect, test } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { Field, FieldLabel } from "../field/field";
import {
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowTitle,
} from "../list-row/list-row";
import {
  SegmentedControl,
  SegmentedControlItem,
  SegmentedControlLabel,
} from "../segmented-control/segmented-control";
import { Select, SelectIcon, SelectTrigger, SelectValue } from "../select/select";
import { Switch } from "../switch/switch";
import { SaveStatus, SaveStatusError, SaveStatusSaved } from "./save-status";

// Same guard as the other browser tests: these need real layout, so they
// stand down in the node run and measure under `vp test --browser.enabled`.
const it = test.skipIf(typeof window === "undefined");
afterEach(cleanup);

type Result = "idle" | "saved" | "failed";
const RESULTS: Result[] = ["idle", "saved", "failed"];

// What a consumer renders for each result: the polite region stays mounted,
// empty, until something happens; a failure takes its place.
function Status({ result }: { result: Result }) {
  return (
    <SaveStatus data-testid="status">
      {result === "failed" ? (
        <SaveStatusError>Couldn&apos;t save. Try again.</SaveStatusError>
      ) : (
        <SaveStatusSaved>{result === "saved" ? "Saved" : null}</SaveStatusSaved>
      )}
    </SaveStatus>
  );
}

function rect(testId: string) {
  return screen.getByTestId(testId).getBoundingClientRect();
}

function SwitchRow({ result }: { result: Result }) {
  return (
    <div style={{ width: 480 }}>
      <ListRowGroup data-testid="card">
        <ListRow variant="plain" interactive={false}>
          <ListRowBody>
            <ListRowTitle id="mute-title">Mute this server</ListRowTitle>
            <ListRowDescription wrap data-testid="above">
              Stops notifications from this server on all your devices.
            </ListRowDescription>
            <Status result={result} />
          </ListRowBody>
          <Switch aria-labelledby="mute-title" data-testid="switch" />
        </ListRow>
      </ListRowGroup>
    </div>
  );
}

const TIME_ZONES = [{ value: "utc", label: "UTC" }];

function SelectField({ result }: { result: Result }) {
  return (
    <div style={{ width: 320 }}>
      <Field data-testid="card">
        <FieldLabel>Time zone</FieldLabel>
        <Select items={TIME_ZONES} defaultValue="utc">
          <SelectTrigger data-testid="above">
            <SelectValue />
            <SelectIcon />
          </SelectTrigger>
        </Select>
        <Status result={result} />
      </Field>
    </div>
  );
}

function SegmentedField({ result }: { result: Result }) {
  return (
    <Field data-testid="card">
      <FieldLabel id="time-format">Time format</FieldLabel>
      <SegmentedControl aria-labelledby="time-format" defaultValue="24h" data-testid="above">
        <SegmentedControlItem value="12h">
          <SegmentedControlLabel>12-hour</SegmentedControlLabel>
        </SegmentedControlItem>
        <SegmentedControlItem value="24h">
          <SegmentedControlLabel>24-hour</SegmentedControlLabel>
        </SegmentedControlItem>
      </SegmentedControl>
      <Status result={result} />
    </Field>
  );
}

function PlainBlock({ result }: { result: Result }) {
  return (
    <div data-testid="card">
      <div data-testid="above" style={{ height: 36 }} />
      <Status result={result} />
    </div>
  );
}

const CASES: [string, (props: { result: Result }) => ReactNode][] = [
  ["a switch row", SwitchRow],
  ["a select field", SelectField],
  ["a segmented control field", SegmentedField],
  ["a plain block", PlainBlock],
];

for (const [name, Setting] of CASES) {
  it(`keeps ${name} the same height whether idle, saved or failed`, () => {
    const { rerender } = render(<Setting result="idle" />);
    const idle = rect("card").height;
    const line = rect("status").height;
    expect(line, `${name}: the idle line reserves no space`).toBeGreaterThan(0);
    for (const result of RESULTS) {
      rerender(<Setting result={result} />);
      expect(rect("card").height, `${name}: ${result} changed the height`).toBe(idle);
      expect(rect("status").height, `${name}: ${result} changed the line`).toBe(line);
    }
  });

  it(`puts the line 4px under the control in ${name}`, () => {
    render(<Setting result="saved" />);
    const gap = rect("status").top - rect("above").bottom;
    expect(Math.abs(gap - 4), `${name}: gap is ${gap}px`).toBeLessThanOrEqual(0.5);
  });
}

it("reserves one footnote line", () => {
  render(<Status result="idle" />);
  const status = screen.getByTestId("status");
  expect(status.getBoundingClientRect().height).toBe(
    Number.parseFloat(getComputedStyle(status).lineHeight),
  );
});

it("doesn't move the switch when the result appears", () => {
  const { rerender } = render(<SwitchRow result="idle" />);
  const top = rect("switch").top;
  for (const result of RESULTS) {
    rerender(<SwitchRow result={result} />);
    expect(rect("switch").top, `${result} moved the switch`).toBe(top);
  }
});
