import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";
dotenv.config();

export default {
	schema: "./app/db/schema.ts",
	out: "./app/db/migrations",
	driver: "pg",
	dbCredentials: {
		connectionString: `${process.env.POSTGRES_URL}?sslmode=require`,
		ssl: true,
	},
	verbose: true,
	strict: true,
} satisfies Config;
