import Elysia from "elysia";
import { protectedPlugin } from "./protected";

export const adminPlugin = new Elysia({ name: "admin" })
  .use(protectedPlugin)
  .onBeforeHandle({ as: "scoped" }, ({ session, status }) => {
    if (session?.user.role && session?.user.role !== "admin")
      return status(403, {
        success: false,
        data: null,
        message: "Forbidden",
      });
  });
