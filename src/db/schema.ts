// src/db/schema.ts
import { pgTable, serial, text, date, timestamp } from "drizzle-orm/pg-core";

export const antiRecords = pgTable("anti_records", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  expireDate: date("expire_date").notNull(),
  reactiveDate: date("reactive_date").notNull(),
  note: text("note"),                                      // optional
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AntiRecord = typeof antiRecords.$inferSelect;
export type NewAntiRecord = typeof antiRecords.$inferInsert;