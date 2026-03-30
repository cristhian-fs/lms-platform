import { readdir, stat } from "node:fs/promises";
import { basename, join } from "node:path";

const THUMBNAIL_NAMES = ["thumbnail.jpg", "thumbnail.jpeg", "thumbnail.png", "thumbnail.avif", "thumbnail.webp"];

export interface ParsedLesson {
  title: string;
  order: number;
  dirName: string;
  playlistPath: string;
}

export interface ParsedModule {
  title: string;
  order: number;
  dirName: string;
  lessons: ParsedLesson[];
}

export interface ParsedCourse {
  dirName: string;
  suggestedTitle: string;
  suggestedSlug: string;
  thumbnailPath: string;
  modules: ParsedModule[];
}

function parseOrderAndTitle(name: string): { order: number | null; title: string } {
  // Matches: "01 - Title", "1. Title", "01_Title", "1 Title", "01-title"
  const match = name.match(/^(\d+)[\s.\-_]+(.+)$/);
  if (match) {
    return { order: parseInt(match[1], 10), title: match[2].trim() };
  }
  return { order: null, title: name };
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class CourseImportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CourseImportError";
  }
}

export async function previewFromPath(dirPath: string): Promise<ParsedCourse> {
  const rootStat = await stat(dirPath).catch(() => null);
  if (!rootStat?.isDirectory()) {
    throw new CourseImportError("Path does not exist or is not a directory");
  }

  const dirName = basename(dirPath);
  const entries = await readdir(dirPath, { withFileTypes: true });

  const thumbnailEntry = entries.find(
    (e) => e.isFile() && THUMBNAIL_NAMES.includes(e.name.toLowerCase()),
  );
  if (!thumbnailEntry) {
    throw new CourseImportError(
      "No thumbnail found. Expected thumbnail.jpg, .png, .jpeg, .avif, or .webp in the root.",
    );
  }

  const moduleDirs = entries
    .filter((e) => e.isDirectory())
    .map((e) => ({ dirName: e.name, ...parseOrderAndTitle(e.name) }))
    .sort((a, b) =>
      a.order !== null && b.order !== null
        ? a.order - b.order
        : a.dirName.localeCompare(b.dirName),
    )
    .map((m, i) => ({ ...m, order: m.order ?? i + 1 }));

  if (moduleDirs.length === 0) {
    throw new CourseImportError("No module directories found inside the course folder.");
  }

  const modules: ParsedModule[] = [];

  for (const mod of moduleDirs) {
    const modulePath = join(dirPath, mod.dirName);
    const moduleEntries = await readdir(modulePath, { withFileTypes: true });

    const lessonDirs = moduleEntries
      .filter((e) => e.isDirectory())
      .map((e) => ({ dirName: e.name, ...parseOrderAndTitle(e.name) }))
      .sort((a, b) =>
        a.order !== null && b.order !== null
          ? a.order - b.order
          : a.dirName.localeCompare(b.dirName),
      )
      .map((l, i) => ({ ...l, order: l.order ?? i + 1 }));

    if (lessonDirs.length === 0) {
      throw new CourseImportError(
        `Module "${mod.dirName}" has no lesson directories.`,
      );
    }

    const lessons: ParsedLesson[] = [];

    for (const lesson of lessonDirs) {
      const lessonPath = join(modulePath, lesson.dirName);
      const lessonEntries = await readdir(lessonPath, { withFileTypes: true });
      const hasPlaylist = lessonEntries.some(
        (e) => e.isFile() && e.name === "playlist.m3u8",
      );
      if (!hasPlaylist) {
        throw new CourseImportError(
          `Lesson "${lesson.dirName}" in module "${mod.dirName}" is missing playlist.m3u8.`,
        );
      }
      lessons.push({
        title: lesson.title,
        order: lesson.order,
        dirName: lesson.dirName,
        playlistPath: join(lessonPath, "playlist.m3u8"),
      });
    }

    modules.push({
      title: mod.title,
      order: mod.order,
      dirName: mod.dirName,
      lessons,
    });
  }

  const { title: suggestedTitle } = parseOrderAndTitle(dirName);

  return {
    dirName,
    suggestedTitle,
    suggestedSlug: toSlug(suggestedTitle),
    thumbnailPath: join(dirPath, thumbnailEntry.name),
    modules,
  };
}
