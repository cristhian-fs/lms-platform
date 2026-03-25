import * as t from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courses } from "./courses";
import { lessons } from "./lessons";

export const modules = t.pgTable(
  "modules",
  {
    id: t.uuid("id").primaryKey().defaultRandom(),
    courseId: t
      .uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: t.varchar("title", { length: 255 }).notNull(),
    order: t.integer("order").notNull(),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [t.index("modules_course_id_idx").on(table.courseId)],
);

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export type Module = typeof modules.$inferSelect;
export type NewModule = typeof modules.$inferInsert;
