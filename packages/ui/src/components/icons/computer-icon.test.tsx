/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, test } from "vite-plus/test";
import { cleanup, render } from "@testing-library/react";
import { ComputerIcon } from "./computer-icon";
import type { ComputerDevice } from "./computer-icon";
import { computerDistro } from "./computer-distro";

afterEach(cleanup);

/* Mirrors raft-shared DEVICE_CLASSES (slock #10295). */
const DEVICES: ComputerDevice[] = [
  "laptop",
  "mini",
  "studio",
  "imac",
  "desktop",
  "server",
  "vm",
  "container",
];

function icon(element: React.ReactElement) {
  const { container } = render(element);
  const svg = container.querySelector("svg")!;
  const shape = svg.querySelector("path[stroke]")!.getAttribute("d");
  const marks = [...svg.querySelectorAll("path[fill='currentColor']")];
  return { svg, shape, marks };
}

describe("ComputerIcon shapes", () => {
  test("every device class draws its own shape, none of them the monitor", () => {
    const monitor = icon(<ComputerIcon />).shape;
    cleanup();
    const shapes = DEVICES.map((device) => {
      const { svg, shape } = icon(<ComputerIcon device={device} />);
      expect(svg.getAttribute("data-device")).toBe(device);
      expect(shape).toBeTruthy();
      cleanup();
      return shape;
    });
    expect(new Set([...shapes, monitor]).size).toBe(DEVICES.length + 1);
  });

  test("container draws a box with three vertical ribs", () => {
    const { shape } = icon(<ComputerIcon device="container" />);
    expect(shape?.match(/M\d+ 9v6/g)).toHaveLength(3);
  });

  test("a missing or unknown device falls back to the monitor", () => {
    const monitor = icon(<ComputerIcon />);
    expect(monitor.svg.getAttribute("data-device")).toBe("monitor");
    cleanup();
    const unknown = icon(<ComputerIcon device={"toaster" as ComputerDevice} />);
    expect(unknown.svg.getAttribute("data-device")).toBe("monitor");
    expect(unknown.shape).toBe(monitor.shape);
  });

  test("cloud wins over the device and keeps the platform mark", () => {
    const { svg, marks } = icon(<ComputerIcon cloud device="vm" platform="windows" />);
    expect(svg.getAttribute("data-device")).toBe("cloud");
    expect(svg.getAttribute("data-platform")).toBe("windows");
    expect(marks).toHaveLength(1);
    expect(svg.querySelector("mask")).not.toBeNull();
  });

  test("cloud without a platform, or with an unknown one, has no mark", () => {
    for (const platform of [null, "beos"]) {
      const { svg, marks } = icon(<ComputerIcon cloud platform={platform as "linux" | null} />);
      expect(svg.hasAttribute("data-platform")).toBe(false);
      expect(marks).toHaveLength(0);
      expect(svg.querySelector("mask")).toBeNull();
      cleanup();
    }
  });
});

describe("ComputerIcon distro mark", () => {
  test("linux with a distro draws Tux and the distro mark, each with its size class", () => {
    const { svg, marks } = icon(
      <ComputerIcon device="server" platform="linux" distro="debian" className="size-6" />,
    );
    expect(svg.getAttribute("data-distro")).toBe("debian");
    expect(svg.getAttribute("class")).toContain("@container/computer-icon");
    expect(svg.getAttribute("class")).toContain("size-6");
    expect(marks).toHaveLength(2);
    expect(marks[0]!.getAttribute("class")).toBe("@min-[17.5px]/computer-icon:hidden");
    expect(marks[1]!.getAttribute("class")).toBe("hidden @min-[17.5px]/computer-icon:inline");
  });

  test("an unknown distro, or another platform, keeps the plain mark", () => {
    for (const element of [
      <ComputerIcon key="gentoo" platform="linux" distro={"gentoo" as "debian"} />,
      <ComputerIcon key="macos" platform="macos" distro="debian" />,
    ]) {
      const { svg, marks } = icon(element);
      expect(svg.hasAttribute("data-distro")).toBe(false);
      expect(marks).toHaveLength(1);
      expect(marks[0]!.hasAttribute("class")).toBe(false);
      cleanup();
    }
  });
});

describe("computerDistro", () => {
  test("maps os-release ID onto the distro", () => {
    expect(computerDistro("ubuntu")).toBe("ubuntu");
    expect(computerDistro("debian")).toBe("debian");
    expect(computerDistro("fedora")).toBe("fedora");
    expect(computerDistro("arch")).toBe("arch");
    expect(computerDistro("alpine")).toBe("alpine");
    expect(computerDistro("centos")).toBe("centos");
    expect(computerDistro("rhel")).toBe("rhel");
    expect(computerDistro("nixos")).toBe("nixos");
  });

  test("any opensuse-* is opensuse", () => {
    expect(computerDistro("opensuse-tumbleweed")).toBe("opensuse");
    expect(computerDistro("opensuse-leap")).toBe("opensuse");
    expect(computerDistro("opensuse")).toBe("opensuse");
  });

  test("ID first, then ID_LIKE left to right", () => {
    expect(computerDistro("ubuntu", "debian")).toBe("ubuntu");
    expect(computerDistro("rocky", "rhel centos fedora")).toBe("rhel");
    expect(computerDistro("linuxmint", "ubuntu debian")).toBe("ubuntu");
    expect(computerDistro("sled", "suse opensuse")).toBe("opensuse");
    expect(computerDistro(null, "  fedora ")).toBe("fedora");
  });

  test("unknown or missing values give null (Tux)", () => {
    expect(computerDistro("gentoo")).toBeNull();
    expect(computerDistro("sles", "suse")).toBeNull();
    expect(computerDistro(null, null)).toBeNull();
    expect(computerDistro()).toBeNull();
    expect(computerDistro("", "")).toBeNull();
    expect(computerDistro("__proto__", "constructor toString")).toBeNull();
    expect(computerDistro("archlinux")).toBeNull();
  });
});
