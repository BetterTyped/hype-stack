import type { WSContext } from "hono/ws";

export type WsMessage<T = unknown> = {
  topic: string;
  data: T;
};

export type WsContext<Data = unknown> = {
  userId: string;
  organizationId: string | undefined;
  data: Data;
  ws: WSContext;
};

export type WsHandler<Data = unknown> = (c: WsContext<Data>) => void | Promise<void>;

export type WsMiddleware<Output = unknown> = {
  _parse: (data: unknown) => Output;
};

export type WsHandlerEntry = {
  handler: WsHandler<unknown>;
  middleware?: WsMiddleware<unknown>;
};

export type WsAuthResult = {
  userId: string;
  organizationId: string | undefined;
};
