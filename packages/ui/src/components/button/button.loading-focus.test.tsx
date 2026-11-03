/**
 * @vitest-environment jsdom
 *
 * A busy button keeps the focus a press left on it. Natively disabling a
 * focused button drops focus to <body>, and it doesn't come back when the wait
 * ends ("Sign in with Raft" pressed, the request fails, focus is lost). So
 * while `loading` (and not otherwise `disabled`) Button is aria-disabled, not
 * natively disabled, and blocks activation itself: no click, no Enter or
 * Space, no form submission, so a double submit is still impossible. A
 * disabled button stays natively disabled.
 */
import { afterEach, describe, expect, test, vi } from "vite-plus/test";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";

afterEach(cleanup);

describe("Button loading keeps focus", () => {
  test("a loading button is not natively disabled and is aria-disabled", () => {
    render(<Button loading>Sign In</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveProperty("disabled", false);
    expect(button.hasAttribute("disabled")).toBe(false);
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(button.tabIndex).toBe(0);
  });

  test("the spinner names the busy button (loadingLabel)", () => {
    render(
      <Button loading loadingLabel="Signing In">
        Sign In
      </Button>,
    );
    expect(screen.getByRole("button", { name: /Signing In/ })).toBeTruthy();
  });

  test("a focused button stays focused once loading starts", () => {
    const SignIn = ({ loading }: { loading: boolean }) => (
      <>
        <Button loading={loading}>Sign In</Button>
        <button type="button">Elsewhere</button>
      </>
    );
    const { rerender } = render(<SignIn loading={false} />);
    const button = screen.getByRole("button", { name: "Sign In" });
    act(() => button.focus());
    expect(document.activeElement).toBe(button);

    rerender(<SignIn loading />);
    expect(button.getAttribute("data-loading")).toBe("true");
    // jsdom runs no focus fixup, so it keeps a natively disabled button
    // focused where a browser drops focus to <body>; what it does enforce is
    // that a disabled button can't take focus. So the focus has to be able to
    // come back to the busy button.
    expect(document.activeElement).toBe(button);
    act(() => screen.getByRole("button", { name: "Elsewhere" }).focus());
    act(() => button.focus());
    expect(document.activeElement).toBe(button);
  });

  test("click does not fire while loading", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Sign In
      </Button>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  test("Enter and Space are blocked while loading; Tab still moves on", () => {
    const onKeyDown = vi.fn();
    render(
      <Button loading onKeyDown={onKeyDown}>
        Sign In
      </Button>,
    );
    const button = screen.getByRole("button");
    // A native button activates from Enter's keydown and Space's keyup; a
    // prevented keydown cancels both. fireEvent returns false when prevented.
    expect(fireEvent.keyDown(button, { key: "Enter" })).toBe(false);
    expect(fireEvent.keyDown(button, { key: " " })).toBe(false);
    expect(onKeyDown).not.toHaveBeenCalled();
    expect(fireEvent.keyDown(button, { key: "Tab" })).toBe(true);
  });

  test("a loading submit button does not submit its form", () => {
    const onSubmit = vi.fn((event: { preventDefault(): void }) => event.preventDefault());
    const { rerender } = render(
      <form onSubmit={onSubmit}>
        <Button type="submit" loading>
          Sign In
        </Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).not.toHaveBeenCalled();

    // CONTROL: the same button submits once the wait ends, so the assertion
    // above can see a submit.
    rerender(
      <form onSubmit={onSubmit}>
        <Button type="submit">Sign In</Button>
      </form>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  test("a disabled button (not loading) is still natively disabled", () => {
    render(<Button disabled>Sign In</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveProperty("disabled", true);
    expect(button.getAttribute("aria-disabled")).toBeNull();
  });

  test("a disabled button that is also loading stays natively disabled", () => {
    render(
      <Button disabled loading>
        Sign In
      </Button>,
    );
    expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  });
});
