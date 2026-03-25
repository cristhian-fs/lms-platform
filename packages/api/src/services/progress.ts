import { ForbiddenError, NotFoundError } from "../errors";
import * as enrollmentRepo from "../repositories/enrollment";
import * as lessonRepo from "../repositories/lesson";
import * as progressRepo from "../repositories/progress";

export { ForbiddenError, NotFoundError };

export async function upsertProgress(
  userId: string,
  lessonId: string,
  data: { watchedSeconds: number; completed?: boolean },
) {
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson) throw new NotFoundError("Lesson not found");

  const courseId = lesson.module?.courseId;
  if (!courseId) throw new NotFoundError("Course not found");

  const enrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (!enrollment || enrollment.status === "dropped") throw new ForbiddenError();

  const [progress] = await progressRepo.upsert(userId, lessonId, {
    watchedSeconds: data.watchedSeconds,
    completed: data.completed ?? false,
  });

  const progressPct = await progressRepo.recalculateProgress(userId, courseId);

  return { progress, progressPct };
}

export async function getCourseProgress(userId: string, courseId: string) {
  const enrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (!enrollment || enrollment.status === "dropped") throw new ForbiddenError();

  const allProgress = await progressRepo.findByCourseAndUser(courseId, userId);
  const lessonProgress = allProgress.filter(
    (p) => p.lesson?.module?.courseId === courseId,
  );

  return {
    progressPct: enrollment.progressPct,
    status: enrollment.status,
    lessons: lessonProgress,
  };
}
