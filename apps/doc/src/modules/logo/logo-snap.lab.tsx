import { useCallback, useEffect, useId, useRef, useState } from "react";
import type { RefObject } from "react";
import { animate, stagger } from "motion/react";
import type { AnimationPlaybackControlsWithThen } from "motion/react";
import { Button, RaftWordmark } from "raft-ui";

const SNAP_EASE = [0.55, 0, 1, 0.45] as const;
const SETTLE_EASE = [0.16, 1, 0.3, 1] as const;
const WORDMARK_EASE = [0.16, 1, 0.3, 1] as const;

const START = {
  top: { x: "-10%", y: "-62%", rotate: -3.5 },
  bottom: { x: "10%", y: "62%", rotate: 3.5 },
  mark: { scaleX: 1, scaleY: 1 },
  wordmark: { x: "-108%", opacity: 0 },
  sparks: { opacity: 1, scale: 1 },
  flash: { opacity: 0 },
} as const;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function waitForPaint() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve());
    });
  });
}

// Read at playback time so an async run always honours the current preference.
function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function LogoSnapLab() {
  const topRef = useRef<SVGGElement>(null);
  const bottomRef = useRef<SVGGElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const sparksRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const playIdRef = useRef(0);
  const hasPlayedRef = useRef(false);
  const runningRef = useRef<AnimationPlaybackControlsWithThen[]>([]);
  const [playing, setPlaying] = useState(false);

  const stopRunning = useCallback(() => {
    for (const control of runningRef.current) {
      control.stop();
    }
    runningRef.current = [];
  }, []);

  const track = useCallback((control: AnimationPlaybackControlsWithThen) => {
    runningRef.current.push(control);
    return control;
  }, []);

  const resetToStart = useCallback(async () => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    const mark = markRef.current;
    const wordmark = wordmarkRef.current;
    const sparks = sparksRef.current;
    const flash = flashRef.current;
    if (!top || !bottom || !mark || !wordmark || !sparks || !flash) {
      return false;
    }

    const shards = Array.from(sparks.querySelectorAll<SVGGElement>("[data-impact-shard]"));

    stopRunning();

    // Remove any transient styles left by interrupted runs or browser inspection.
    for (const shard of shards) {
      shard.removeAttribute("opacity");
      shard.style.removeProperty("opacity");
      shard.style.removeProperty("transform");
    }
    wordmark.style.removeProperty("opacity");
    wordmark.style.removeProperty("transform");

    // Snap every layer back to the open pose before the next run can start.
    await Promise.all([
      track(
        animate([
          [top, { ...START.top }, { duration: 0 }],
          [bottom, { ...START.bottom }, { duration: 0 }],
          [mark, { ...START.mark }, { duration: 0 }],
          [wordmark, { ...START.wordmark }, { duration: 0 }],
          [sparks, { ...START.sparks }, { duration: 0 }],
          [flash, { ...START.flash }, { duration: 0 }],
        ]),
      ),
      track(animate(shards, { opacity: 0, scale: 0.7 }, { duration: 0 })),
    ]);

    // Force a painted frame so Replay actually shows the split pose.
    await waitForPaint();
    return true;
  }, [stopRunning, track]);

  const play = useCallback(async () => {
    const top = topRef.current;
    const bottom = bottomRef.current;
    const mark = markRef.current;
    const wordmark = wordmarkRef.current;
    const sparks = sparksRef.current;
    const flash = flashRef.current;
    if (!top || !bottom || !mark || !wordmark || !sparks || !flash) {
      return;
    }

    const playId = ++playIdRef.current;
    const stillCurrent = () => playId === playIdRef.current;
    const isReplay = hasPlayedRef.current;

    setPlaying(true);

    try {
      const ready = await resetToStart();
      if (!ready || !stillCurrent()) {
        return;
      }

      if (prefersReducedMotion()) {
        await track(
          animate([
            [top, { y: "0%", rotate: 0 }, { duration: 0 }],
            [bottom, { y: "0%", rotate: 0 }, { duration: 0 }],
            [wordmark, { x: "0%", opacity: 1 }, { duration: 0 }],
          ]),
        );
        return;
      }

      // Hold the open pose so Replay reads as a restart, not a twitch.
      await wait(isReplay ? 70 : 30);
      if (!stillCurrent()) {
        return;
      }

      const snap = track(
        animate([
          [
            top,
            {
              x: ["-10%", "4%", "0%"],
              y: ["-62%", "-16%", "0%"],
              rotate: [-3.5, 1, 0],
            },
            {
              duration: 0.2,
              times: [0, 0.72, 1],
              ease: [SNAP_EASE, SETTLE_EASE],
            },
          ],
          [
            bottom,
            {
              x: ["10%", "-4%", "0%"],
              y: ["62%", "16%", "0%"],
              rotate: [3.5, -1, 0],
            },
            {
              duration: 0.2,
              times: [0, 0.72, 1],
              ease: [SNAP_EASE, SETTLE_EASE],
              at: "<",
            },
          ],
        ]),
      );

      const wordmarkReveal = track(
        animate(
          wordmark,
          { x: "0%", opacity: 1 },
          { duration: 0.24, ease: WORDMARK_EASE, delay: 0.08 },
        ),
      );

      await snap;
      if (!stillCurrent()) {
        return;
      }

      // Comic hit-stop: freeze a couple frames on contact.
      await wait(22);
      if (!stillCurrent()) {
        return;
      }

      const shards = Array.from(sparks.querySelectorAll<SVGGElement>("[data-impact-shard]"));

      await Promise.all([
        track(
          animate(
            mark,
            { scaleX: [1, 1.08, 0.96, 1], scaleY: [1, 0.88, 1.05, 1] },
            { duration: 0.14, ease: SETTLE_EASE },
          ),
        ),
        track(
          animate(
            shards,
            { opacity: [0, 1, 1, 0], scale: [0.88, 1.08, 1, 1] },
            {
              duration: 0.24,
              ease: SETTLE_EASE,
              delay: stagger(0.025),
            },
          ),
        ),
        track(animate(flash, { opacity: [0, 0.65, 0] }, { duration: 0.08, ease: "linear" })),
      ]);

      if (!stillCurrent()) {
        return;
      }

      await track(animate(shards, { opacity: 0, scale: 1 }, { duration: 0 }));
      await wordmarkReveal;
    } finally {
      if (stillCurrent()) {
        hasPlayedRef.current = true;
        setPlaying(false);
      }
    }
  }, [resetToStart, track]);

  useEffect(() => {
    void play();
    return () => {
      playIdRef.current += 1;
      stopRunning();
    };
    // Lab entrance autoplay once on mount (play and stopRunning are stable).
  }, [play, stopRunning]);

  const handleReplay = useCallback(() => {
    void play();
  }, [play]);

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden rounded-xl bg-[oklch(0.97_0.01_95)]">
        <div
          role="img"
          aria-label="Raft"
          data-playing={playing || undefined}
          className="group/logo-snap relative aspect-422/132 w-[min(72%,10rem)]"
        >
          <div className="absolute top-1/2 left-0 z-10 aspect-113/104 h-[78.8%] -translate-y-1/2">
            <div
              ref={markRef}
              className="relative size-full  origin-center group-data-playing/logo-snap:will-change-transform"
            >
              <SnapMarkArtwork topRef={topRef} bottomRef={bottomRef} />

              <div
                ref={flashRef}
                aria-hidden
                className="pointer-events-none absolute inset-[-8%] rounded-[28%] bg-[oklch(0.99_0.02_95)] opacity-0 mix-blend-overlay"
              />

              <div
                ref={sparksRef}
                aria-hidden
                className="pointer-events-none absolute inset-0 origin-center group-data-playing/logo-snap:will-change-transform"
              >
                <ImpactBurst />
              </div>
            </div>
          </div>

          <div className="absolute top-1/2 left-[24%] z-0 h-[78.8%] w-[76%] -translate-y-1/2 overflow-hidden">
            <div
              ref={wordmarkRef}
              className="absolute top-0 left-[8.3%] h-full w-[91.7%] opacity-0 group-data-playing/logo-snap:will-change-transform"
              style={{ transform: "translateX(-108%)" }}
            >
              <RaftWordmark aria-hidden className="size-full " />
            </div>
          </div>
        </div>
      </div>

      <Button type="button" variant="default" size="sm" onClick={handleReplay}>
        {playing ? "Playing…" : "Replay"}
      </Button>
    </div>
  );
}

function SnapMarkArtwork({
  topRef,
  bottomRef,
}: {
  topRef: RefObject<SVGGElement | null>;
  bottomRef: RefObject<SVGGElement | null>;
}) {
  const clipId = useId();
  const topClipId = `${clipId}-top`;
  const bottomClipId = `${clipId}-bottom`;

  return (
    <svg viewBox="0 0 113 104" fill="none" className="size-full  overflow-visible">
      <defs>
        <clipPath id={topClipId} clipPathUnits="userSpaceOnUse">
          <path d="M-10-10H123V43L79 46 67.5 33 38.4 64.8 28 52-10 59Z" />
        </clipPath>
        <clipPath id={bottomClipId} clipPathUnits="userSpaceOnUse">
          <path d="M-10 58 28 51 38.4 63.8 67.5 32 79 45 123 42V114H-10Z" />
        </clipPath>
      </defs>

      <g
        ref={topRef}
        clipPath={`url(#${topClipId})`}
        className="group-data-playing/logo-snap:will-change-transform"
        style={{
          transform: "translate(-10%, -62%) rotate(-3.5deg)",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        <MarkArtwork />
      </g>
      <g
        ref={bottomRef}
        clipPath={`url(#${bottomClipId})`}
        className="group-data-playing/logo-snap:will-change-transform"
        style={{
          transform: "translate(10%, 62%) rotate(3.5deg)",
          transformBox: "fill-box",
          transformOrigin: "center",
        }}
      >
        <MarkArtwork />
      </g>
    </svg>
  );
}

function MarkArtwork() {
  return (
    <>
      <path
        fill="oklch(0.177 0.011 25)"
        d="m112.754 38.743-3.954-22.44c-.572-3.208-2.477-5.797-5.003-7.845-1.254-1.017-5.717-4.876-7.527-6.273C93.713.184 90.362-.325 87.186.184L21.82 11.84c-4.94.73-8.878 1.636-11.91 5.75-3.51 4.748-2.478 9.337-1.652 14.022l3.08 17.517c.128.715.334 1.382.556 2.033-4.32.762-7.734 2.318-9.814 5.383-2.255 3.32-2.43 5.75-1.684 10.005l3.526 20.01c.905 4.209 4.113 6.369 8.782 10.561 5.416 4.828 7.56 7.528 12.975 6.575l70.623-12.45c6.59-1.176 11.005-7.465 9.846-14.055l-3.875-22.012a12 12 0 0 0-.588-2.143l1.287-.239c6.543-1.19 10.926-7.495 9.782-14.038z"
      />
      <path
        fill="oklch(0.985 0.025 88)"
        d="M18.326 87.196 85.17 75.412a4.004 4.004 0 0 0 3.256-4.653l-3.208-18.232a4.004 4.004 0 0 0-4.653-3.255c-2.192.38-4.653.826-5.892 1.048-1.954.35-5.273-.858-5.844-4.066l-1.033-5.844-28.919 31.508c-.905.826-2.97 1.922-5.114 1.413-1.858-.444-3.208-2.064-3.541-3.938l-1.922-10.91-14.578 2.573c-2.192.397-3.653 2.477-3.272 4.653l3.208 18.215a4.004 4.004 0 0 0 4.653 3.256z"
      />
      <path
        fill="oklch(0.985 0.025 88)"
        d="M20.915 45.508c.397 2.192 2.477 3.653 4.653 3.271l5.923-1.048c2.732-.476 5.336 1.35 5.813 4.066l1.032 5.844 28.92-31.508a5.03 5.03 0 0 1 5.113-1.413 5.05 5.05 0 0 1 3.541 3.938l1.922 10.879 13.944-2.541a4.024 4.024 0 0 0 3.24-4.653l-3.288-18.66a4.01 4.01 0 0 0-4.67-3.256L20.868 22.195c-2.192.38-3.637 2.477-3.256 4.653L20.9 45.492z"
      />
    </>
  );
}

function ImpactBurst() {
  return (
    <svg viewBox="0 0 113 104" fill="none" className="absolute inset-0 size-full  overflow-visible">
      <ImpactTriangle points="112,24 127,4 134,11" />
      <ImpactTriangle points="100,0 106,-14 114,-10" />
      <ImpactTriangle points="113,45 133,38 135,46" />
      <ImpactTriangle points="2,76 -17,84 -11,92" />
      <ImpactTriangle points="22,103 14,118 21,121" />
    </svg>
  );
}

function ImpactTriangle({ points }: { points: string }) {
  return (
    <g
      data-impact-shard
      opacity={0}
      className="group-data-playing/logo-snap:will-change-transform"
      style={{
        transform: "scale(0.7)",
        transformBox: "fill-box",
        transformOrigin: "center",
      }}
    >
      <polygon points={points} fill="oklch(0.177 0.011 25)" transform="translate(1.5 2)" />
      <polygon
        points={points}
        fill="oklch(0.985 0.025 88)"
        stroke="oklch(0.177 0.011 25)"
        strokeWidth="1.6"
        strokeLinejoin="miter"
        strokeMiterlimit="12"
        vectorEffect="non-scaling-stroke"
      />
    </g>
  );
}
