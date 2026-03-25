import { ForbiddenError, NotFoundError } from "../errors";
import * as enrollmentRepo from "../repositories/enrollment";
import * as lessonRepo from "../repositories/lesson";

export { ForbiddenError, NotFoundError };

export async function getById(lessonId: string, userId: string) {
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson) throw new NotFoundError();

  if (!lesson.isPreview) {
    const courseId = lesson.module?.courseId;
    if (!courseId) throw new NotFoundError();
    const enrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
    if (!enrollment || enrollment.status === "dropped") throw new ForbiddenError();
  }

  return lesson;
}

export async function create(
  moduleId: string,
  data: {
    title: string;
    type?: "video" | "article" | "quiz";
    videoUrl?: string;
    contentMdx?: string;
    durationSeconds?: number;
    order: number;
    isPreview?: boolean;
  },
) {
  const [lesson] = await lessonRepo.create({ moduleId, ...data });
  return lesson;
}

export async function update(
  id: string,
  data: {
    title?: string;
    videoUrl?: string;
    contentMdx?: string;
    durationSeconds?: number;
    order?: number;
    isPreview?: boolean;
  },
) {
  const [lesson] = await lessonRepo.update(id, data);
  if (!lesson) throw new NotFoundError();
  return lesson;
}

export async function remove(id: string) {
  const [lesson] = await lessonRepo.remove(id);
  if (!lesson) throw new NotFoundError();
  return lesson;
}
