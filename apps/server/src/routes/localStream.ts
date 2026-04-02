import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname } from "node:path";
import * as enrollmentRepo from "@lms-platform/api/repositories/enrollment";
import * as lessonRepo from "@lms-platform/api/repositories/lesson";
import Elysia, { t } from "elysia";

import { protectedPlugin } from "../plugins/protected";
import { sessionPlugin } from "../plugins/session";

const IMAGE_EXTENSIONS: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
  ".webp": "image/webp",
};

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
    const enrollment = await enrollmentRepo.findByUserAndCourse(
      userId,
      courseId,
    );
    if (!enrollment || enrollment.status === "dropped")
      return { ok: false, code: 403 };
  }

  return { ok: true, lesson };
}

export const localStreamRoutes = new Elysia()
  .use(sessionPlugin)
  .get(
    "/api/local-asset",
    async ({ query, status }) => {
      const { path } = query;

      if (!path.startsWith("/")) return status(400);

      const ext = extname(path).toLowerCase();
      const contentType = IMAGE_EXTENSIONS[ext];
      if (!contentType) return status(400);

      const fileStat = await stat(path).catch(() => null);
      if (!fileStat?.isFile()) return status(404);

      return new Response(createReadStream(path) as unknown as ReadableStream, {
        headers: { "Content-Type": contentType },
      });
    },
    { query: t.Object({ path: t.String() }) },
  )
  .use(protectedPlugin)
  .get(
    "/api/local-stream/:lessonId",
    async ({ session, params, request, status }) => {
      const result = await checkAccess(params.lessonId, session!.user.id);
      if (!result.ok) return status(result.code);

      const { lesson } = result;
      const videoPath = lesson!.videoUrl!;

      if (!videoPath.startsWith("/")) return status(400);

      const fileStat = await stat(videoPath).catch(() => null);
      if (!fileStat?.isFile()) return status(404);

      const fileSize = fileStat.size;
      const rangeHeader = request.headers.get("range");

      let start = 0;
      let end = fileSize - 1;

      if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
        if (match) {
          start = parseInt(match[1]!, 10);
          end = match[2] ? parseInt(match[2], 10) : fileSize - 1;
        }
      }

      end = Math.min(end, fileSize - 1);
      const chunkSize = end - start + 1;

      const stream = createReadStream(videoPath, { start, end });

      return new Response(stream as unknown as ReadableStream, {
        status: rangeHeader ? 206 : 200,
        headers: {
          "Content-Type": "video/mp4",
          "Content-Length": String(chunkSize),
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Cache-Control": "no-cache",
        },
      });
    },
  );
