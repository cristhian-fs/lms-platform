import * as courseService from "@lms-platform/api/services/course";
import * as courseImportService from "@lms-platform/api/services/courseImport";
import Elysia, { t } from "elysia";

import { ok } from "@/helpers/response";
import { protectedPlugin } from "../plugins/protected";
import { sessionPlugin } from "../plugins/session";

const courseBody = t.Object({
  title: t.String(),
  slug: t.String(),
  description: t.Optional(t.String()),
  thumbnailUrl: t.Optional(t.String()),
  level: t.Optional(
    t.Union([
      t.Literal("beginner"),
      t.Literal("intermediate"),
      t.Literal("advanced"),
    ]),
  ),
});

const courseUpdateBody = t.Object({
  title: t.Optional(t.String()),
  description: t.Optional(t.String()),
  thumbnailUrl: t.Optional(t.String()),
  level: t.Optional(
    t.Union([
      t.Literal("beginner"),
      t.Literal("intermediate"),
      t.Literal("advanced"),
    ]),
  ),
});

export const courseRoutes = new Elysia()
  .use(sessionPlugin)
  .get("/api/courses", async ({ session }) =>
    ok(await courseService.list(!session)),
  )
  .get(
    "/api/courses/check-slug",
    async ({ query }) => ok(await courseService.checkSlug(query.slug)),
    { query: t.Object({ slug: t.String({ minLength: 1 }) }) },
  )
  .get("/api/courses/:courseId", async ({ params }) =>
    ok(await courseService.getBySlug(params.courseId)),
  )
  .use(protectedPlugin)
  .post(
    "/api/courses/import/preview",
    async ({ body }) => ok(await courseImportService.previewFromPath(body.path)),
    { body: t.Object({ path: t.String() }) },
  )
  .post(
    "/api/courses",
    async ({ body }) => ok(await courseService.create(body), "Course created"),
    { body: courseBody },
  )
  .patch(
    "/api/courses/:courseId",
    async ({ params, body }) => ok(await courseService.update(params.courseId, body)),
    { body: courseUpdateBody },
  )
  .delete("/api/courses/:courseId", async ({ params }) =>
    ok(await courseService.remove(params.courseId), "Course deleted"),
  )
  .post("/api/courses/:courseId/publish", async ({ params }) =>
    ok(await courseService.togglePublish(params.courseId)),
  );
