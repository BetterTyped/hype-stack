// oxlint-disable-next-line import/no-unassigned-import
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// The HyperFetch socket client (`@/api/client`) auto-connects the moment the SDK
// is imported, so any test that renders a component pulling it in opens a real
// undici WebSocket under jsdom. jsdom replaces the global `Event` class, and when
// undici later fires the connection event it dispatches a jsdom Event onto a Node
// EventTarget -> "The 'event' argument must be an instance of Event" -> an
// unhandled error that fails the run even though every test passed. The mock
// implements the runtime surface HyperFetch touches, not the full lib.dom
// interface, and reports OPEN so the client never retries.
class MockWebSocket extends EventTarget {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  readonly CONNECTING = MockWebSocket.CONNECTING;
  readonly OPEN = MockWebSocket.OPEN;
  readonly CLOSING = MockWebSocket.CLOSING;
  readonly CLOSED = MockWebSocket.CLOSED;

  binaryType: BinaryType = "blob";
  bufferedAmount = 0;
  extensions = "";
  onclose: ((this: WebSocket, ev: CloseEvent) => unknown) | null = null;
  onerror: ((this: WebSocket, ev: Event) => unknown) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => unknown) | null = null;
  onopen: ((this: WebSocket, ev: Event) => unknown) | null = null;
  protocol = "";
  readyState = MockWebSocket.OPEN;
  url: string;

  constructor(url: string | URL) {
    super();
    this.url = String(url);
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
  }

  send(): void {}
}

globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

// jsdom ships no IntersectionObserver, and framer-motion observes every element
// it animates into view via `whileInView`.
if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver = class IntersectionObserver {
    root = null;
    rootMargin = "";
    scrollMargin = "";
    thresholds = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  };
}

afterEach(() => {
  cleanup();
});
