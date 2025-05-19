import { pgTable, text, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

// MindMap model
export const mindMaps = pgTable("mind_maps", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull().references(() => users.id),
  nodes: jsonb("nodes").notNull().default('[]'),
  edges: jsonb("edges").notNull().default('[]'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertMindMapSchema = createInsertSchema(mindMaps).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});