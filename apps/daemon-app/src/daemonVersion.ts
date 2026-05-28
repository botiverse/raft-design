interface ParsedDaemonVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease: string[] | null;
}

function parseDaemonVersion(value: string): ParsedDaemonVersion | null {
  const normalized = value.trim().replace(/^v/i, "");
  const match = normalized.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/);
  if (!match) {
    return null;
  }

  return {
    major: Number.parseInt(match[1], 10),
    minor: Number.parseInt(match[2], 10),
    patch: Number.parseInt(match[3], 10),
    prerelease: match[4]?.split(".") ?? null,
  };
}

function comparePrerelease(left: string[] | null, right: string[] | null): number {
  if (!left && !right) {
    return 0;
  }
  if (!left) {
    return 1;
  }
  if (!right) {
    return -1;
  }

  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = left[index];
    const rightPart = right[index];
    if (leftPart === undefined) {
      return -1;
    }
    if (rightPart === undefined) {
      return 1;
    }
    if (leftPart === rightPart) {
      continue;
    }

    const leftNumeric = /^\d+$/.test(leftPart);
    const rightNumeric = /^\d+$/.test(rightPart);
    if (leftNumeric && rightNumeric) {
      return Number(leftPart) - Number(rightPart);
    }
    if (leftNumeric) {
      return -1;
    }
    if (rightNumeric) {
      return 1;
    }
    return leftPart.localeCompare(rightPart);
  }

  return 0;
}

export function compareDaemonVersions(current: string, latest: string): number | null {
  const parsedCurrent = parseDaemonVersion(current);
  const parsedLatest = parseDaemonVersion(latest);
  if (!parsedCurrent || !parsedLatest) {
    const normalizedCurrent = current.trim().replace(/^v/i, "");
    const normalizedLatest = latest.trim().replace(/^v/i, "");
    if (normalizedCurrent === normalizedLatest) {
      return 0;
    }
    return null;
  }

  if (parsedCurrent.major !== parsedLatest.major) {
    return parsedCurrent.major - parsedLatest.major;
  }
  if (parsedCurrent.minor !== parsedLatest.minor) {
    return parsedCurrent.minor - parsedLatest.minor;
  }
  if (parsedCurrent.patch !== parsedLatest.patch) {
    return parsedCurrent.patch - parsedLatest.patch;
  }
  return comparePrerelease(parsedCurrent.prerelease, parsedLatest.prerelease);
}

export function hasDaemonVersionUpdate(current: string | null, latest: string | null): boolean {
  if (!current || !latest) {
    return false;
  }

  const comparison = compareDaemonVersions(current, latest);
  if (comparison === null) {
    return false;
  }

  return comparison < 0;
}
