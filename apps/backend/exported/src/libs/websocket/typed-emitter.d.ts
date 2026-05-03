export declare class TypedEmitter<Emitters extends Record<string, any>> {
    toUser<T extends keyof Emitters & string>(params: {
        userId: string;
        topic: T;
        data: Emitters[T];
    }): void;
    toUsers<T extends keyof Emitters & string>(params: {
        userIds: string[];
        topic: T;
        data: Emitters[T];
    }): void;
    toOrganization<T extends keyof Emitters & string>(params: {
        organizationId: string;
        topic: T;
        data: Emitters[T];
    }): void;
    broadcast<T extends keyof Emitters & string>(params: {
        topic: T;
        data: Emitters[T];
    }): void;
}
//# sourceMappingURL=typed-emitter.d.ts.map