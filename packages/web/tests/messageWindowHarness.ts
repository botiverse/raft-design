import type { Message } from "../src/store/messageStore.js";

class MemoryStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string) {
    return this.map.has(key) ? this.map.get(key)! : null;
  }

  setItem(key: string, value: string) {
    this.map.set(key, value);
  }

  removeItem(key: string) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}

if (!("localStorage" in globalThis) || typeof globalThis.localStorage?.getItem !== "function") {
  Object.defineProperty(globalThis, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
}

if (!("sessionStorage" in globalThis) || typeof globalThis.sessionStorage?.getItem !== "function") {
  Object.defineProperty(globalThis, "sessionStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
}

const api = (await import("../src/api/client.js")).default;
const { useMessageStore } = await import("../src/store/messageStore.js");

const originalGet = api.get.bind(api);
const originalPost = api.post.bind(api);

export interface WindowSnapshot {
  messageIds: string[];
  lastSeq: number;
  loading: boolean;
  hasGap: boolean;
  hasMore: boolean;
  hasNewer: boolean;
  loadingGap: boolean;
  highlightedMessageId: string | null;
  contextLoadError: string | null;
  unreadCount: number;
}

function resetStore() {
  useMessageStore.setState({
    channelMessages: {},
    messages: [],
    highlightedMessageId: null,
    lastSeq: 0,
    currentChannelId: null,
    loading: false,
    loadingOlder: false,
    loadingNewer: false,
    loadingGap: false,
    hasMore: true,
    hasNewer: false,
    hasGap: false,
    contextLoadError: null,
    unreadCounts: {},
    historyLimited: false,
    isNearBottom: true,
  });
}

function getMaxSeq(messages: Message[]) {
  return Math.max(...messages.map((message) => message.seq || 0), 0);
}

export async function flushAsyncWork() {
  for (let i = 0; i < 5; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
}

export function createMessageWindowHarness() {
  resetStore();

  const syncPages: Message[][] = [];
  const channelPages: Message[][] = [];
  const postResponses: unknown[] = [];
  const getCalls: string[] = [];
  const postCalls: Array<{ url: string; body: unknown }> = [];

  api.get = (async (url: string) => {
    getCalls.push(url);
    if (url.startsWith("/messages/sync?")) {
      return { data: syncPages.shift() ?? [] };
    }
    if (url.startsWith("/messages/channel/")) {
      return { data: { messages: channelPages.shift() ?? [] } };
    }
    throw new Error(`Unexpected GET ${url}`);
  }) as typeof api.get;

  api.post = (async (url: string, body?: unknown) => {
    postCalls.push({ url, body });
    return { data: postResponses.shift() ?? {} };
  }) as typeof api.post;

  return {
    primeWindow(channelId: string, messages: Message[], overrides?: Partial<WindowSnapshot> & { lastSeq?: number }) {
      const lastSeq = overrides?.lastSeq ?? getMaxSeq(messages);
      useMessageStore.setState({
        channelMessages: { [channelId]: messages },
        messages,
        currentChannelId: channelId,
        lastSeq,
        hasGap: overrides?.hasGap ?? false,
        hasNewer: overrides?.hasNewer ?? false,
        loadingGap: overrides?.loadingGap ?? false,
        unreadCounts: overrides?.unreadCount ? { [channelId]: overrides.unreadCount } : {},
        isNearBottom: true,
      });
    },

    enqueueSyncPages(...pages: Message[][]) {
      syncPages.push(...pages);
    },

    enqueueChannelPages(...pages: Message[][]) {
      channelPages.push(...pages);
    },

    enqueuePostResponses(...responses: unknown[]) {
      postResponses.push(...responses);
    },

    socketMessage(message: Message) {
      useMessageStore.getState().addMessage(message);
    },

    optimisticMessage(message: Message) {
      useMessageStore.getState().addOptimisticMessage(message);
    },

    async syncGap(channelId?: string) {
      await useMessageStore.getState().syncGap(channelId);
    },

    async loadMessageContext(channelId: string, messageId: string) {
      await useMessageStore.getState().loadMessageContext(channelId, messageId);
    },

    async sendMessage(channelId: string, content: string, optimisticId?: string) {
      return useMessageStore.getState().sendMessage(channelId, content, undefined, undefined, optimisticId);
    },

    snapshot(channelId: string): WindowSnapshot {
      const state = useMessageStore.getState();
      return {
        messageIds: state.messages.map((message) => message.id),
        lastSeq: state.lastSeq,
        loading: state.loading,
        hasGap: state.hasGap,
        hasMore: state.hasMore,
        hasNewer: state.hasNewer,
        loadingGap: state.loadingGap,
        highlightedMessageId: state.highlightedMessageId,
        contextLoadError: state.contextLoadError,
        unreadCount: state.unreadCounts[channelId] || 0,
      };
    },

    messages(channelId: string): Message[] {
      return [...(useMessageStore.getState().channelMessages[channelId] ?? [])];
    },

    getCalls() {
      return [...getCalls];
    },

    postCalls() {
      return [...postCalls];
    },

    restore() {
      api.get = originalGet;
      api.post = originalPost;
      resetStore();
    },
  };
}
