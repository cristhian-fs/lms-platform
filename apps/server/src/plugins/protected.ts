import { auth } from "@lms-platform/auth";
import Elysia from "elysia";

export const protectedPlugin = new Elysia({ name: "protected" })
  .derive({ as: "scoped" }, async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return { session };
  })
  .onBeforeHandle({ as: "scoped" }, ({ session, status }) => {
    if (!session) return status(401);
  });
