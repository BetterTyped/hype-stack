import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { CamelCasePlugin, Kysely, PostgresDialect } from "kysely";
import { Pool, PoolConfig } from "pg";

import { DB } from "../types/types";

export const initializePostgresDb = async () => {
  const poolConfig: PoolConfig = { connectionString: process.env.DATABASE_URL };

  const prisma = new PrismaClient({ adapter: new PrismaPg(poolConfig) });

  return prisma.$extends({
    name: "kysely",
    client: {
      qb: new Kysely<DB>({
        dialect: new PostgresDialect({
          pool: new Pool(poolConfig),
        }),
        plugins: [new CamelCasePlugin()],
      }),
    },
  });
};
