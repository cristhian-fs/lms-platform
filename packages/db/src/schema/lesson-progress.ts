import * as t from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { lessons } from "./lessons";

export const lessonProgress = t.pgTable(
  "lesson_progress",
  {
    id: t.uuid("id").primaryKey().defaultRandom(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: t
      .uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completed: t.boolean("completed").notNull().default(false),
    watchedSeconds: t.integer("watched_seconds").notNull().default(0),
    updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    t
      .uniqueIndex("lesson_progress_user_lesson_udx")
      .on(table.userId, table.lessonId),
    t.index("lesson_progress_user_id_idx").on(table.userId),
    t.index("lesson_progress_lesson_id_idx").on(table.lessonId),
  ],
);

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(user, {
    fields: [lessonProgress.userId],
    references: [user.id],
  }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

export type LessonProgress = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;
