import { NotFoundError } from "../errors";
import * as courseRepo from "../repositories/course";

export { NotFoundError };

export async function list(onlyPublished = true) {
  const courses = await courseRepo.findAll(onlyPublished);
  return courses.map(({ modules, ...course }) => ({
    ...course,
    moduleCount: modules.length,
    lessonCount: modules.reduce((acc, m) => acc + m.lessons.length, 0),
  }));
}

export async function getBySlug(slug: string) {
  const course = await courseRepo.findBySlug(slug);
  if (!course) throw new NotFoundError();
  return course;
}

export async function checkSlug(slug: string) {
  const course = await courseRepo.findBySlug(slug);
  return { available: !course };
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
