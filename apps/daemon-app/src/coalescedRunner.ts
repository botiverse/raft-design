export function createCoalescedRunner(task: () => Promise<void>) {
  let running: Promise<void> | null = null;
  let rerunRequested = false;

  const runLoop = async () => {
    try {
      do {
        rerunRequested = false;
        await task();
      } while (rerunRequested);
    } finally {
      running = null;
    }
  };

  return () => {
    if (running) {
      rerunRequested = true;
      return running;
    }

    running = runLoop();
    return running;
  };
}
