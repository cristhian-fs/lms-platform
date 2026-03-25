import * as ratingService from "@lms-platform/api/services/rating";
import Elysia, { t } from "elysia";

import { ok } from "@/helpers/response";
import { protectedPlugin } from "../plugins/protected";
import { sessionPlugin } from "../plugins/session";

const ratingBody = t.Object({
  rating: t.Number({ minimum: 1, maximum: 5 }),
  comment: t.Optional(t.String()),
});

export const ratingRoutes = new Elysia()
  .use(sessionPlugin)
  .get("/api/courses/:courseId/ratings", async ({ params }) =>
    ok(await ratingService.list(params.courseId)),
  )
  .use(protectedPlugin)
  .post(
    "/api/courses/:courseId/ratings",
    async ({ session, params, body }) =>
      ok(await ratingService.rate(session!.user.id, params.courseId, body), "Rating submitted"),
    { body: ratingBody },
  )
  .patch(
    "/api/courses/:courseId/ratings",
    async ({ session, params, body }) =>
      ok(await ratingService.updateRating(session!.user.id, params.courseId, body)),
    { body: ratingBody },
  )
  .delete("/api/courses/:courseId/ratings", async ({ session, params }) =>
    ok(await ratingService.deleteRating(session!.user.id, params.courseId), "Rating deleted"),
  );
