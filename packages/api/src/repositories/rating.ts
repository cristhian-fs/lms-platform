import { db } from "@lms-platform/db";
import { courseRatings, type NewCourseRating } from "@lms-platform/db/schema/course-rating";
import { and, eq } from "drizzle-orm";

export function findByCourse(courseId: string) {
  return db.query.courseRatings.findMany({
    where: eq(courseRatings.courseId, courseId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
  });
}

export function findByUserAndCourse(userId: string, courseId: string) {
  return db.query.courseRatings.findFirst({
    where: and(
      eq(courseRatings.userId, userId),
      eq(courseRatings.courseId, courseId),
    ),
  });
}

export function create(data: NewCourseRating) {
  return db.insert(courseRatings).values(data).returning();
}

export function update(
  userId: string,
  courseId: string,
  data: Pick<NewCourseRating, "rating" | "comment">,
) {
  return db
    .update(courseRatings)
    .set(data)
    .where(
      and(
        eq(courseRatings.userId, userId),
        eq(courseRatings.courseId, courseId),
      ),
    )
    .returning();
}

export function remove(userId: string, courseId: string) {
  return db
    .delete(courseRatings)
    .where(
      and(
        eq(courseRatings.userId, userId),
        eq(courseRatings.courseId, courseId),
      ),
    )
    .returning();
}
