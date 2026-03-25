import * as t from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { user } from "./auth";
import { courses } from "./courses";

export const enrollmentStatusEnum = t.pgEnum("enrollment_status", [
  "active",
  "completed",
  "dropped",
]);

export const enrollments = t.pgTable(
  "enrollments",
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
    status: enrollmentStatusEnum("status").notNull().default("active"),
    progressPct: t.integer("progress_pct").notNull().default(0),
    enrolledAt: t.timestamp("enrolled_at").notNull().defaultNow(),
    completedAt: t.timestamp("completed_at"),
  },
  (table) => [
    t
      .uniqueIndex("enrollments_user_course_udx")
      .on(table.userId, table.courseId),
    t.index("enrollments_user_id_idx").on(table.userId),
    t.index("enrollments_course_id_idx").on(table.courseId),
  ],
);

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(user, {
    fields: [enrollments.userId],
    references: [user.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export type Enrollment = typeof enrollments.$inferSelect;
export type NewEnrollment = typeof enrollments.$inferInsert;
