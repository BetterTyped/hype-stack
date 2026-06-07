import type { WSContext } from "hono/ws";
import type { WsMessage } from "./types";
export declare class ConnectionManager {
    private connections;
    register(userId: string, ws: WSContext, organizationId: string | undefined): void;
    unregister(userId: string, ws: WSContext): void;
    pushToUser<T>(userId: string, message: WsMessage<T>): void;
    pushToUsers<T>(userIds: string[], message: WsMessage<T>): void;
    broadcast<T>(message: WsMessage<T>): void;
    pushToOrganization<T>(organizationId: string, message: WsMessage<T>): void;
    getConnectionCount(userId: string): number;
    isConnected(userId: string): boolean;
}
/**
 * Storefront namespace (`/ws`). Holds every authenticated user connection and
 * backs `wsEmit` for per-user, per-organization, and broadcast pushes.
 */
export declare const appWsManager: ConnectionManager;
/**
 * Admin namespace (`/ws/admin`). A separate instance so superadmin broadcasts
 * stay isolated and never reach storefront connections. Only superadmins can
 * register here (enforced at upgrade by `wsSuperadminAuthenticate`).
 */
export declare const adminWsManager: ConnectionManager;
//# sourceMappingURL=connection-manager.d.ts.map