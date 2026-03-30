import Elysia, { t } from "elysia";

import { ok } from "@/helpers/response";
import { protectedPlugin } from "../plugins/protected";
import { uploadFile } from "../services/upload";

export const uploadRoutes = new Elysia()
  .use(protectedPlugin)
  .post(
    "/api/upload",
    async ({ body }) => {
      const { file, bucket, path } = body;
      const result = await uploadFile(
        file,
        bucket ?? "uploads",
        path ?? String(Date.now()),
      );
      return ok(result, "File uploaded");
    },
    {
      body: t.Object({
        file: t.File(),
        bucket: t.Optional(t.String()),
        path: t.Optional(t.String()),
      }),
    },
  );
