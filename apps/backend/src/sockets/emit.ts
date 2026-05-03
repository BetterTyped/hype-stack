import { TypedEmitter } from "@backend/libs/websocket/typed-emitter";

import type { WsEmitters } from "./index";

export const wsEmit = new TypedEmitter<WsEmitters>();
