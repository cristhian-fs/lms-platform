import fs from "node:fs";
import path from "node:path";

import * as enrollmentRepo from "@lms-platform/api/repositories/enrollment";
import * as lessonRepo from "@lms-platform/api/repositories/lesson";
import Elysia from "elysia";

import { protectedPlugin } from "../plugins/protected";

async function checkAccess(
  lessonId: string,
  userId: string,
): Promise<
  | { ok: true; lesson: Awaited<ReturnType<typeof lessonRepo.findById>> }
  | { ok: false; code: 404 | 403 }
> {
  const lesson = await lessonRepo.findById(lessonId);
  if (!lesson?.videoUrl) return { ok: false, code: 404 };

  if (!lesson.isPreview) {
    const courseId = lesson.module?.courseId;
    if (!courseId) return { ok: false, code: 404 };
    const enrollment = await enrollmentRepo.findByUserAndCourse(userId, courseId);
    if (!enrollment || enrollment.status === "dropped") return { ok: false, code: 403 };
  }

  return { ok: true, lesson };
}

export const streamRoutes = new Elysia()
  .use(protectedPlugin)
  .get("/api/stream/:lessonId/playlist.m3u8", async ({ session, params, status }) => {
    const result = await checkAccess(params.lessonId, session!.user.id);
    if (!result.ok) return status(result.code);

    const { lesson } = result;
    let content: string;
    try {
      content = fs.readFileSync(lesson!.videoUrl!, "utf-8");
    } catch {
      return status(404);
    }

    const segmentBase = `/api/stream/${params.lessonId}/`;

    const rewritten = content
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return line;
        return segmentBase + path.basename(trimmed);
      })
      .join("\n");

    return new Response(rewritten, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache",
      },
    });
  })
  .get("/api/stream/:lessonId/:segment", async ({ session, params, status }) => {
    const result = await checkAccess(params.lessonId, session!.user.id);
    if (!result.ok) return status(result.code);

    const { lesson } = result;
    const playlistDir = path.dirname(lesson!.videoUrl!);
    const segmentPath = path.resolve(playlistDir, params.segment);

    // Guard against path traversal
    if (!segmentPath.startsWith(path.resolve(playlistDir))) return status(403);
    if (!params.segment.endsWith(".ts") && !params.segment.endsWith(".m4s")) {
      return status(400);
    }

    let data: Buffer;
    try {
      data = fs.readFileSync(segmentPath);
    } catch {
      return status(404);
    }

    return new Response(data, {
      headers: {
        "Content-Type": "video/mp2t",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  });
