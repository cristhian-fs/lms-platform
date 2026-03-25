import { db } from "@lms-platform/db";
import { enrollments } from "@lms-platform/db/schema/enrollments";
import { and, eq } from "drizzle-orm";

export async function findByUser(userId: string) {
  return db.query.enrollments.findMany({
    where: eq(enrollments.userId, userId),
    with: { course: true },
    orderBy: (e, { desc }) => [desc(e.enrolledAt)],
  });
}

export async function findByUserAndCourse(userId: string, courseId: string) {
  return db.query.enrollments.findFirst({
    where: and(
      eq(enrollments.userId, userId),
      eq(enrollments.courseId, courseId),
    ),
  });
}

export async function create(userId: string, courseId: string) {
  return db
    .insert(enrollments)
    .values({
      userId,
      courseId,
      status: "active",
      progressPct: 0,
    })
    .returning();
}

export async function drop(userId: string, courseId: string) {
  return db
    .update(enrollments)
    .set({ status: "dropped" })
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    )
    .returning();
}
