import { useEffect, useRef } from "react";
import type { ComponentPropsWithRef } from "react";
import { cn } from "../../lib/cn";
import { useMergedRef } from "../../lib/use-merged-ref";
import { observeOtterAnimation } from "./otter-animation-visibility";
import type { StepStatus } from "./steps";
import "./otter-indicator.css";

export interface OtterIndicatorProps extends Omit<ComponentPropsWithRef<"svg">, "children"> {
  status: StepStatus;
}

/**
 * Ottie resting, quietly typing, tilting its head or celebrating.
 * Wait/process loop only while visible. Error/finish play once on entry.
 * Reduced motion shows a still pose. Give it an explicit square box, 40px or larger.
 * Decorative by default; the consumer supplies the nearby status text.
 */
export function OtterIndicator({ status, className, ref, ...props }: OtterIndicatorProps) {
  const node = useRef<SVGSVGElement>(null);
  const [mergedRef] = useMergedRef(node, ref);
  useEffect(() => {
    if (node.current) return observeOtterAnimation(node.current);
  }, []);
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 48 48"
      width="100%"
      height="100%"
      data-slot="otter-indicator"
      {...props}
      ref={mergedRef}
      className={cn("r-otter-indicator", `r-otter-indicator--${status}`, className)}
    >
      <foreignObject key={`art-${status}`} width="48" height="48">
        <div className="r-otter-indicator__viewport">
          <div className="r-otter-indicator__art">
            {status === "wait" ? (
              <div className="r-otter-indicator__rest" />
            ) : (
              <>
                {status !== "finish" && <div className="r-otter-indicator__base" />}
                <div className="r-otter-indicator__frames" />
              </>
            )}
          </div>
        </div>
      </foreignObject>
      {status === "error" && (
        <text
          key={`question-${status}`}
          className="r-otter-indicator__question"
          x="40.3"
          y="11.4"
          fontSize="11.4"
          fontWeight="800"
          transform="rotate(10 40.3 11.4)"
        >
          ?
        </text>
      )}
    </svg>
  );
}
