import { migrate } from "drizzle-orm/postgres-js/migrator"

import { db, sql } from ".."

async function main() {
  await migrate(db, {
    migrationsFolder: "./src/db/drizzle/migrations", // For some reason relative paths don't work here
  })
  await sql.end()
  console.log("Database migrated successfully!")
}

main()
