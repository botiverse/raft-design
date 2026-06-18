import { useCallback, useEffect, useRef, useState } from "react";

type MockDelay<TVariables> = number | ((variables: TVariables) => number);
type MockFailure<TVariables> = boolean | ((variables: TVariables) => boolean);
type MockError<TVariables> = Error | string | ((variables: TVariables) => Error | string);
type MockQueryStatus = "idle" | "pending" | "success" | "error";

type MockRequestOptions<TVariables> = {
  delayMs?: MockDelay<TVariables>;
  shouldFail?: MockFailure<TVariables>;
  error?: MockError<TVariables>;
};

export type MockQueryOptions<TData, TVariables = void> = MockRequestOptions<TVariables> & {
  queryKey: readonly unknown[];
  queryFn: (variables: TVariables) => Promise<TData> | TData;
};

export type MockMutationOptions<
  TData = void,
  TVariables = void,
> = MockRequestOptions<TVariables> & {
  mutationKey: readonly unknown[];
  mutationFn: (variables: TVariables) => Promise<TData> | TData;
};

type UseMockQueryOptions<TData, TVariables> = {
  query: MockQueryOptions<TData, TVariables>;
  variables?: TVariables;
  enabled?: boolean;
  clearOnFetch?: boolean;
  initialData?: TData;
};

type UseMockQueryResult<TData> = {
  data: TData | undefined;
  error: Error | null;
  status: MockQueryStatus;
  isIdle: boolean;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => void;
};

type MockQueryState<TData> = {
  data: TData | undefined;
  error: Error | null;
  status: MockQueryStatus;
};

function resolveValue<TVariables, TValue>(
  value: TValue | ((variables: TVariables) => TValue) | undefined,
  variables: TVariables,
  fallback: TValue,
) {
  if (value === undefined) {
    return fallback;
  }

  if (typeof value === "function") {
    return (value as (variables: TVariables) => TValue)(variables);
  }

  return value;
}

function createMockError<TVariables>(
  error: MockError<TVariables> | undefined,
  variables: TVariables,
) {
  const resolvedError = resolveValue(error, variables, "Mock request failed");
  return typeof resolvedError === "string" ? new Error(resolvedError) : resolvedError;
}

export function waitForMockRequest(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function mockQueryOptions<TData, TVariables = void>(
  options: MockQueryOptions<TData, TVariables>,
) {
  return options;
}

export function mockMutationOptions<TData = void, TVariables = void>(
  options: MockMutationOptions<TData, TVariables>,
) {
  return options;
}

export async function runMockQuery<TData>(options: MockQueryOptions<TData, void>): Promise<TData>;
export async function runMockQuery<TData, TVariables>(
  options: MockQueryOptions<TData, TVariables>,
  variables: TVariables,
): Promise<TData>;
export async function runMockQuery<TData, TVariables>(
  options: MockQueryOptions<TData, TVariables>,
  variables?: TVariables,
) {
  const resolvedVariables = variables as TVariables;
  await waitForMockRequest(resolveValue(options.delayMs, resolvedVariables, 0));

  if (resolveValue(options.shouldFail, resolvedVariables, false)) {
    throw createMockError(options.error, resolvedVariables);
  }

  return options.queryFn(resolvedVariables);
}

export function useMockQuery<TData>(
  options: UseMockQueryOptions<TData, void>,
): UseMockQueryResult<TData>;
export function useMockQuery<TData, TVariables>(
  options: UseMockQueryOptions<TData, TVariables>,
): UseMockQueryResult<TData>;
export function useMockQuery<TData, TVariables>({
  query,
  variables,
  enabled = true,
  clearOnFetch = false,
  initialData,
}: UseMockQueryOptions<TData, TVariables>): UseMockQueryResult<TData> {
  const requestIdRef = useRef(0);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const [state, setState] = useState<MockQueryState<TData>>(() => ({
    data: initialData,
    error: null,
    status: enabled ? "pending" : "idle",
  }));

  const refetch = useCallback(() => {
    setRefetchIndex((index) => index + 1);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setState((current) => ({ ...current, status: "idle" }));
      return;
    }

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    setState((current) => ({
      data: clearOnFetch ? undefined : current.data,
      error: null,
      status: "pending",
    }));

    void runMockQuery(query, variables as TVariables)
      .then((data) => {
        if (requestIdRef.current === requestId) {
          setState({ data, error: null, status: "success" });
        }
      })
      .catch((error: unknown) => {
        if (requestIdRef.current === requestId) {
          setState({
            data: undefined,
            error: error instanceof Error ? error : new Error(String(error)),
            status: "error",
          });
        }
      });
  }, [clearOnFetch, enabled, query, refetchIndex, variables]);

  return {
    ...state,
    isIdle: state.status === "idle",
    isLoading: state.status === "pending",
    isSuccess: state.status === "success",
    isError: state.status === "error",
    refetch,
  };
}

export async function runMockMutation<TData>(
  options: MockMutationOptions<TData, void>,
): Promise<TData>;
export async function runMockMutation<TData, TVariables>(
  options: MockMutationOptions<TData, TVariables>,
  variables: TVariables,
): Promise<TData>;
export async function runMockMutation<TData, TVariables>(
  options: MockMutationOptions<TData, TVariables>,
  variables?: TVariables,
) {
  const resolvedVariables = variables as TVariables;
  await waitForMockRequest(resolveValue(options.delayMs, resolvedVariables, 0));

  if (resolveValue(options.shouldFail, resolvedVariables, false)) {
    throw createMockError(options.error, resolvedVariables);
  }

  return options.mutationFn(resolvedVariables);
}
