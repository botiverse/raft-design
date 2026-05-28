import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

/**
 * Badge tones map to the brutal palette. The primitive owns the bg →
 * caller never writes `bg-brutal-*` via className. Adding a new tone
 * means adding a row here, not a one-off override at the callsite.
 *
 * Hidden context:
 * - PR #1905 / #proj-theme:ac79cf20 stdrc msg=6ce4d8bf — colors /
 *   uppercase / tracking all used to leak through caller className;
 *   the primitive now owns them.
 * - stdrc msg=6db77368 — "Badges and task status 都应该大写（内容
 *   应该是 Title case ... css 在 Brutal 主题下全大写（将来我们会有
 *   别的主题）)". Content stays Title Case (e.g. "In Progress"); the
 *   brutal theme's CSS does the visual uppercase + tracking-wide
 *   transform here in the primitive. A future non-brutal skin can
 *   render the same Title Case content without uppercase.
 * - stdrc msg=ce25da45 (option B msg=65681d15) — status badges that
 *   sit next to case-sensitive identifiers (e.g. `task #N @assignee`)
 *   must opt out of uppercase, because `@bugen` ≠ `@BUGEN`. Hence
 *   `uppercase?: boolean` axis: default true preserves the brutal
 *   contract for label-only badges; status callsites pass `false`.
 */
export const BADGE_TONE_CLASSES = {
  white: "bg-white text-black",
  yellow: "bg-brutal-yellow text-black",
  pink: "bg-brutal-pink text-black",
  cyan: "bg-brutal-cyan text-black",
  lavender: "bg-brutal-lavender text-black",
  orange: "bg-brutal-orange text-black",
  lime: "bg-brutal-lime text-black",
  red: "bg-brutal-red text-black",
  stone: "bg-brutal-stone text-black",
} as const;

export type BadgeTone = keyof typeof BADGE_TONE_CLASSES;

interface BadgeStyleProps {
  /** Background tone from the brutal palette. Defaults to `white`. */
  tone?: BadgeTone;
  /**
   * Apply the brutal uppercase + tracking-wide transform. Defaults to
   * true (label-only badges). Status badges pass `false` because they
   * mix label content with case-sensitive identifiers (`@assignee`).
   */
  uppercase?: boolean;
}

export function brutalBadgeClassName({
  tone = "white",
  uppercase = true,
  className = "",
}: BadgeStyleProps & { className?: string } = {}) {
  return [
    "inline-flex h-5 min-w-0 max-w-full items-center gap-1 overflow-hidden whitespace-nowrap border border-black px-1.5 text-[10px] font-bold leading-none",
    uppercase ? "uppercase tracking-wide" : null,
    BADGE_TONE_CLASSES[tone],
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    BadgeStyleProps {
  children?: ReactNode;
}

export function Badge({ tone, uppercase, className = "", children, ...props }: BadgeProps) {
  return (
    <span className={brutalBadgeClassName({ tone, uppercase, className })} {...props}>
      {children}
    </span>
  );
}

export interface BadgeButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    BadgeStyleProps {
  children?: ReactNode;
}

export function BadgeButton({
  tone,
  uppercase,
  className = "",
  type = "button",
  children,
  ...props
}: BadgeButtonProps) {
  return (
    <button
      type={type}
      className={brutalBadgeClassName({ tone, uppercase, className })}
      {...props}
    >
      {children}
    </button>
  );
}

export default Badge;
