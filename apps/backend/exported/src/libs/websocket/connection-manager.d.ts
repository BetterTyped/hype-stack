import type { WSContext } from "hono/ws";
import type { WsMessage } from "./types";
declare class ConnectionManager {
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
export declare const wsManager: ConnectionManager;
export {};
//# sourceMappingURL=connection-manager.d.ts.map