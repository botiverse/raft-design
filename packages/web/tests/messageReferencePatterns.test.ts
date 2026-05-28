import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { createChannelRefRegex, createChannelThreadRefRegex } from "../src/utils/messageReferencePatterns";

test("channel refs support CJK channel names", () => {
  const matches = Array.from("go to #对话流专修 and #android-artifacts".matchAll(createChannelRefRegex()));

  assert.deepEqual(matches.map((match) => match[1]), ["对话流专修", "android-artifacts"]);
});

test("channel thread refs support CJK channel names", () => {
  const matches = Array.from("see #对话流专修:abc123 and #product:deadbee".matchAll(createChannelThreadRefRegex()));

  assert.deepEqual(matches.map((match) => [match[1], match[2]]), [
    ["对话流专修", "abc123"],
    ["product", "deadbee"],
  ]);
});

test("MessageItem uses the shared Unicode-aware channel reference patterns", () => {
  const source = readFileSync(new URL("../src/components/message/MessageItem.tsx", import.meta.url), "utf8");

  assert.match(source, /createChannelThreadRefRegex\(\)/);
  assert.match(source, /createChannelRefRegex\(\)/);
  assert.doesNotMatch(source, /#\(\[\\w-\]\+\)/);
});

test("MessageItem renders mention handles rather than display names", () => {
  const source = readFileSync(new URL("../src/components/message/MessageItem.tsx", import.meta.url), "utf8");

  assert.match(source, /const safeName = name\.replace/);
  assert.match(source, /data-mention="\$\{safeName\}"/);
  assert.match(source, />@\$\{safeName\}<\/a>/);
  assert.doesNotMatch(source, />@\$\{safeDisplay\}<\/a>/);
  assert.doesNotMatch(source, />@\$\{entry\.displayName\}<\/a>/);
});

test("all message reference chips share one height box (MSG_REF_CHIP)", () => {
  const chipConst = readFileSync(
    new URL("../src/components/message/messageRefChip.ts", import.meta.url),
    "utf8",
  );
  const source = readFileSync(new URL("../src/components/message/MessageItem.tsx", import.meta.url), "utf8");
  const mention = readFileSync(
    new URL("../src/components/message/MentionLink.tsx", import.meta.url),
    "utf8",
  );
  const taskRefSection = source.slice(
    source.indexOf("const taskRef"),
    source.indexOf("const slockPermalink"),
  );

  // Single source of truth lives in its OWN module so MentionLink can import
  // the same constant (Huarong review #proj-message:ca65d96d found the
  // self-mention chip drifting on its own leading-[21px] box when the const
  // was MessageItem-local). Every chip composes it → "all chips one height"
  // is structurally guaranteed (stdrc task #28 msg=dee00ea3). leading 21px
  // -> 19px sits at the inline-code background-box height. No `cursor` in the
  // shared box: in-message refs are app chrome and stay on the arrow cursor
  // (stdrc task #28 msg=ca65d96d) — each in-app chip appends `cursor-default`
  // explicitly; only the trailing external-URL <a target="_blank"> keeps the
  // browser link-hand.
  assert.match(
    chipConst,
    /export const MSG_REF_CHIP =\s*"inline-block whitespace-nowrap border border-black px-1 text-sm font-bold leading-\[21px\] select-text"/,
  );
  assert.match(chipConst, /whitespace-nowrap.*task #16/s);

  // Both renderers import the one constant — neither re-inlines the box.
  assert.match(source, /import \{ MSG_REF_CHIP \} from "\.\/messageRefChip"/);
  assert.match(mention, /import \{ MSG_REF_CHIP \} from "\.\/messageRefChip"/);

  // MessageItem chip variants compose it.
  assert.match(source, /data-thread-ref[\s\S]*?className=\{`\$\{MSG_REF_CHIP\} bg-brutal-cyan\/30/);
  assert.match(source, /dataChannel[\s\S]*?className=\{`\$\{MSG_REF_CHIP\} bg-brutal-pink\/30 text-black cursor-default/);
  assert.match(source, /dataTaskRef[\s\S]*?className=\{`\$\{MSG_REF_CHIP\} bg-brutal-yellow\/40 text-black cursor-default/);
  assert.match(source, /slockPermalink[\s\S]*?className=\{`\$\{MSG_REF_CHIP\} cursor-default/);
  assert.match(source, /data-thread-ref[\s\S]*?cursor-wait opacity-80[\s\S]*?cursor-default hover:bg-brutal-cyan\/60/);
  assert.match(source, /text-\[10px\] font-normal leading-none text-black\/50/);

  // MentionLink self-mention chip composes the SAME box (Huarong blocker).
  assert.match(mention, /isSelfMention\s*\?\s*`\$\{MSG_REF_CHIP\} bg-brutal-yellow hover:bg-brutal-yellow\/80`/);

  // No chip (in either renderer) may re-inline the old box or a link-hand cursor.
  assert.doesNotMatch(source, /inline-block border border-black[^"`]*leading-\[21px\]/);
  assert.doesNotMatch(mention, /inline-block border border-black[^"`]*leading-\[21px\]/);
  assert.doesNotMatch(source, /cursor-pointer/);
  assert.doesNotMatch(mention, /cursor-pointer/);
  assert.doesNotMatch(source, /dataTaskRef[\s\S]*?bg-brutal-lime/);
  assert.doesNotMatch(taskRefSection, /inline-flex/);
  assert.doesNotMatch(taskRefSection, /font-mono text-sm/);
  assert.doesNotMatch(taskRefSection, /py-0\.5/);
  assert.doesNotMatch(taskRefSection, /leading-none/);
  assert.doesNotMatch(taskRefSection, /border-2/);
  assert.doesNotMatch(source, /inline-flex h-5 items-center/);
});
