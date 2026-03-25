import { ConflictError, ForbiddenError, NotFoundError } from "../errors";
import * as enrollmentRepo from "../repositories/enrollment";
import * as ratingRepo from "../repositories/rating";

export { ConflictError, ForbiddenError, NotFoundError };

export function list(courseId: string) {
  return ratingRepo.findByCourse(courseId);
}

export async function rate(
  userId: string,
  courseId: string,
  data: { rating: number; comment?: string },
) {
  const enrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (!enrollment || enrollment.status === "dropped") throw new ForbiddenError();

  const existing = await ratingRepo.findByUserAndCourse(userId, courseId);
  if (existing) throw new ConflictError();

  const [created] = await ratingRepo.create({ userId, courseId, ...data });
  return created;
}

export async function updateRating(
  userId: string,
  courseId: string,
  data: { rating: number; comment?: string },
) {
  const [updated] = await ratingRepo.update(userId, courseId, data);
  if (!updated) throw new NotFoundError();
  return updated;
}

export async function deleteRating(userId: string, courseId: string) {
  const [deleted] = await ratingRepo.remove(userId, courseId);
  if (!deleted) throw new NotFoundError();
  return deleted;
}
