import * as lessonService from "@lms-platform/api/services/lesson";
import Elysia, { t } from "elysia";

import { ok } from "@/helpers/response";
import { protectedPlugin } from "../plugins/protected";

const lessonBody = t.Object({
  title: t.String(),
  type: t.Optional(t.Union([t.Literal("video"), t.Literal("article"), t.Literal("quiz")])),
  videoUrl: t.Optional(t.String()),
  contentMdx: t.Optional(t.String()),
  durationSeconds: t.Optional(t.Number()),
  order: t.Number(),
  isPreview: t.Optional(t.Boolean()),
});

const lessonUpdateBody = t.Object({
  title: t.Optional(t.String()),
  videoUrl: t.Optional(t.String()),
  contentMdx: t.Optional(t.String()),
  durationSeconds: t.Optional(t.Number()),
  order: t.Optional(t.Number()),
  isPreview: t.Optional(t.Boolean()),
});

export const lessonRoutes = new Elysia()
  .use(protectedPlugin)
  .get("/api/lessons/:id", async ({ session, params }) =>
    ok(await lessonService.getById(params.id, session!.user.id)),
  )
  .post(
    "/api/modules/:moduleId/lessons",
    async ({ params, body }) => ok(await lessonService.create(params.moduleId, body), "Lesson created"),
    { body: lessonBody },
  )
  .patch(
    "/api/lessons/:id",
    async ({ params, body }) => ok(await lessonService.update(params.id, body)),
    { body: lessonUpdateBody },
  )
  .delete("/api/lessons/:id", async ({ params }) =>
    ok(await lessonService.remove(params.id), "Lesson deleted"),
  );
