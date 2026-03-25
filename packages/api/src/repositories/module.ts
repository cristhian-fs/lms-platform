import { db } from "@lms-platform/db";
import { modules, type NewModule } from "@lms-platform/db/schema/modules";
import { eq } from "drizzle-orm";

export function findById(id: string) {
  return db.query.modules.findFirst({
    where: eq(modules.id, id),
  });
}

export function findByCourse(courseId: string) {
  return db.query.modules.findMany({
    where: eq(modules.courseId, courseId),
    orderBy: (m, { asc }) => [asc(m.order)],
    with: {
      lessons: {
        orderBy: (l, { asc }) => [asc(l.order)],
      },
    },
  });
}

export function create(data: NewModule) {
  return db.insert(modules).values(data).returning();
}

export function update(id: string, data: Partial<NewModule>) {
  return db.update(modules).set(data).where(eq(modules.id, id)).returning();
}

export function remove(id: string) {
  return db.delete(modules).where(eq(modules.id, id)).returning();
}
