import * as t from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { modules } from "./modules";
import { lessonProgress } from "./lesson-progress";

export const lessonTypeEnum = t.pgEnum("lesson_type", [
  "video",
  "article",
  "quiz",
]);

export const lessons = t.pgTable(
  "lessons",
  {
    id: t.uuid("id").primaryKey().defaultRandom(),
    moduleId: t
      .uuid("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    title: t.varchar("title", { length: 255 }).notNull(),
    type: lessonTypeEnum("type").notNull().default("video"),
    videoUrl: t.varchar("video_url", { length: 512 }),
    contentMdx: t.text("content_mdx"),
    durationSeconds: t.integer("duration_seconds").notNull().default(0),
    order: t.integer("order").notNull(),
    isPreview: t.boolean("is_preview").notNull().default(false),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [t.index("lessons_module_id_idx").on(table.moduleId)],
);

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progress: many(lessonProgress),
}));

export type Lesson = typeof lessons.$inferSelect;
export type NewLesson = typeof lessons.$inferInsert;
