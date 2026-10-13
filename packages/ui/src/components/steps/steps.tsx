import {
  Children,
  createContext,
  isValidElement,
  use,
  useCallback,
  useId,
  useMemo,
  useState,
} from "react";
import type { ComponentPropsWithRef, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { useThemeFamily } from "../../lib/theme/use-theme";
import "./steps.css";

/** `wait` is ahead, `process` is in progress, `finish` is done and `error` failed. */
export type StepStatus = "process" | "finish" | "error" | "wait";

export type StepsSize = "sm" | "md";

/** `line` joins the steps with a rule; `river` with a channel that fills with water as steps finish. */
export type StepsTrack = "line" | "river";

/** What `renderIndicator` gets for each step. */
export interface StepIndicatorState {
  /** The step's number, counted from 1. */
  index: number;
  status: StepStatus;
  /** Whether this is the `current` step. */
  current: boolean;
  /** The marker the step would show by default: its mark, icon or number. */
  marker: ReactNode;
}

export interface StepsProps extends Omit<ComponentPropsWithRef<"ol">, "onChange"> {
  /**
   * The current step, counted from 1. Steps before it are `finish`, after it
   * `wait`, and the current one takes `status`. Leave it unset with
   * `defaultCurrent` to let clicks move it.
   */
  current?: number;
  /** Initial current step when uncontrolled. */
  defaultCurrent?: number;
  /** Status of the current step. */
  status?: StepStatus;
  /** Marker and text size. */
  size?: StepsSize;
  /** Lays the steps out in a column instead of a row. */
  vertical?: boolean;
  /**
   * How the steps are joined. `river` is a channel: full of water behind
   * finished steps, flowing in behind the step in progress and dry ahead.
   */
  track?: StepsTrack;
  /**
   * Renders a step's marker in place of the default box. The slot keeps the
   * marker's size and centering but drops its fill, border and shadow.
   * Returning `null` or `undefined` keeps the default marker for that step.
   */
  renderIndicator?: (state: StepIndicatorState) => ReactNode;
  /** Replaces the check mark of finished steps. */
  finishIcon?: ReactNode;
  /** Replaces the cross of failed steps. */
  errorIcon?: ReactNode;
  /** Screen-reader text read after a finished step's title. */
  finishLabel?: string;
  /** Screen-reader text read after a failed step's title. */
  errorLabel?: string;
  /**
   * Called with the clicked step's number. Setting it turns every step that
   * isn't `disabled` into a button.
   */
  onUpdateCurrent?: (current: number) => void;
}

export interface StepProps extends Omit<ComponentPropsWithRef<"li">, "title"> {
  title?: ReactNode;
  /** Shown under the title. `children` override it. */
  description?: ReactNode;
  /** Overrides the status the step gets from `current`. */
  status?: StepStatus;
  /** Replaces the number of a step that is waiting or in progress. */
  icon?: ReactNode;
  /** Keeps the step from being clicked when the steps are clickable. */
  disabled?: boolean;
}

type StepsContextValue = {
  current: number | undefined;
  status: StepStatus;
  finishIcon: ReactNode;
  errorIcon: ReactNode;
  finishLabel: string;
  errorLabel: string;
  renderIndicator: ((state: StepIndicatorState) => ReactNode) | undefined;
  /** Set when the steps are clickable. */
  select: ((index: number) => void) | undefined;
};

const StepsContext = createContext<StepsContextValue>({
  current: undefined,
  status: "process",
  finishIcon: undefined,
  errorIcon: undefined,
  finishLabel: "Completed",
  errorLabel: "Failed",
  renderIndicator: undefined,
  select: undefined,
});

/** The step's number, counted from 1, given by `Steps` to each child. */
const StepIndexContext = createContext(0);

const finishMark = (
  <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
    <path
      d="M3.5 8.5l3 3 6-7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);

const errorMark = (
  <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
    <path
      d="M4.5 4.5l7 7M11.5 4.5l-7 7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

/**
 * A step's own `status` wins; otherwise steps before `current` are finished,
 * after it waiting, and the current step takes the steps' `status`. Without a
 * `current` every step is in progress.
 */
function stepStatus(
  index: number,
  current: number | undefined,
  currentStatus: StepStatus,
  own: StepStatus | undefined,
): StepStatus {
  if (own) return own;
  if (current === undefined) return "process";
  if (index < current) return "finish";
  if (index > current) return "wait";
  return currentStatus;
}

/**
 * Numbered steps through a process, as an ordered list of `Step`s. Each child
 * is numbered by its position; the step at `current` gets `aria-current="step"`.
 */
export function Steps({
  current: currentProp,
  defaultCurrent,
  status = "process",
  size = "md",
  vertical = false,
  track = "line",
  renderIndicator,
  finishIcon,
  errorIcon,
  finishLabel = "Completed",
  errorLabel = "Failed",
  onUpdateCurrent,
  className,
  children,
  ...props
}: StepsProps) {
  const theme = useThemeFamily();
  const [uncontrolledCurrent, setUncontrolledCurrent] = useState(defaultCurrent);
  const current = currentProp ?? uncontrolledCurrent;
  const clickable = onUpdateCurrent !== undefined;

  const select = useCallback(
    (index: number) => {
      if (index === current) return;
      setUncontrolledCurrent(index);
      onUpdateCurrent?.(index);
    },
    [current, onUpdateCurrent],
  );

  const context = useMemo<StepsContextValue>(
    () => ({
      current,
      status,
      finishIcon,
      errorIcon,
      finishLabel,
      errorLabel,
      renderIndicator,
      select: clickable ? select : undefined,
    }),
    [
      current,
      status,
      finishIcon,
      errorIcon,
      finishLabel,
      errorLabel,
      renderIndicator,
      clickable,
      select,
    ],
  );

  return (
    <StepsContext value={context}>
      <ol
        data-slot="steps"
        className={cn(
          "r-steps",
          `r-steps--${size}`,
          vertical ? "r-steps--vertical" : "r-steps--horizontal",
          track === "river" && "r-steps--river",
          theme === "elegant" && "r-steps--elegant",
          className,
        )}
        {...props}
      >
        {Children.toArray(children)
          .filter(isValidElement)
          .map((child, index) => (
            <StepIndexContext key={child.key} value={index + 1}>
              {child}
            </StepIndexContext>
          ))}
      </ol>
    </StepsContext>
  );
}

/** The marker of a step: the finish or error mark, else its icon or number. */
function stepMarker(status: StepStatus, icon: ReactNode, index: number, steps: StepsContextValue) {
  if (status === "finish") return steps.finishIcon ?? finishMark;
  if (status === "error") return steps.errorIcon ?? errorMark;
  return (
    icon ?? (
      <span data-slot="step-index" className="r-step__index">
        {index}
      </span>
    )
  );
}

/** Read out after the title: the marker's check or cross says it only by look. */
function StepStatusLabel({ status, steps }: { status: StepStatus; steps: StepsContextValue }) {
  if (status !== "finish" && status !== "error") return null;
  const text = status === "finish" ? steps.finishLabel : steps.errorLabel;
  return <span data-slot="step-status" className="r-step__status">{` ${text}`}</span>;
}

/** One step in `Steps`: a numbered marker, a title and a description. */
export function Step({
  title,
  description,
  status: statusProp,
  icon,
  disabled = false,
  className,
  children,
  ...props
}: StepProps) {
  const steps = use(StepsContext);
  const index = use(StepIndexContext);
  const descriptionId = useId();

  const status = stepStatus(index, steps.current, steps.status, statusProp);
  const isCurrent = steps.current !== undefined && index === steps.current;
  const { select } = steps;
  const body = children ?? description;

  const handleClick = useCallback(() => select?.(index), [select, index]);

  const marker = stepMarker(status, icon, index, steps);
  // `null` or `undefined` from `renderIndicator` keeps the default marker.
  const indicator = steps.renderIndicator?.({ index, status, current: isCurrent, marker });
  const customIndicator = indicator !== undefined && indicator !== null;
  const statusLabel = <StepStatusLabel status={status} steps={steps} />;

  return (
    <li
      data-slot="step"
      aria-current={isCurrent ? "step" : undefined}
      className={cn(
        "r-step",
        `r-step--${status}`,
        select !== undefined && !disabled && "r-step--clickable",
        disabled && "r-step--disabled",
        className,
      )}
      {...props}
    >
      <div data-slot="step-main" className="r-step__main">
        <div
          aria-hidden="true"
          data-slot="step-indicator"
          className={cn("r-step__indicator", customIndicator && "r-step__indicator--custom")}
        >
          {customIndicator ? indicator : marker}
        </div>
        <div data-slot="step-content" className="r-step__content">
          {select === undefined ? (
            <div data-slot="step-title" className="r-step__title">
              {title}
              {statusLabel}
            </div>
          ) : (
            <button
              type="button"
              data-slot="step-title"
              aria-describedby={body == null ? undefined : descriptionId}
              className="r-step__title r-step__button"
              disabled={disabled}
              onClick={handleClick}
            >
              {title}
              {statusLabel}
            </button>
          )}
          {body == null ? null : (
            <div data-slot="step-description" className="r-step__description" id={descriptionId}>
              {body}
            </div>
          )}
        </div>
      </div>
      <div aria-hidden="true" data-slot="step-connector" className="r-step__connector" />
    </li>
  );
}
