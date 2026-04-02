import { readFile } from "node:fs/promises";
import * as courseRepo from "../repositories/course";
import * as moduleRepo from "../repositories/module";
import * as lessonRepo from "../repositories/lesson";
import { previewFromPath } from "./courseImport";

export interface SyncResult {
  courseId: string;
  slug: string;
  modulesCreated: number;
  modulesUpdated: number;
  modulesDeleted: number;
  lessonsCreated: number;
  lessonsUpdated: number;
  lessonsDeleted: number;
}

async function getVideoDurationSeconds(videoPath: string): Promise<number> {
  try {
    const proc = Bun.spawn(
      ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", videoPath],
      { stdout: "pipe", stderr: "pipe" },
    );
    const output = await new Response(proc.stdout).text();
    const json = JSON.parse(output) as { format?: { duration?: string } };
    const d = parseFloat(json.format?.duration ?? "");
    return isNaN(d) ? 0 : Math.round(d);
  } catch {
    return 0;
  }
}

export async function syncFromPath(
  dirPath: string,
  level: "beginner" | "intermediate" | "advanced" = "beginner",
): Promise<SyncResult> {
  const parsed = await previewFromPath(dirPath);

  const description = parsed.descriptionPath
    ? await readFile(parsed.descriptionPath, "utf-8").then((s) => s.trim())
    : undefined;

  // Upsert course by slug
  const existingCourse = await courseRepo.findBySlug(parsed.suggestedSlug);

  let courseId: string;
  let courseSlug: string;

  if (!existingCourse) {
    const [created] = await courseRepo.create({
      title: parsed.suggestedTitle,
      slug: parsed.suggestedSlug,
      description,
      thumbnailUrl: parsed.thumbnailPath,
      level,
    });
    if (!created) throw new Error("Failed to create course");
    courseId = created.id;
    courseSlug = created.slug;
  } else {
    await courseRepo.update(existingCourse.id, {
      title: parsed.suggestedTitle,
      description,
      thumbnailUrl: parsed.thumbnailPath,
      level,
    });
    courseId = existingCourse.id;
    courseSlug = existingCourse.slug;
  }

  // Load existing modules (with nested lessons) before the upsert loop for orphan cleanup
  const existingModules = await moduleRepo.findByCourse(courseId);

  let modulesCreated = 0;
  let modulesUpdated = 0;
  let modulesDeleted = 0;
  let lessonsCreated = 0;
  let lessonsUpdated = 0;
  let lessonsDeleted = 0;

  for (const mod of parsed.modules) {
    const existingModule = await moduleRepo.findByCourseAndDirName(courseId, mod.dirName);

    let moduleId: string;

    if (!existingModule) {
      const [created] = await moduleRepo.create({
        courseId,
        title: mod.title,
        order: mod.order,
        sourceDirName: mod.dirName,
      });
      if (!created) throw new Error(`Failed to create module "${mod.dirName}"`);
      moduleId = created.id;
      modulesCreated++;
    } else {
      await moduleRepo.update(existingModule.id, { title: mod.title, order: mod.order });
      moduleId = existingModule.id;
      modulesUpdated++;
    }

    for (const lesson of mod.lessons) {
      const durationSeconds = await getVideoDurationSeconds(lesson.videoPath);
      const existingLesson = await lessonRepo.findByModuleAndDirName(moduleId, lesson.dirName);

      if (!existingLesson) {
        await lessonRepo.create({
          moduleId,
          title: lesson.title,
          order: lesson.order,
          type: "video",
          videoUrl: lesson.videoPath,
          sourceDirName: lesson.dirName,
          durationSeconds,
        });
        lessonsCreated++;
      } else {
        await lessonRepo.update(existingLesson.id, {
          title: lesson.title,
          order: lesson.order,
          videoUrl: lesson.videoPath,
          durationSeconds,
        });
        lessonsUpdated++;
      }
    }
  }

  // Orphan cleanup — delete modules/lessons no longer present on the filesystem
  const parsedModuleDirNames = new Set(parsed.modules.map((m) => m.dirName));

  for (const existingMod of existingModules) {
    if (!parsedModuleDirNames.has(existingMod.sourceDirName ?? "")) {
      for (const lesson of existingMod.lessons) {
        await lessonRepo.remove(lesson.id);
        lessonsDeleted++;
      }
      await moduleRepo.remove(existingMod.id);
      modulesDeleted++;
    } else {
      const parsedMod = parsed.modules.find((m) => m.dirName === existingMod.sourceDirName);
      if (!parsedMod) continue;
      const parsedLessonDirNames = new Set(parsedMod.lessons.map((l) => l.dirName));
      for (const existingLesson of existingMod.lessons) {
        if (!parsedLessonDirNames.has(existingLesson.sourceDirName ?? "")) {
          await lessonRepo.remove(existingLesson.id);
          lessonsDeleted++;
        }
      }
    }
  }

  return {
    courseId,
    slug: courseSlug,
    modulesCreated,
    modulesUpdated,
    modulesDeleted,
    lessonsCreated,
    lessonsUpdated,
    lessonsDeleted,
  };
}
