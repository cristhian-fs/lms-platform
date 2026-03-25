import * as t from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";
import { user } from "./auth";
import { courses } from "./courses";

export const courseRatings = t.pgTable(
  "course_ratings",
  {
    id: t.uuid("id").primaryKey().defaultRandom(),
    userId: t
      .text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: t
      .uuid("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    rating: t.integer("rating").notNull(),
    comment: t.text("comment"),
    createdAt: t.timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    t
      .uniqueIndex("course_ratings_user_course_udx")
      .on(table.userId, table.courseId),
    t.index("course_ratings_course_id_idx").on(table.courseId),
    t.check("rating_range", sql`rating >= 1 AND rating <= 5`),
  ],
);

export const courseRatingsRelations = relations(courseRatings, ({ one }) => ({
  user: one(user, {
    fields: [courseRatings.userId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [courseRatings.courseId],
    references: [courses.id],
  }),
}));

export type CourseRating = typeof courseRatings.$inferSelect;
export type NewCourseRating = typeof courseRatings.$inferInsert;
