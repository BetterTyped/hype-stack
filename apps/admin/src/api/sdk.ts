import { createSdk } from "@hyper-fetch/core";
import { createSocketSdk } from "@hyper-fetch/sockets";

import { adminSocket, client, socket } from "./client";
import type { ApiRoutesSdk, WsAdminSocketSdk, WsSocketSdk } from "@hype-stack/backend";

export const sdk = createSdk<typeof client, ApiRoutesSdk>(client);

export const socketSdk = createSocketSdk<typeof socket, WsSocketSdk>(socket);

export const adminSocketSdk = createSocketSdk<typeof adminSocket, WsAdminSocketSdk>(adminSocket);
