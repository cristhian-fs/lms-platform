import { ConflictError } from "../errors";
import * as enrollmentRepo from "../repositories/enrollment";

export { ConflictError };

export async function listByUser(userId: string) {
  return enrollmentRepo.findByUser(userId);
}

export async function enroll(userId: string, courseId: string) {
  const already = await enrollmentRepo.findByUserAndCourse(userId, courseId);
  if (already) throw new ConflictError();

  return enrollmentRepo.create(userId, courseId);
}

export async function drop(userId: string, courseId: string) {
  return enrollmentRepo.drop(userId, courseId);
}
