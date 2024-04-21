import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js"
import pgConnectionString from "pg-connection-string"
import postgres from "postgres"

import * as schema from "./schema"

const dbUrl: string =
  process.env.NEXT_PHASE === "phase-production-build"
    ? "postgres://dummy:placeholder@example.com/just-for-build"
    : (process.env.DATABASE_URL as string)

// See https://github.com/porsager/postgres/issues/484 for why we need to parse here
const config = pgConnectionString.parse(dbUrl)

export const sql = postgres({
  host: config.host ?? undefined,
  port: config.port ? parseInt(config.port) : undefined,
  user: config.user,
  password: config.password,
  database: config.database ?? undefined,
  ssl: config.ssl as undefined,
})

let db: PostgresJsDatabase<typeof schema>

if (process.env.NODE_ENV === "production") {
  db = drizzle(sql, { schema })
} else {
  if (!(globalThis as any).db) {
    ;(globalThis as any).db = drizzle(sql, { schema })
  }

  db = (globalThis as any).db
}

export { schema, db }
