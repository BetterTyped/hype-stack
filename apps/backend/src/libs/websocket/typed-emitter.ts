/* eslint-disable @typescript-eslint/no-explicit-any */
import { appWsManager, type ConnectionManager } from "./connection-manager";

export class TypedEmitter<Emitters extends Record<string, any>> {
  constructor(private readonly manager: ConnectionManager = appWsManager) {}

  toUser<T extends keyof Emitters & string>(params: { userId: string; topic: T; data: Emitters[T] }): void {
    this.manager.pushToUser(params.userId, { topic: params.topic, data: params.data });
  }

  toUsers<T extends keyof Emitters & string>(params: { userIds: string[]; topic: T; data: Emitters[T] }): void {
    this.manager.pushToUsers(params.userIds, { topic: params.topic, data: params.data });
  }

  toOrganization<T extends keyof Emitters & string>(params: {
    organizationId: string;
    topic: T;
    data: Emitters[T];
  }): void {
    this.manager.pushToOrganization(params.organizationId, { topic: params.topic, data: params.data });
  }

  broadcast<T extends keyof Emitters & string>(params: { topic: T; data: Emitters[T] }): void {
    this.manager.broadcast({ topic: params.topic, data: params.data });
  }
}
