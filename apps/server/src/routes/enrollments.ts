import * as enrollmentService from "@lms-platform/api/services/enrollment";
import Elysia, { t } from "elysia";

import { ok } from "@/helpers/response";
import { protectedPlugin } from "../plugins/protected";

export const enrollmentRoutes = new Elysia()
  .use(protectedPlugin)
  .get("/api/enrollments", async ({ session }) =>
    ok(await enrollmentService.listByUser(session!.user.id)),
  )
  .post(
    "/api/enrollments",
    async ({ session, body }) =>
      ok(await enrollmentService.enroll(session!.user.id, body.courseId), "Enrolled successfully"),
    { body: t.Object({ courseId: t.String() }) },
  )
  .delete("/api/enrollments/:courseId", async ({ session, params }) =>
    ok(await enrollmentService.drop(session!.user.id, params.courseId), "Enrollment dropped"),
  );
