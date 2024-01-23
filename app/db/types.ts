import type { BuildQueryResult, DBQueryConfig, ExtractTablesWithRelations } from "drizzle-orm";
import { Jsonify } from "type-fest";
import * as schema from "~/db/schema.server";

type Schema = typeof schema;
type TSchema = ExtractTablesWithRelations<Schema>;

export type IncludeRelation<TableName extends keyof TSchema> = Jsonify<
	DBQueryConfig<"one" | "many", boolean, TSchema, TSchema[TableName]>["with"]
>;

export type InferResultType<
	TableName extends keyof TSchema,
	With extends IncludeRelation<TableName> | undefined = undefined,
> = Jsonify<
	BuildQueryResult<
		TSchema,
		TSchema[TableName],
		{
			with: With;
		}
	>
>;
export type Podcast = InferResultType<"podcasts", { episodes: true }>;
export type Episode = InferResultType<"episodes", { podcast: true }>;
