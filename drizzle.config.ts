import * as dotenv from "dotenv";
import type { Config } from "drizzle-kit";

dotenv.config();

if (!process.env.POSTGRES_HOST) throw new Error("POSTGRES_HOST is not defined");
if (!process.env.POSTGRES_PORT) throw new Error("POSTGRES_PORT is not defined");
if (!process.env.POSTGRES_USER) throw new Error("POSTGRES_USER is not defined");
if (!process.env.POSTGRES_PASSWORD) throw new Error("POSTGRES_PASSWORD is not defined");
if (!process.env.POSTGRES_DATABASE) throw new Error("POSTGRES_DATABASE is not defined");

export default {
	schema: "./app/db/schema/index.ts",
	out: "./app/db/migrations",
	dialect: "postgresql",
	dbCredentials: {
		host: process.env.POSTGRES_HOST,
		port: Number(process.env.POSTGRES_PORT),
		user: process.env.POSTGRES_USER,
		password: process.env.POSTGRES_PASSWORD,
		database: process.env.POSTGRES_DATABASE,
		ssl: true,
	},
	verbose: true,
	strict: true,
} satisfies Config;
