import { auth } from "@lms-platform/auth";
import * as adminService from "@lms-platform/api/services/admin";
import Elysia, { t } from "elysia";

import { ok } from "@/helpers/response";
import { adminPlugin } from "../../plugins/admin";

const createUserBody = t.Object({
  name: t.String({ minLength: 2 }),
  email: t.String({ format: "email" }),
  password: t.String({ minLength: 8 }),
  role: t.Union([t.Literal("user"), t.Literal("admin")]),
});

export const adminUserRoutes = new Elysia()
  .use(adminPlugin)
  .get(
    "/api/admin/users",
    async ({ query }) => {
      const result = await adminService.listUsers(query.search);
      return ok(result);
    },
    {
      query: t.Object({
        search: t.Optional(t.String()),
      }),
    },
  )
  .post(
    "/api/admin/users",
    async ({ body, request }) => {
      const user = await auth.api.createUser({
        body: {
          name: body.name,
          email: body.email,
          password: body.password,
          role: body.role,
        },
        headers: request.headers,
      });
      return ok(user, "User created");
    },
    { body: createUserBody },
  )
  .patch("/api/admin/users/:id/ban", async ({ params, session, request, status }) => {
    if (params.id === session?.user.id)
      return status(400, { success: false, data: null, message: "You cannot ban yourself" });
    await auth.api.banUser({
      body: { userId: params.id },
      headers: request.headers,
    });
    return ok(null, "User banned");
  })
  .patch("/api/admin/users/:id/unban", async ({ params, request }) => {
    await auth.api.unbanUser({
      body: { userId: params.id },
      headers: request.headers,
    });
    return ok(null, "User unbanned");
  })
  .delete("/api/admin/users/:id", async ({ params, session, request, status }) => {
    if (params.id === session?.user.id)
      return status(400, { success: false, data: null, message: "You cannot delete yourself" });
    await auth.api.removeUser({
      body: { userId: params.id },
      headers: request.headers,
    });
    return ok(null, "User deleted");
  });
