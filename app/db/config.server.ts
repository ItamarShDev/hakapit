import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

import { migrate } from "drizzle-orm/vercel-postgres/migrator";

export const db = drizzle(sql);
try {
	void migrate(db, { migrationsFolder: "./app/db/migrations" });
} catch (e) {
	console.error(e);
}
