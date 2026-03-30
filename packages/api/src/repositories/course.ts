import { db } from "@lms-platform/db";
import { courses, type NewCourse } from "@lms-platform/db/schema/courses";
import { eq } from "drizzle-orm";

export function findAll(onlyPublished = true) {
  return db.query.courses.findMany({
    where: onlyPublished ? eq(courses.isPublished, true) : undefined,
    orderBy: (c, { desc }) => [desc(c.createdAt)],
    with: {
      modules: {
        columns: { id: true },
        with: {
          lessons: {
            columns: { id: true },
          },
        },
      },
    },
  });
}

export function findBySlug(slug: string) {
  return db.query.courses.findFirst({
    where: eq(courses.slug, slug),
    with: {
      modules: {
        orderBy: (m, { asc }) => [asc(m.order)],
        with: {
          lessons: {
            orderBy: (l, { asc }) => [asc(l.order)],
          },
        },
      },
    },
  });
}

export function findById(id: string) {
  return db.query.courses.findFirst({
    where: eq(courses.id, id),
  });
}

export function create(data: NewCourse) {
  return db.insert(courses).values(data).returning();
}

export function update(id: string, data: Partial<NewCourse>) {
  return db.update(courses).set(data).where(eq(courses.id, id)).returning();
}

export function remove(id: string) {
  return db.delete(courses).where(eq(courses.id, id)).returning();
}
