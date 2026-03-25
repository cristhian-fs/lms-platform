import { NotFoundError } from "../errors";
import * as courseRepo from "../repositories/course";

export { NotFoundError };

export function list(onlyPublished = true) {
  return courseRepo.findAll(onlyPublished);
}

export async function getBySlug(slug: string) {
  const course = await courseRepo.findBySlug(slug);
  if (!course) throw new NotFoundError();
  return course;
}

export async function create(data: {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  level?: "beginner" | "intermediate" | "advanced";
}) {
  const [course] = await courseRepo.create(data);
  return course;
}

export async function update(
  id: string,
  data: {
    title?: string;
    description?: string;
    thumbnailUrl?: string;
    level?: "beginner" | "intermediate" | "advanced";
  },
) {
  const [course] = await courseRepo.update(id, data);
  if (!course) throw new NotFoundError();
  return course;
}

export async function remove(id: string) {
  const [course] = await courseRepo.remove(id);
  if (!course) throw new NotFoundError();
  return course;
}

export async function togglePublish(id: string) {
  const course = await courseRepo.findById(id);
  if (!course) throw new NotFoundError();
  const [updated] = await courseRepo.update(id, {
    isPublished: !course.isPublished,
    publishedAt: !course.isPublished ? new Date() : undefined,
  });
  return updated;
}
