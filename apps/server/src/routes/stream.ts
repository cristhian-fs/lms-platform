import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as enrollmentRepo from "@lms-platform/api/repositories/enrollment";
import * as lessonRepo from "@lms-platform/api/repositories/lesson";
import { env } from "@lms-platform/env/server";
import Elysia from "elysia";

import { protectedPlugin } from "../plugins/protected";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

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
    const playlistKey = lesson!.videoUrl!;

    let content: string;
    try {
      const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: playlistKey });
      const response = await s3.send(command);
      content = await response.Body!.transformToString("utf-8");
    } catch {
      return status(404);
    }

    const segmentBase = `/api/stream/${params.lessonId}/`;

    const rewritten = content
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) return line;
        const filename = trimmed.split("/").pop()!;
        return segmentBase + filename;
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

    if (!params.segment.endsWith(".ts") && !params.segment.endsWith(".m4s")) {
      return status(400);
    }

    const { lesson } = result;
    const playlistKey = lesson!.videoUrl!;
    const segmentKey = playlistKey.replace(/[^/]+$/, params.segment);

    const command = new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: segmentKey });
    const signedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return new Response(null, {
      status: 302,
      headers: { Location: signedUrl },
    });
  });
