import { migrate } from "drizzle-orm/vercel-postgres/migrator";
import { db } from "~/db/config";
async function migrateDb() {
	try {
		console.info("Migrating...");
		await migrate(db, { migrationsFolder: "./app/db/migrations" });
	} catch (e) {
		console.error(e);
	}
}
migrateDb();
