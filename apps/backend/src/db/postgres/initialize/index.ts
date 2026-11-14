import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool, PoolConfig } from "pg";

import { DB } from "../types/types";

const poolConfig = (): PoolConfig => ({ connectionString: process.env.DATABASE_URL });

/**
 * A Kysely query builder on a connection pool of its own. The app's is `postgres.qb`; anything
 * that keeps a connection for a long time (the scheduler's locks) makes a separate one, so it can
 * never take the connections requests are waiting for.
 */
export const createQueryBuilder = (pool: PoolConfig = {}) =>
  new Kysely<DB>({
    dialect: new PostgresDialect({
      pool: new Pool({ ...poolConfig(), ...pool }),
    }),
    plugins: [new CamelCasePlugin()],
  });

export const initializePostgresDb = async () => {
  const prisma = new PrismaClient({ adapter: new PrismaPg(poolConfig()) });

  return prisma.$extends({
    name: "kysely",
    client: {
      qb: createQueryBuilder(),
    },
  });
};
