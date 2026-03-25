import * as t from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { modules } from "./modules";
import { enrollments } from "./enrollments";
import { courseRatings } from "./course-rating";

export const courseLevelEnum = t.pgEnum("course_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const courses = t.pgTable("courses", {
  id: t.uuid("id").primaryKey().defaultRandom(),
  title: t.varchar("title", { length: 255 }).notNull(),
  slug: t.varchar("slug", { length: 255 }).notNull().unique(),
  description: t.text("description"),
  thumbnailUrl: t.varchar("thumbnail_url", { length: 512 }),
  level: courseLevelEnum("level").notNull().default("beginner"),
  durationSeconds: t.integer("duration_seconds").notNull().default(0),
  isPublished: t.boolean("is_published").notNull().default(false),
  publishedAt: t.timestamp("published_at"),
  createdAt: t.timestamp("created_at").notNull().defaultNow(),
});

export const coursesRelations = relations(courses, ({ many }) => ({
  modules: many(modules),
  enrollments: many(enrollments),
  ratings: many(courseRatings),
}));

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;
