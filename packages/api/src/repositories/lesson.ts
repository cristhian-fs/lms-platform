import { db } from "@lms-platform/db";
import { lessons, type NewLesson } from "@lms-platform/db/schema/lessons";
import { and, eq } from "drizzle-orm";

export function findById(id: string) {
  return db.query.lessons.findFirst({
    where: eq(lessons.id, id),
    with: {
      module: {
        columns: { id: true, courseId: true },
      },
    },
  });
}

export function findByModule(moduleId: string) {
  return db.query.lessons.findMany({
    where: eq(lessons.moduleId, moduleId),
    orderBy: (l, { asc }) => [asc(l.order)],
  });
}

export function findByModuleAndDirName(moduleId: string, dirName: string) {
  return db.query.lessons.findFirst({
    where: and(eq(lessons.moduleId, moduleId), eq(lessons.sourceDirName, dirName)),
  });
}

export function create(data: NewLesson) {
  return db.insert(lessons).values(data).returning();
}

export function update(id: string, data: Partial<NewLesson>) {
  return db.update(lessons).set(data).where(eq(lessons.id, id)).returning();
}

export function remove(id: string) {
  return db.delete(lessons).where(eq(lessons.id, id)).returning();
}
