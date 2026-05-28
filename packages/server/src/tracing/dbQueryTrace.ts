import type { TraceAttributes } from "@slock-ai/shared";

export type DbQueryTracer = <T>(
  queryName: string,
  work: () => Promise<T>,
  onComplete?: (result: T) => TraceAttributes | undefined,
) => Promise<T>;

export const untracedDbQuery: DbQueryTracer = (_queryName, work) => work();
