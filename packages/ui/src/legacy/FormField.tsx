/**
 * Canonical form-field row — label + control + optional helper / error.
 *
 * Replaces the inline `<div><label className="mb-1 block text-sm font-bold
 * text-black uppercase tracking-wide">…</label><input className="input-brutal
 * …" /></div>` pattern that appears 30+ times across auth pages, dialogs, and
 * settings panels.
 *
 * Background: stdrc 2026-05-12 #wg-theme:a987f888 asked for the strong-signal
 * primitives to be lifted into one PR. FormField is the highest-leverage of
 * the three (FormField / KeyValueRow / SectionHeader) — every multi-field
 * dialog and every auth page is a stack of these.
 *
 * Slots:
 * - `label`     — the field label text (rendered as `<label>` and tied to
 *                 children via the optional `htmlFor`)
 * - `required`  — true → render the `*` marker in `text-brutal-pink`
 * - `optional`  — true → render `(optional)` in `text-black/40 normal-case`
 *                 (mutually exclusive with `required`)
 * - `hint`      — rendered below the control, `text-xs text-black/50`
 * - `error`     — rendered below the control, `text-xs text-brutal-red`,
 *                 takes precedence over hint
 * - `htmlFor`   — forwarded to the `<label htmlFor>` attribute
 * - `labelStyle`— `"uppercase"` (default, matches dialog convention) or
 *                 `"plain"` (matches auth-page convention — sentence/title case)
 * - `size`      — `"default"` (default, `text-sm` + full-opacity black) or
 *                 `"compact"` (`text-xs` + `text-black/60`). Compact mirrors
 *                 the dense Settings form-row label that uses
 *                 `mb-1 block text-xs font-bold text-black/60`. Use compact
 *                 inside Settings forms to preserve the existing density;
 *                 use default inside dialogs / auth pages.
 * - `className` — additional classes appended to the outer wrapper (e.g.
 *                 `mt-2`)
 *
 * The control itself is `children`. FormField does NOT render the `<input>` /
 * `<textarea>` / `<SegmentedControl>` etc. — pass it explicitly. This keeps
 * FormField agnostic of the control library and avoids prop-explosion.
 */

import type { ReactNode, LabelHTMLAttributes } from "react";

const LABEL_BASE_DEFAULT = "mb-1 block text-sm font-bold text-black";
const LABEL_BASE_COMPACT = "mb-1 block text-xs font-bold text-black/60";
const LABEL_UPPERCASE = "uppercase tracking-wide";

export type FormFieldProps = {
  /** Field label text. */
  label: ReactNode;
  /** Show a `*` required marker after the label. */
  required?: boolean;
  /** Show `(optional)` in muted case after the label. Mutually exclusive
   *  with `required`. */
  optional?: boolean;
  /** Helper text rendered below the control. */
  hint?: ReactNode;
  /** Error text rendered below the control (takes precedence over `hint`). */
  error?: ReactNode;
  /** `<label htmlFor>` — point at the inner control's `id`. */
  htmlFor?: LabelHTMLAttributes<HTMLLabelElement>["htmlFor"];
  /** Label case style. `"uppercase"` (default) matches the dialog/settings
   *  convention. `"plain"` matches the auth-page convention. */
  labelStyle?: "uppercase" | "plain";
  /** Label size. `"default"` (default) is `text-sm` + full-opacity black —
   *  matches dialogs / auth pages. `"compact"` is `text-xs` + `text-black/60`
   *  — matches the dense Settings form-row labels. */
  size?: "default" | "compact";
  /** Additional classes appended to the outer `<div>`. */
  className?: string;
  /** The actual control — `<input>`, `<textarea>`, `<SegmentedControl>`,
   *  `<select>`, custom group, etc. */
  children: ReactNode;
};

export default function FormField({
  label,
  required,
  optional,
  hint,
  error,
  htmlFor,
  labelStyle = "uppercase",
  size = "default",
  className,
  children,
}: FormFieldProps) {
  const base = size === "compact" ? LABEL_BASE_COMPACT : LABEL_BASE_DEFAULT;
  const labelCls = `${base} ${labelStyle === "uppercase" ? LABEL_UPPERCASE : ""}`.trim();
  const wrapperCls = className ? className : undefined;
  return (
    <div className={wrapperCls}>
      <label className={labelCls} htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-brutal-pink">*</span> : null}
        {optional ? <span className="ml-1 text-black/40 normal-case">(optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs font-bold text-brutal-red" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-black/50">{hint}</p>
      ) : null}
    </div>
  );
}
