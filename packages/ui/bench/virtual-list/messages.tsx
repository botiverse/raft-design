/*
 * Message-like rows for the scroll benchmark: an avatar and a header (or a grouped follow-up without
 * them), 1-8 lines of text, some with an image in a fixed aspect box, a code block or reactions. Seeded,
 * so every run renders the same rows.
 */
import { memo } from "react";
import type { CSSProperties } from "react";

import type { VirtualListItemRenderProps } from "../../src/components/virtual-list";

export interface BenchMessage {
  key: string;
  index: number;
  author: number;
  grouped: boolean;
  time: string;
  paragraphs: string[];
  image: { width: number; ratio: string } | null;
  code: string | null;
  reactions: string[];
}

const AUTHORS = ["Ada", "Grace", "Linus", "Barbara", "Ken", "Margaret", "Dennis", "Frances"];
const WORDS =
  "the list keeps every row it has measured and estimates the rest so the scrollbar stays honest while new rows mount below the view and old ones leave above it without moving anything in sight".split(
    " ",
  );
const RATIOS = ["4 / 3", "16 / 9", "1 / 1", "3 / 4", "21 / 9"];
const EMOJI = ["+1", "eyes", "tada", "heart", "rocket", "fire"];

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createMessages(count: number, seed = 42): BenchMessage[] {
  const random = mulberry32(seed);
  const pick = <T,>(list: readonly T[]) => list[Math.floor(random() * list.length)]!;
  const messages: BenchMessage[] = [];
  let author = 0;
  for (let index = 0; index < count; ++index) {
    const grouped = index > 0 && random() < 0.4;
    if (!grouped) {
      author = Math.floor(random() * AUTHORS.length);
    }
    // 1-8 lines at ~80 characters a line, in one to three paragraphs.
    const lines = 1 + Math.floor(random() * 8);
    const paragraphCount = Math.min(lines, 1 + Math.floor(random() * 3));
    const paragraphs: string[] = [];
    for (let p = 0; p < paragraphCount; ++p) {
      const chars = Math.round((lines / paragraphCount) * 80 * (0.6 + random() * 0.4));
      let text = "";
      while (text.length < chars) {
        text += `${pick(WORDS)} `;
      }
      paragraphs.push(text.trim());
    }
    messages.push({
      key: `m-${index}`,
      index,
      author,
      grouped,
      time: `${String(9 + Math.floor(index / 60)).padStart(2, "0")}:${String(index % 60).padStart(2, "0")}`,
      paragraphs,
      image:
        random() < 0.18 ? { width: 240 + Math.floor(random() * 160), ratio: pick(RATIOS) } : null,
      code: random() < 0.08 ? "const range = getVerticalRange(tree);\nflushSync(render);\n" : null,
      reactions:
        random() < 0.25
          ? Array.from({ length: 1 + Math.floor(random() * 4) }, () => pick(EMOJI))
          : [],
    });
  }
  return messages;
}

type DomRef = VirtualListItemRenderProps<BenchMessage>["domRef"];

const AVATAR_HUES = [20, 80, 140, 200, 260, 320, 50, 170];

export const MessageRow = memo(function MessageRow({
  message,
  domRef,
  style,
}: {
  message: BenchMessage;
  domRef: DomRef | null;
  style?: CSSProperties | undefined;
}) {
  const name = AUTHORS[message.author]!;
  return (
    <div
      ref={domRef ?? undefined}
      className={message.grouped ? "bench-msg bench-msg--grouped" : "bench-msg"}
      data-message={message.key}
      style={style}
    >
      <div className="bench-msg__gutter">
        {message.grouped ? (
          <span className="bench-msg__hover-time">{message.time}</span>
        ) : (
          <div
            className="bench-msg__avatar"
            style={{ background: `oklch(0.7 0.12 ${AVATAR_HUES[message.author]})` }}
          >
            {name.slice(0, 2)}
          </div>
        )}
      </div>
      <div className="bench-msg__body">
        {message.grouped ? null : (
          <div className="bench-msg__header">
            <span className="bench-msg__name">{name}</span>
            <time className="bench-msg__time">{message.time}</time>
          </div>
        )}
        <div className="bench-msg__content">
          {message.paragraphs.map((text: string, i: number) => (
            // oxlint-disable-next-line react/no-array-index-key -- static paragraphs
            <p key={i}>
              {text.split(" ").map((word: string, w: number) =>
                w % 17 === 5 ? (
                  // oxlint-disable-next-line react/no-array-index-key -- static words
                  <strong key={w}>{word} </strong>
                ) : (
                  `${word} `
                ),
              )}
            </p>
          ))}
          {message.code === null ? null : <pre className="bench-msg__code">{message.code}</pre>}
          {message.image === null ? null : (
            <div
              className="bench-msg__image"
              style={{ width: message.image.width, aspectRatio: message.image.ratio }}
            />
          )}
        </div>
        {message.reactions.length === 0 ? null : (
          <div className="bench-msg__reactions">
            {message.reactions.map((reaction: string, i: number) => (
              // oxlint-disable-next-line react/no-array-index-key -- static reactions
              <button key={i} type="button" className="bench-msg__reaction">
                {reaction} {1 + i}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
