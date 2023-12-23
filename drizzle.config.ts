import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

export default ({
	schema: "./app/db/schema.server.ts",
	out: "./app/db/migrations",
	driver: "pg",
	dbCredentials: {
		connectionString: process.env.POSTGRES_URL + "?sslmode=require",
		ssl: true,
	},
} satisfies Config);
