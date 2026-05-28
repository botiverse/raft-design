import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const repoRoot = resolve(import.meta.dirname, "..");

test("search channel filter is an input-backed combobox, not a pure select list", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/search/MessageSearchPage.tsx"), "utf8");
  const tasksSource = readFileSync(resolve(repoRoot, "src/components/task/TasksPanel.tsx"), "utf8");
  const primitiveSource = readFileSync(resolve(repoRoot, "src/components/ui/SelectionPopover.tsx"), "utf8");

  assert.match(source, /const \[channelFilterQuery, setChannelFilterQuery\] = useState\(""\);/);
  assert.match(source, /const filteredChannels = useMemo\(\(\) => \{/);
  assert.match(source, /import SelectionPopover from "\.\.\/ui\/SelectionPopover";/);
  assert.match(tasksSource, /import SelectionPopover from "\.\.\/ui\/SelectionPopover";/);
  assert.match(primitiveSource, /interface SearchableSelectionPopoverProps[\s\S]*searchable: true/);
  assert.match(primitiveSource, /interface PlainSelectionPopoverProps[\s\S]*searchable\?: false/);
  assert.match(source, /<SelectionPopover[\s\S]*title="Channels"[\s\S]*searchable[\s\S]*search=\{channelFilterQuery\}[\s\S]*onSearchChange=\{setChannelFilterQuery\}/);
  assert.match(source, /options=\{filteredChannels\.map\(\(ch\) => \(\{/);
  assert.match(source, /leading: <Hash size=\{12\} className="text-black\/50" \/>/);
  assert.match(source, /filteredChannels\.map\(\(ch\) =>/);
  assert.doesNotMatch(source, /max-h-\[240px\] min-w-\[200px\] overflow-y-auto[\s\S]{0,200}channels\.map\(\(ch\) =>/);
  assert.doesNotMatch(source, /className="input-brutal w-full px-2 py-1 text-xs font-mono"/);
  assert.doesNotMatch(source, /SearchableFilterPopover/);
  assert.doesNotMatch(tasksSource, /SearchableFilterPopover/);
});

test("search sender filter is a standard member selection popover, not the old My messages boolean chip", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/search/MessageSearchPage.tsx"), "utf8");

  assert.match(source, /const \[senderFilterQuery, setSenderFilterQuery\] = useState\(""\);/);
  assert.match(source, /const senderOptions = useMemo<SenderFilterOption\[\]>\(\(\) => \{/);
  assert.match(source, /members\.map<SenderFilterOption>/);
  assert.match(source, /agents[\s\S]*\.map<SenderFilterOption>/);
  assert.match(source, /<SelectionPopover[\s\S]*title="From"[\s\S]*searchable[\s\S]*search=\{senderFilterQuery\}[\s\S]*onSearchChange=\{setSenderFilterQuery\}/);
  assert.match(source, /updateSearchParam\("senderId", sender\.id\)/);
  assert.match(source, /context="compact-list"/);
  assert.doesNotMatch(source, /My messages/);
  assert.doesNotMatch(source, /myMessagesOnly/);
});

test("search time filter uses the plain mode of the same selection popover", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/search/MessageSearchPage.tsx"), "utf8");

  assert.match(source, /<SelectionPopover[\s\S]*title="Time"[\s\S]*options=\{\(\["any", "today", "7d", "30d"\] as SearchTimeRange\[\]\)\.map/);
  assert.doesNotMatch(source, /title="Time"[\s\S]{0,200}searchable/);
});

test("message search can run from filters alone without querying on an empty panel", () => {
  const source = readFileSync(resolve(repoRoot, "src/components/search/MessageSearchPage.tsx"), "utf8");

  assert.match(source, /const hasSearchIntent = Boolean\(query\.trim\(\) \|\| hasActiveFilters\);/);
  assert.match(source, /if \(!trimmed && !hasFilters\) return null;/);
  assert.match(source, /disabled=\{!query\.trim\(\)\}/);
  assert.match(source, /No matching messages/);
});
