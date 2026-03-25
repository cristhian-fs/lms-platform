import { auth } from "@lms-platform/auth";
import Elysia from "elysia";

export const sessionPlugin = new Elysia({ name: "session" }).derive(
  { as: "scoped" },
  async ({ request }) => {
    const session = await auth.api.getSession({ headers: request.headers });
    return { session };
  },
);
