import { createSdk } from "@hyper-fetch/core";
import { createSocketSdk } from "@hyper-fetch/sockets";

import { client, socket } from "./client";
import type { ApiRoutesSdk, WsSocketSdk } from "@hype-stack/backend";

export const sdk = createSdk<typeof client, ApiRoutesSdk>(client);

export const socketSdk = createSocketSdk<typeof socket, WsSocketSdk>(socket);
