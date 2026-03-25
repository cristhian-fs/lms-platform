import * as progressService from "@lms-platform/api/services/progress";
import Elysia, { t } from "elysia";

import { ok } from "@/helpers/response";
import { protectedPlugin } from "../plugins/protected";

export const progressRoutes = new Elysia()
  .use(protectedPlugin)
  .post(
    "/api/progress/:lessonId",
    async ({ session, params, body }) =>
      ok(await progressService.upsertProgress(session!.user.id, params.lessonId, body)),
    { body: t.Object({ watchedSeconds: t.Number(), completed: t.Optional(t.Boolean()) }) },
  )
  .get("/api/progress/:courseId", async ({ session, params }) =>
    ok(await progressService.getCourseProgress(session!.user.id, params.courseId)),
  );
