import { createClient } from "@hyper-fetch/core";
import { Socket } from "@hyper-fetch/sockets";

import type { ApiErrorTypes } from "@hype-stack/backend";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL!;

export const client = createClient<{
  error: ApiErrorTypes;
}>({ url: API_BASE_URL });

client.adapter.setRequestDefaults((request) => {
  return {
    options: {
      ...request.options,
      credentials: "include",
    },
  };
});

const wsProtocol = API_BASE_URL.startsWith("https") ? "wss" : "ws";
const wsHost = API_BASE_URL.replace(/^https?:\/\//, "");

export const socket = new Socket({ url: `${wsProtocol}://${wsHost}/ws` });
