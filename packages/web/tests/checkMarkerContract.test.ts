import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import CheckMarker from "../src/components/ui/CheckMarker";

const repoRoot = resolve(import.meta.dirname, "..");
const read = (path: string) => readFileSync(resolve(repoRoot, path), "utf8");

test("CheckMarker owns square circle black and yellow check visuals", () => {
  const formHtml = renderToStaticMarkup(
    React.createElement(CheckMarker, {
      checked: true,
      size: "md",
      tone: "black-fill",
    }),
  );
  const listHtml = renderToStaticMarkup(
    React.createElement(CheckMarker, {
      checked: true,
      size: "lg",
      tone: "yellow-fill",
    }),
  );
  const messageHtml = renderToStaticMarkup(
    React.createElement(CheckMarker, {
      checked: true,
      shape: "circle",
      size: "lg",
      tone: "yellow-fill",
    }),
  );

  assert.match(formHtml, /size-4/);
  assert.match(formHtml, /bg-black text-white/);
  assert.match(listHtml, /size-5/);
  assert.match(listHtml, /bg-brutal-yellow text-black/);
  assert.match(messageHtml, /rounded-full/);
  assert.match(messageHtml, /bg-brutal-yellow text-black/);
});

test("checkbox and selection callsites share CheckMarker instead of hand-rolled visuals", () => {
  const brutalCheckbox = read("src/components/ui/Checkbox.tsx");
  const machineDetail = read("src/components/machine/MachineDetailPanel.tsx");
  const messageItem = read("src/components/message/MessageItem.tsx");

  assert.match(brutalCheckbox, /import CheckMarker/);
  assert.match(brutalCheckbox, /<CheckMarker[\s\S]*tone="black-fill"/);
  assert.match(machineDetail, /import CheckMarker from "\.\.\/ui\/CheckMarker"/);
  assert.match(machineDetail, /<CheckMarker[\s\S]*checked=\{selected\}[\s\S]*tone="yellow-fill"/);
  assert.match(messageItem, /import CheckMarker from "\.\.\/ui\/CheckMarker"/);
  assert.match(messageItem, /<CheckMarker[\s\S]*checked=\{isSelected\}[\s\S]*shape="circle"[\s\S]*tone="yellow-fill"/);
  assert.equal(existsSync(resolve(repoRoot, "src/components/ui/SelectionCheckbox.tsx")), false);
  assert.doesNotMatch(messageItem, /className=\{`shrink-0 self-start mt-1\.5 size-5 rounded-full border-2 border-black/);
});
