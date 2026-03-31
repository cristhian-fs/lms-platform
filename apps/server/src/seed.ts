import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { auth } from "@lms-platform/auth";
import { db } from "@lms-platform/db";
import { user as userTable } from "@lms-platform/db/schema/auth";
import { courses } from "@lms-platform/db/schema/courses";
import { modules } from "@lms-platform/db/schema/modules";
import { lessons } from "@lms-platform/db/schema/lessons";
import { env } from "@lms-platform/env/server";
import { eq, and } from "drizzle-orm";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonSeed = {
  order: number;
  title: string;
  type?: "video" | "article" | "quiz";
  videoUrl?: string | null;
  contentMdx?: string | null;
  durationSeconds?: number;
  isPreview?: boolean;
};

type ModuleSeed = {
  order: number;
  title: string;
  lessons: LessonSeed[];
};

type CourseSeed = {
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  level?: "beginner" | "intermediate" | "advanced";
  isPublished?: boolean;
  modules: ModuleSeed[];
};

// ─── Admin ────────────────────────────────────────────────────────────────────

async function seedAdmin() {
  const existing = await db
    .select({ id: userTable.id })
    .from(userTable)
    .where(eq(userTable.email, env.SEED_ADMIN_EMAIL))
    .limit(1);

  if (existing.length > 0) {
    console.log("[seed] admin already exists, skipping");
    return;
  }

  await auth.api.createUser({
    body: {
      name: env.SEED_ADMIN_NAME,
      email: env.SEED_ADMIN_EMAIL,
      password: env.SEED_ADMIN_PASSWORD,
      role: "admin",
    },
  });

  console.log(`[seed] admin created → ${env.SEED_ADMIN_EMAIL}`);
}

// ─── Courses ──────────────────────────────────────────────────────────────────

async function upsertCourse(data: CourseSeed) {
  const [course] = await db
    .insert(courses)
    .values({
      title: data.title,
      slug: data.slug,
      description: data.description ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      level: data.level ?? "beginner",
      isPublished: data.isPublished ?? false,
      publishedAt: data.isPublished ? new Date() : null,
    })
    .onConflictDoUpdate({
      target: courses.slug,
      set: {
        title: data.title,
        description: data.description ?? null,
        thumbnailUrl: data.thumbnailUrl ?? null,
        level: data.level ?? "beginner",
        isPublished: data.isPublished ?? false,
      },
    })
    .returning();

  if (!course) throw new Error(`[seed] failed to upsert course: ${data.slug}`);

  for (const modData of data.modules) {
    await upsertModule(course.id, modData);
  }

  console.log(`[seed] course upserted → ${data.slug}`);
}

async function upsertModule(courseId: string, data: ModuleSeed) {
  const existing = await db
    .select({ id: modules.id })
    .from(modules)
    .where(and(eq(modules.courseId, courseId), eq(modules.order, data.order)))
    .limit(1);

  let moduleId: string;

  if (existing.length > 0) {
    moduleId = existing[0]!.id;
    await db
      .update(modules)
      .set({ title: data.title })
      .where(eq(modules.id, moduleId));
  } else {
    const [mod] = await db
      .insert(modules)
      .values({ courseId, title: data.title, order: data.order })
      .returning();
    if (!mod) throw new Error(`[seed] failed to insert module order ${data.order}`);
    moduleId = mod.id;
  }

  for (const lessonData of data.lessons) {
    await upsertLesson(moduleId, lessonData);
  }
}

async function upsertLesson(moduleId: string, data: LessonSeed) {
  const existing = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(and(eq(lessons.moduleId, moduleId), eq(lessons.order, data.order)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(lessons)
      .set({
        title: data.title,
        type: data.type ?? "video",
        videoUrl: data.videoUrl ?? null,
        contentMdx: data.contentMdx ?? null,
        durationSeconds: data.durationSeconds ?? 0,
        isPreview: data.isPreview ?? false,
      })
      .where(eq(lessons.id, existing[0]!.id));
  } else {
    await db.insert(lessons).values({
      moduleId,
      title: data.title,
      type: data.type ?? "video",
      videoUrl: data.videoUrl ?? null,
      contentMdx: data.contentMdx ?? null,
      durationSeconds: data.durationSeconds ?? 0,
      order: data.order,
      isPreview: data.isPreview ?? false,
    });
  }
}

async function seedCourses() {
  const seedFile = env.COURSES_SEED_PATH
    ? path.resolve(env.COURSES_SEED_PATH)
    : path.join(path.dirname(fileURLToPath(import.meta.url)), "seeds/courses.seed.json");

  let data: CourseSeed[];
  try {
    data = JSON.parse(readFileSync(seedFile, "utf-8")) as CourseSeed[];
  } catch {
    console.log(`[seed] courses seed file not found at ${seedFile}, skipping`);
    return;
  }

  if (data.length === 0) return;

  for (const course of data) {
    await upsertCourse(course);
  }
}

// ─── Entry ────────────────────────────────────────────────────────────────────

export async function runSeed() {
  console.log("[seed] running...");
  await seedAdmin();
  await seedCourses();
  console.log("[seed] done");
}
