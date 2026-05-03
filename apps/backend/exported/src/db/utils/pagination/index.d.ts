import { SelectQueryBuilder } from "kysely";
export type PaginatedResult<T> = {
    items: T[];
    total: number;
};
export declare const getPaginatedQuery: <DB, TB extends keyof DB & string, O>({ query, limit, offset, }: {
    query: SelectQueryBuilder<DB, TB, O>;
    limit: number;
    offset: number;
}) => Promise<PaginatedResult<O>>;
//# sourceMappingURL=index.d.ts.map