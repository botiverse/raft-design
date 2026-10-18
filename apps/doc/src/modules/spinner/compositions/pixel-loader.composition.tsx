import { useEffect, useRef } from "react";
import { animate, stagger, useReducedMotion } from "motion/react";
import type { AnimationPlaybackControlsWithThen } from "motion/react";
import { RaftLogo } from "@botiverse/raft-ui";

const INK = "oklch(0.181 0.005 17.62)";
const WHITE = "oklch(1 0 89.876)";

const PIXEL_SPRITES = [
  {
    background: "oklch(0.783 0.135 219.209)",
    palette: ["transparent", INK, "oklch(0.783 0.135 219.209)", WHITE],
    rows: [
      "00011000",
      "00122100",
      "01232210",
      "12322221",
      "12222221",
      "01222210",
      "00122100",
      "00011000",
    ],
  },
  {
    background: "oklch(0.883 0.162 91.896)",
    palette: ["transparent", INK, "oklch(0.883 0.162 91.896)"],
    rows: [
      "00011000",
      "00011000",
      "11111111",
      "01222210",
      "00122100",
      "01211210",
      "12100121",
      "11000011",
    ],
  },
  {
    background: "oklch(0.749 0.162 0.696)",
    palette: ["transparent", INK, "oklch(0.711 0.168 28.041)"],
    rows: [
      "00000000",
      "01100110",
      "12211221",
      "12222221",
      "12222221",
      "01222210",
      "00122100",
      "00011000",
    ],
  },
  {
    background: "oklch(0.785 0.123 50.111)",
    palette: ["transparent", INK, WHITE],
    rows: [
      "01111110",
      "12222221",
      "12122121",
      "12222221",
      "01222210",
      "01212110",
      "00111100",
      "00011000",
    ],
  },
  {
    background: "oklch(0.783 0.078 294.529)",
    palette: ["transparent", INK, WHITE],
    rows: [
      "00111100",
      "01222210",
      "12122121",
      "12222221",
      "12222221",
      "12211221",
      "12122121",
      "10100101",
    ],
  },
  {
    background: "oklch(0.785 0.123 50.111)",
    palette: [
      "transparent",
      INK,
      "oklch(0.711 0.168 28.041)",
      "oklch(0.785 0.123 50.111)",
      "oklch(0.883 0.162 91.896)",
    ],
    rows: [
      "00010000",
      "00121000",
      "00121100",
      "01322210",
      "01332210",
      "14333210",
      "14433100",
      "01111000",
    ],
  },
  {
    background: "oklch(0.883 0.162 91.896)",
    palette: [INK, "transparent", "oklch(0.883 0.162 91.896)"],
    rows: [
      "01111110",
      "00111100",
      "02022020",
      "02222220",
      "02022020",
      "10222201",
      "11022011",
      "11100111",
    ],
  },
] as const;

const BOUNCE_EASE = [0.16, 1, 0.3, 1] as const;
const SHIFT_EASE = [0.76, 0, 0.24, 1] as const;
const VISIBLE_KEYS = 5;
const KEY_STRIDE = 40;
const LOGO_ITEM = { kind: "logo", background: "oklch(0.883 0.162 91.896)" } as const;
const LOADER_ITEMS = [...PIXEL_SPRITES.slice(0, 3), LOGO_ITEM, ...PIXEL_SPRITES.slice(3)];
const LOOP_ITEMS = [...LOADER_ITEMS, ...LOADER_ITEMS.slice(0, VISIBLE_KEYS)];

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function PixelLoaderComposition() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    if (reduceMotion || !track) {
      return;
    }

    const keys = Array.from(track.querySelectorAll<HTMLDivElement>("[data-pixel-key]"));
    const activeControls = new Set<AnimationPlaybackControlsWithThen>();
    let cancelled = false;

    const run = async (controls: AnimationPlaybackControlsWithThen) => {
      activeControls.add(controls);
      await controls;
      activeControls.delete(controls);
    };

    const loop = async () => {
      let offset = 0;

      while (!cancelled) {
        const visibleKeys = keys.slice(offset, offset + VISIBLE_KEYS);

        await run(
          animate(
            visibleKeys,
            {
              y: [0, -4, 0],
            },
            {
              duration: 0.26,
              times: [0, 0.4, 1],
              ease: BOUNCE_EASE,
              delay: stagger(0.055),
            },
          ),
        );

        if (cancelled) {
          return;
        }

        const nextOffset = offset + 1;
        const leavingKey = visibleKeys[0]!;

        await Promise.all([
          run(animate(track, { x: -nextOffset * KEY_STRIDE }, { duration: 0.2, ease: SHIFT_EASE })),
          run(animate(leavingKey, { opacity: [1, 0] }, { duration: 0.14, ease: SHIFT_EASE })),
        ]);

        await run(animate(leavingKey, { opacity: 1 }, { duration: 0 }));
        offset = nextOffset;

        if (offset === LOADER_ITEMS.length) {
          offset = 0;
          await run(animate(track, { x: 0 }, { duration: 0 }));
        }

        await wait(60);
      }
    };

    void loop();

    return () => {
      cancelled = true;
      for (const controls of activeControls) {
        controls.stop();
      }
    };
  }, [reduceMotion]);

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center rounded-xl bg-[oklch(0.97_0.01_95)]">
      <div role="status" aria-label="Loading" className="h-16 w-[12.25rem] overflow-hidden">
        <div ref={trackRef} className="flex w-max items-start gap-1 pt-3">
          {LOOP_ITEMS.map((item, itemIndex) => (
            <div
              key={
                "rows" in item ? `${itemIndex}-${item.rows.join("")}` : `${itemIndex}-${item.kind}`
              }
              data-pixel-key
              aria-hidden
              className="shrink-0 origin-bottom border-2 border-[oklch(0.181_0.005_17.62)]"
              style={{ boxShadow: `2px 2px 0 ${INK}` }}
            >
              {"rows" in item ? (
                <div
                  className="grid size-8 grid-cols-8 grid-rows-8"
                  style={{
                    backgroundColor: item.background,
                    imageRendering: "pixelated",
                  }}
                >
                  {item.rows
                    .join("")
                    .split("")
                    .map((colorIndex, cellIndex) => (
                      <span
                        key={`${itemIndex}-${cellIndex}`}
                        style={{ backgroundColor: item.palette[Number(colorIndex)] }}
                      />
                    ))}
                </div>
              ) : (
                <div
                  className="grid size-8 place-items-center"
                  style={{ backgroundColor: item.background }}
                >
                  <RaftLogo className="h-5 w-auto" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
