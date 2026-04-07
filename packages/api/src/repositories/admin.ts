import { db } from "@lms-platform/db";
import { user } from "@lms-platform/db/schema/auth";
import { enrollments } from "@lms-platform/db/schema/enrollments";
import { desc, ilike, inArray, eq } from "drizzle-orm";

export async function listUsersWithEnrollments(search?: string) {
  const query = db
    .select()
    .from(user)
    .orderBy(desc(user.createdAt));

  if (search) {
    query.where(ilike(user.email, `%${search}%`));
  }

  const users = await query;

  if (users.length === 0) return { users: [], total: 0 };

  const activeEnrollments = await db.query.enrollments.findMany({
    where: inArray(enrollments.userId, users.map((u) => u.id)),
    with: { course: true },
  });

  return {
    total: users.length,
    users: users.map((u) => ({
      ...u,
      enrollments: activeEnrollments
        .filter((e) => e.userId === u.id)
        .map(({ course, ...e }) => ({ ...e, course })),
    })),
  };
}
