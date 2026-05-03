/* eslint-disable @typescript-eslint/no-explicit-any */
import { wsManager } from "./connection-manager";

export class TypedEmitter<Emitters extends Record<string, any>> {
  toUser<T extends keyof Emitters & string>(params: { userId: string; topic: T; data: Emitters[T] }): void {
    wsManager.pushToUser(params.userId, { topic: params.topic, data: params.data });
  }

  toUsers<T extends keyof Emitters & string>(params: { userIds: string[]; topic: T; data: Emitters[T] }): void {
    wsManager.pushToUsers(params.userIds, { topic: params.topic, data: params.data });
  }

  toOrganization<T extends keyof Emitters & string>(params: {
    organizationId: string;
    topic: T;
    data: Emitters[T];
  }): void {
    wsManager.pushToOrganization(params.organizationId, { topic: params.topic, data: params.data });
  }

  broadcast<T extends keyof Emitters & string>(params: { topic: T; data: Emitters[T] }): void {
    wsManager.broadcast({ topic: params.topic, data: params.data });
  }
}
