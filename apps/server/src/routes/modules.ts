import * as moduleService from "@lms-platform/api/services/module";
import Elysia, { t } from "elysia";

import { ok } from "@/helpers/response";
import { protectedPlugin } from "../plugins/protected";

export const moduleRoutes = new Elysia()
  .use(protectedPlugin)
  .post(
    "/api/courses/:courseId/modules",
    async ({ params, body }) => ok(await moduleService.create(params.courseId, body), "Module created"),
    { body: t.Object({ title: t.String(), order: t.Number() }) },
  )
  .patch(
    "/api/modules/:id",
    async ({ params, body }) => ok(await moduleService.update(params.id, body)),
    { body: t.Object({ title: t.Optional(t.String()), order: t.Optional(t.Number()) }) },
  )
  .delete("/api/modules/:id", async ({ params }) =>
    ok(await moduleService.remove(params.id), "Module deleted"),
  );
