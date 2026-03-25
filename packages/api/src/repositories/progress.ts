import { db } from "@lms-platform/db";
import { lessonProgress } from "@lms-platform/db/schema/lesson-progress";
import { lessons } from "@lms-platform/db/schema/lessons";
import { modules } from "@lms-platform/db/schema/modules";
import { enrollments } from "@lms-platform/db/schema/enrollments";
import { and, count, eq, sql } from "drizzle-orm";

export function findByUserAndLesson(userId: string, lessonId: string) {
  return db.query.lessonProgress.findFirst({
    where: and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, lessonId),
    ),
  });
}

export function findByCourseAndUser(courseId: string, userId: string) {
  return db.query.lessonProgress.findMany({
    where: and(eq(lessonProgress.userId, userId)),
    with: {
      lesson: {
        columns: { id: true, moduleId: true },
        with: {
          module: { columns: { id: true, courseId: true } },
        },
      },
    },
  });
}

export async function upsert(
  userId: string,
  lessonId: string,
  data: { watchedSeconds: number; completed: boolean },
) {
  return db
    .insert(lessonProgress)
    .values({ userId, lessonId, ...data, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [lessonProgress.userId, lessonProgress.lessonId],
      set: { ...data, updatedAt: new Date() },
    })
    .returning();
}

export async function recalculateProgress(userId: string, courseId: string) {
  const [totals] = await db
    .select({ total: count() })
    .from(lessons)
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(eq(modules.courseId, courseId));

  const [completed] = await db
    .select({ done: count() })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
    .innerJoin(modules, eq(lessons.moduleId, modules.id))
    .where(
      and(
        eq(lessonProgress.userId, userId),
        eq(modules.courseId, courseId),
        eq(lessonProgress.completed, true),
      ),
    );

  const pct =
    totals.total > 0 ? Math.round((completed.done / totals.total) * 100) : 0;

  await db
    .update(enrollments)
    .set({
      progressPct: pct,
      ...(pct === 100 ? { status: "completed", completedAt: new Date() } : {}),
    })
    .where(
      and(eq(enrollments.userId, userId), eq(enrollments.courseId, courseId)),
    );

  return pct;
}
