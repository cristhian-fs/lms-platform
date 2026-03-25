import Elysia from "elysia";
import { ok } from "@/helpers/response";

import { protectedPlugin } from "../plugins/protected";

export const meRoutes = new Elysia()
  .use(protectedPlugin)
  .get("/api/me", ({ session }) => ok(session!.user));
