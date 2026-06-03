import { neon } from "@neondatabase/serverless";

type NeonSql = ReturnType<typeof neon>;

let sqlClient: NeonSql | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql(): NeonSql {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }
  if (!sqlClient) sqlClient = neon(connectionString);
  return sqlClient;
}