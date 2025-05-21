import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/mindmapmaker";

// Create a new postgres client
const client = postgres(connectionString);

// Create a drizzle database instance
export const db = drizzle(client); 