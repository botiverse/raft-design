/**
 * @vitest-environment jsdom
 */
import { afterEach, expect, test, vi } from "vite-plus/test";
import { cleanup, render, screen } from "@testing-library/react";
import { BannerDescription } from "../components/banner/banner";
import { CardFooter } from "../components/card/card";
import { Field, FieldDescription } from "../components/field/field";
import { FormSection } from "../components/form-section/form-section";
import { Text } from "../components/text/text";
import { helperText, isHelperText } from "./helper-text";
import type { HelperText } from "./helper-text";

afterEach(cleanup);

test("helperText() makes a frozen, branded object that isHelperText() knows", () => {
  const text = helperText("Members you remove lose access at once.", {
    why: "audience",
    about: "member",
  });
  expect(isHelperText(text)).toBe(true);
  expect(Object.isFrozen(text)).toBe(true);
  expect(text).toMatchObject({
    content: "Members you remove lose access at once.",
    why: "audience",
    about: "member",
  });
  expect(isHelperText("a sentence")).toBe(false);
  expect(isHelperText({ content: "x", why: "audience", about: "member" })).toBe(false);
  expect(isHelperText(null)).toBe(false);
  // The brand is Symbol.for: a second copy of raft-ui makes the same one.
  expect(isHelperText({ [Symbol.for("raft-ui.helper-text")]: true, content: "x" })).toBe(true);
});

test("a string or a plain object is not a HelperText to the type checker", () => {
  // @ts-expect-error -- a string is not a HelperText
  const fromString: HelperText = "a sentence";
  // @ts-expect-error -- `why` is a closed union
  helperText("x", { why: "nice-to-know", about: "channel" });
  expect(fromString).toBe("a sentence");
});

test("a slot renders the content with data-why and data-about", () => {
  render(
    <Field>
      <FieldDescription data-testid="d">
        {helperText(
          <>
            Anyone with the link can join. <b>Reset it</b> to stop that.
          </>,
          { why: "audience", about: "invite link" },
        )}
      </FieldDescription>
    </Field>,
  );
  const element = screen.getByTestId("d");
  expect(element.dataset.slot).toBe("field-description");
  expect(element.dataset.why).toBe("audience");
  expect(element.dataset.about).toBe("invite link");
  expect(element.textContent).toBe("Anyone with the link can join. Reset it to stop that.");
});

test("useRender slots, FormSection and Text muted render the same attributes", () => {
  const note = helperText("Retry from Settings.", { why: "recovery", about: "sync" });
  render(
    <>
      <BannerDescription data-testid="banner">{note}</BannerDescription>
      <CardFooter data-testid="footer">{note}</CardFooter>
      <FormSection title="Sync" data-testid="section" description={note} />
      <Text.Sans variant="muted" data-testid="text">
        {note}
      </Text.Sans>
    </>,
  );
  for (const id of ["banner", "footer", "text"]) {
    const element = screen.getByTestId(id);
    expect(element.dataset.why).toBe("recovery");
    expect(element.dataset.about).toBe("sync");
    expect(element.textContent).toBe("Retry from Settings.");
  }
  const description = screen
    .getByTestId("section")
    .querySelector<HTMLElement>("[data-slot=form-section-description]");
  expect(description?.dataset.why).toBe("recovery");
  expect(screen.getByTestId("text").className).toContain("text-foreground-muted");
});

test("a slot given anything else still renders it and warns once in development", () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  try {
    render(
      <>
        <BannerDescription data-testid="a">{"Couldn't load." as never}</BannerDescription>
        <BannerDescription data-testid="b">{"Couldn't save." as never}</BannerDescription>
      </>,
    );
    expect(screen.getByTestId("a").textContent).toBe("Couldn't load.");
    expect(screen.getByTestId("a").dataset.why).toBeUndefined();
    const warnings = warn.mock.calls.filter(([message]) =>
      String(message).includes("BannerDescription takes a HelperText"),
    );
    expect(warnings).toHaveLength(1);
  } finally {
    warn.mockRestore();
  }
});

test("Text: small and caption are base ink, Mono meta the hint tier, note the hint tier", () => {
  render(
    <>
      <Text.Sans size="small" data-testid="small">
        a
      </Text.Sans>
      <Text.Sans size="caption" data-testid="caption">
        a
      </Text.Sans>
      <Text.Mono size="meta" data-testid="meta">
        10:51
      </Text.Mono>
      <Text.Sans variant="note" data-testid="note">
        3 members
      </Text.Sans>
    </>,
  );
  expect(screen.getByTestId("small").className).toContain("text-foreground");
  expect(screen.getByTestId("small").className).not.toContain("text-foreground-muted");
  expect(screen.getByTestId("caption").className).not.toContain("text-foreground-muted");
  expect(screen.getByTestId("meta").className).toContain("text-foreground-hint");
  expect(screen.getByTestId("note").className).toContain("text-foreground-hint");
});

test("Text variant=muted takes only a HelperText", () => {
  render(
    <>
      {/* @ts-expect-error -- muted takes a HelperText */}
      <Text.Sans variant="muted">a bare sentence</Text.Sans>
      {/* @ts-expect-error -- a heading is never helper text */}
      <Text.Heading variant="muted">a</Text.Heading>
      {/* @ts-expect-error -- placeholder is renamed to note */}
      <Text.Mono variant="placeholder">a</Text.Mono>
    </>,
  );
});
