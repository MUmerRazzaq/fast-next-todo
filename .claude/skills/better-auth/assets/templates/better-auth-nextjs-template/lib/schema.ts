// skills/better-auth/assets/templates/better-auth-nextjs-template/lib/schema.ts
// This is an example Drizzle schema.
// You should replace this with your actual schema.
// better-auth will automatically create its own tables.

import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const exampleTable = pgTable("example_table", {
  id: text("id").primaryKey(),
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow(),
});
