import { PrismaPg } from "@prisma/adapter-pg";
import { Kysely } from "kysely";
import { DB } from "../types/types";
export declare const initializePostgresDb: () => Promise<import("@backend/db/postgres/generated/client/runtime/client").DynamicClientExtensionThis<import("@prisma/client").Prisma.TypeMap<import("@backend/db/postgres/generated/client/runtime/client").InternalArgs & {
    result: {};
    model: {};
    query: {};
    client: {
        qb: () => Kysely<DB>;
    };
}, {}>, import("@prisma/client").Prisma.TypeMapCb<{
    adapter: PrismaPg;
}>, {
    result: {};
    model: {};
    query: {};
    client: {
        qb: () => Kysely<DB>;
    };
}>>;
//# sourceMappingURL=index.d.ts.map