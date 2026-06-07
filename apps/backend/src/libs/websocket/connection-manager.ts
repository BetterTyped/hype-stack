import type { WSContext } from "hono/ws";

import type { WsMessage } from "./types";

type ConnectionEntry = {
  ws: WSContext;
  organizationId: string | undefined;
};

export class ConnectionManager {
  private connections = new Map<string, Set<ConnectionEntry>>();

  register(userId: string, ws: WSContext, organizationId: string | undefined): void {
    let entries = this.connections.get(userId);
    if (!entries) {
      entries = new Set();
      this.connections.set(userId, entries);
    }
    entries.add({ ws, organizationId });
  }

  unregister(userId: string, ws: WSContext): void {
    const entries = this.connections.get(userId);
    if (!entries) return;

    for (const entry of entries) {
      if (entry.ws === ws) {
        entries.delete(entry);
        break;
      }
    }

    if (entries.size === 0) {
      this.connections.delete(userId);
    }
  }

  pushToUser<T>(userId: string, message: WsMessage<T>): void {
    const entries = this.connections.get(userId);
    if (!entries) return;

    const serialized = JSON.stringify(message);
    for (const entry of entries) {
      entry.ws.send(serialized);
    }
  }

  pushToUsers<T>(userIds: string[], message: WsMessage<T>): void {
    for (const userId of userIds) {
      this.pushToUser(userId, message);
    }
  }

  broadcast<T>(message: WsMessage<T>): void {
    const serialized = JSON.stringify(message);
    for (const entries of this.connections.values()) {
      for (const entry of entries) {
        entry.ws.send(serialized);
      }
    }
  }

  pushToOrganization<T>(organizationId: string, message: WsMessage<T>): void {
    const serialized = JSON.stringify(message);
    for (const entries of this.connections.values()) {
      for (const entry of entries) {
        if (entry.organizationId === organizationId) {
          entry.ws.send(serialized);
        }
      }
    }
  }

  getConnectionCount(userId: string): number {
    return this.connections.get(userId)?.size ?? 0;
  }

  isConnected(userId: string): boolean {
    return this.getConnectionCount(userId) > 0;
  }
}

/**
 * Storefront namespace (`/ws`). Holds every authenticated user connection and
 * backs `wsEmit` for per-user, per-organization, and broadcast pushes.
 */
export const appWsManager = new ConnectionManager();

/**
 * Admin namespace (`/ws/admin`). A separate instance so superadmin broadcasts
 * stay isolated and never reach storefront connections. Only superadmins can
 * register here (enforced at upgrade by `wsSuperadminAuthenticate`).
 */
export const adminWsManager = new ConnectionManager();
