import type { ReactNode } from "react";

/**
 * Why an explanatory sentence is on screen. Without it the reader would
 * - `consequence`: miss a consequence, something lost or undone;
 * - `audience`: not know who will see the thing, or who it affects;
 * - `recovery`: not know how to get out of a failure.
 *
 * Closed on purpose: a sentence that names none of the three is cut, or its
 * job is done by the layout (design/content/writing.md#helper-text).
 */
export type HelperTextWhy = "consequence" | "audience" | "recovery";

/**
 * An app names its own nouns for `about` by augmenting this interface:
 *
 * ```ts
 * declare module "@botiverse/raft-ui" {
 *   interface HelperTextRegister {
 *     about: "channel" | "agent" | "API key";
 *   }
 * }
 * ```
 *
 * Without it, `about` is any string.
 */
// oxlint-disable-next-line typescript/no-empty-interface, typescript/no-empty-object-type -- an interface apps augment
export interface HelperTextRegister {}

/** The thing a helper sentence is about: `HelperTextRegister["about"]`, else any string. */
export type HelperTextAbout = HelperTextRegister extends { about: infer A extends string }
  ? A
  : string;

export interface HelperTextMeta {
  why: HelperTextWhy;
  /** The thing the sentence is about: "channel", "API key", "invite link". */
  about: HelperTextAbout;
}

declare const helperTextBrand: unique symbol;

/**
 * An explanatory sentence that says why it exists. Only `helperText()` makes
 * one, and only the explanation slots (FieldDescription, DialogDescription,
 * BannerDescription, `Text variant="muted"` …) render it. It is an object,
 * not a string, so it can't be written into a bare element as text.
 */
export interface HelperText extends Readonly<HelperTextMeta> {
  readonly [helperTextBrand]: true;
  /** A string, or rich output: a TextLink, `<b>`, a formatted message's parts. */
  readonly content: ReactNode;
}

/**
 * The props of an explanation slot: its element's props, with `children`
 * replaced by a required `HelperText`.
 */
export type HelperTextSlotProps<P> = Omit<P, "children"> & { children: HelperText };

/** The runtime brand. `Symbol.for`, so two copies of raft-ui in one app agree. */
const HELPER_TEXT = Symbol.for("raft-ui.helper-text");

const WHYS: ReadonlySet<string> = new Set<HelperTextWhy>(["consequence", "audience", "recovery"]);

const warned = new Set<string>();

function warnOnce(message: string) {
  if (process.env.NODE_ENV === "production" || warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

/**
 * Make an explanatory sentence, saying why it is there and what it is about:
 *
 * ```tsx
 * <AlertDialogDescription>
 *   {helperText(`Messages in #${name} will be deleted for everyone.`, {
 *     why: "consequence",
 *     about: "channel",
 *   })}
 * </AlertDialogDescription>
 * ```
 */
export function helperText(content: ReactNode, meta: HelperTextMeta): HelperText {
  if (process.env.NODE_ENV !== "production") {
    if (!WHYS.has(meta.why)) {
      warnOnce(
        `raft-ui: helperText() got why="${String(meta.why)}". A helper sentence exists only for "consequence", "audience" or "recovery"; cut one that names none of them.`,
      );
    }
    if (typeof meta.about !== "string" || meta.about.trim() === "") {
      warnOnce("raft-ui: helperText() needs `about`: the thing the sentence is about.");
    }
  }
  return Object.freeze({
    [HELPER_TEXT]: true,
    content,
    why: meta.why,
    about: meta.about,
  }) as unknown as HelperText;
}

/** Whether `value` was made by `helperText()` (from any copy of raft-ui). */
export function isHelperText(value: unknown): value is HelperText {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as Record<symbol, unknown>)[HELPER_TEXT] === true
  );
}

export interface HelperTextSlotRender {
  children: ReactNode;
  "data-why"?: HelperTextWhy;
  "data-about"?: string;
}

/**
 * What an explanation slot renders for its `children`: the sentence, with its
 * `why` and `about` as `data-why` and `data-about`. Anything else (passed
 * through `as never`, or from untyped code) still renders, and warns once per
 * slot in development.
 */
export function helperTextSlot(slot: string, value: unknown): HelperTextSlotRender {
  if (isHelperText(value)) {
    return { children: value.content, "data-why": value.why, "data-about": value.about };
  }
  warnOnce(
    `raft-ui: ${slot} takes a HelperText as its children: helperText(content, { why, about }). A line that is not a consequence (consequence), who will see it (audience) or how to recover (recovery) is cut or goes in a data part. See https://raft-design.botiverse.build/content/writing/#helper-text`,
  );
  return { children: value as ReactNode };
}

/** What a slot's `children` draws: a HelperText's content, else the value itself. */
export function helperTextContent(value: unknown): ReactNode {
  return isHelperText(value) ? value.content : (value as ReactNode);
}
