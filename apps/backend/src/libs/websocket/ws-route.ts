import { logger } from "@backend/libs/logger/logger";
import { getUpgradeWebSocket } from "@backend/utils/misc/websocket";
import { Hono } from "hono";

import { wsManager } from "./connection-manager";
import type { WsAuthResult, WsMessage, WsHandlerEntry } from "./types";

export type WsAuthenticator = (headers: Headers) => Promise<WsAuthResult | null>;

const userMetaMap = new WeakMap<WebSocket, { userId: string; organizationId: string | undefined }>();

export const createWsRoutes = (topicHandlers: Map<string, WsHandlerEntry>, authenticate: WsAuthenticator) =>
  new Hono().get(
    "/",
    getUpgradeWebSocket()((c) => ({
      onOpen: async (_event, ws) => {
        const authResult = await authenticate(c.req.raw.headers);
        if (!authResult) {
          ws.close(4001, "Unauthorized");
          return;
        }

        const rawWs = ws.raw as unknown as WebSocket;
        userMetaMap.set(rawWs, authResult);
        wsManager.register(authResult.userId, ws, authResult.organizationId);
        logger.debug({ userId: authResult.userId }, "WebSocket connected");
      },

      onMessage: async (event, ws) => {
        const rawWs = ws.raw as unknown as WebSocket;
        const meta = userMetaMap.get(rawWs);
        if (!meta) return;

        try {
          const message = JSON.parse(String(event.data)) as WsMessage;
          const entry = topicHandlers.get(message.topic);
          if (entry) {
            const data = entry.middleware ? entry.middleware._parse(message.data) : message.data;
            await entry.handler({
              userId: meta.userId,
              organizationId: meta.organizationId,
              data,
              ws,
            });
          }
        } catch {
          logger.debug("Invalid WebSocket message format");
        }
      },

      onClose: (_event, ws) => {
        const rawWs = ws.raw as unknown as WebSocket;
        const meta = userMetaMap.get(rawWs);
        if (meta) {
          wsManager.unregister(meta.userId, ws);
          userMetaMap.delete(rawWs);
          logger.debug({ userId: meta.userId }, "WebSocket disconnected");
        }
      },

      onError: (_event, ws) => {
        const rawWs = ws.raw as unknown as WebSocket;
        const meta = userMetaMap.get(rawWs);
        if (meta) {
          wsManager.unregister(meta.userId, ws);
          userMetaMap.delete(rawWs);
        }
      },
    })),
  );
