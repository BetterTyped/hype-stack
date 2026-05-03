import { SelectQueryBuilder } from "kysely";

export type PaginatedResult<T> = {
  items: T[];
  total: number;
};

export const getPaginatedQuery = async <DB, TB extends keyof DB & string, O>({
  query,
  limit,
  offset,
}: {
  query: SelectQueryBuilder<DB, TB, O>;
  limit: number;
  offset: number;
}): Promise<PaginatedResult<O>> => {
  const [items, totalResult] = await Promise.all([
    query.offset(offset).limit(limit).execute(),
    query
      .clearSelect()
      .clearOrderBy()
      .select((eb) => [eb.fn.countAll<number>().as("count")])
      .executeTakeFirstOrThrow(),
  ]);

  return {
    items,
    total: Number((totalResult as { count: number | string }).count),
  };
};
