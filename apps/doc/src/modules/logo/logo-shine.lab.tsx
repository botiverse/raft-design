import { useEffect, useRef, useState, type CSSProperties } from "react";
import { animate, type AnimationPlaybackControlsWithThen } from "motion/react";
import { Button, RaftLogoLockup } from "raft-ui";

const SWEEP_EASE = [0.76, 0, 0.24, 1] as const;

type LogoShineLabProps = {
  primaryColor?: string;
};

type ShineStyle = CSSProperties & {
  "--logo-shine-primary": string;
};

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

export function LogoShineLab({ primaryColor = "var(--primary-400)" }: LogoShineLabProps = {}) {
  const logoRef = useRef<HTMLDivElement>(null);
  const sweepRef = useRef<HTMLDivElement>(null);
  const playIdRef = useRef(0);
  const runningRef = useRef<AnimationPlaybackControlsWithThen[]>([]);
  const [playing, setPlaying] = useState(false);

  const stopRunning = () => {
    for (const control of runningRef.current) {
      control.stop();
    }
    runningRef.current = [];
  };

  const track = (control: AnimationPlaybackControlsWithThen) => {
    runningRef.current.push(control);
    return control;
  };

  const play = async (duration = 1.4) => {
    const logo = logoRef.current;
    const sweep = sweepRef.current;
    if (!logo || !sweep) {
      return;
    }

    const playId = ++playIdRef.current;
    const stillCurrent = () => playId === playIdRef.current;

    stopRunning();
    setPlaying(true);

    try {
      await Promise.all([
        track(animate(sweep, { x: "-80%", opacity: 0 }, { duration: 0 })),
        track(animate(logo, { filter: "brightness(1)" }, { duration: 0 })),
      ]);

      await waitForPaint();
      if (!stillCurrent() || prefersReducedMotion()) {
        return;
      }

      await Promise.all([
        track(
          animate(
            sweep,
            {
              x: ["-80%", "80%"],
              opacity: [0, 1, 1, 0],
            },
            {
              duration,
              times: [0, 0.08, 0.92, 1],
              ease: SWEEP_EASE,
            },
          ),
        ),
        track(
          animate(
            logo,
            {
              filter: ["brightness(1)", "brightness(1)", "brightness(1.15)", "brightness(1)"],
            },
            {
              duration,
              times: [0, 0.36, 0.52, 1],
              ease: SWEEP_EASE,
            },
          ),
        ),
      ]);
    } finally {
      if (stillCurrent()) {
        setPlaying(false);
      }
    }
  };

  useEffect(() => {
    void play();
    return () => {
      playIdRef.current += 1;
      stopRunning();
    };
  }, []);

  const shineStyle: ShineStyle = {
    "--logo-shine-primary": primaryColor,
  };

  return (
    <div className="flex w-full flex-col items-center gap-10">
      <div className="relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden rounded-xl bg-[oklch(0.97_0.01_95)]">
        <div
          role="img"
          aria-label="Raft"
          data-playing={playing || undefined}
          className="group/logo-shine relative aspect-[422/104] w-[min(72%,10rem)]"
          style={shineStyle}
        >
          <div
            ref={logoRef}
            className="h-full w-full group-data-[playing]/logo-shine:will-change-[filter]"
          >
            <RaftLogoLockup aria-hidden className="h-full w-full" />
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              maskImage: 'url("/raft-logo.svg")',
              maskPosition: "center",
              maskRepeat: "no-repeat",
              maskSize: "contain",
              WebkitMaskImage: 'url("/raft-logo.svg")',
              WebkitMaskPosition: "center",
              WebkitMaskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
            }}
          >
            <div
              ref={sweepRef}
              className="absolute inset-0 opacity-0 group-data-[playing]/logo-shine:will-change-transform"
              style={{ transform: "translateX(-80%)" }}
            >
              <div
                className="absolute top-[-55%] left-[10%] h-[210%] w-[80%] rotate-[12deg]"
                style={{
                  background:
                    "linear-gradient(90deg, transparent 27%, oklch(1 0 0 / 0.04) 36%, oklch(1 0 0 / 0.16) 43%, oklch(1 0 0 / 0.62) 49%, oklch(1 0 0 / 0.72) 50%, oklch(1 0 0 / 0.46) 52%, oklch(1 0 0 / 0.12) 58%, transparent 70%), linear-gradient(90deg in oklch, color-mix(in oklch, var(--logo-shine-primary) 0%, transparent) 0%, color-mix(in oklch, var(--logo-shine-primary) 8%, transparent) 12%, color-mix(in oklch, var(--logo-shine-primary) 26%, transparent) 26%, color-mix(in oklch, var(--logo-shine-primary) 48%, transparent) 40%, color-mix(in oklch, var(--logo-shine-primary) 68%, transparent) 50%, color-mix(in oklch, var(--logo-shine-primary) 48%, transparent) 60%, color-mix(in oklch, var(--logo-shine-primary) 26%, transparent) 74%, color-mix(in oklch, var(--logo-shine-primary) 8%, transparent) 88%, color-mix(in oklch, var(--logo-shine-primary) 0%, transparent) 100%)",
                  mixBlendMode: "screen",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="button" variant="default" size="sm" onClick={() => void play()}>
          {playing ? "Playing…" : "Replay"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => void play(2.4)}>
          Slow replay
        </Button>
      </div>
    </div>
  );
}
