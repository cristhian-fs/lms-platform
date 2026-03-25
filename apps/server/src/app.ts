import { cors } from "@elysiajs/cors";
import { node } from "@elysiajs/node";
import { env } from "@lms-platform/env/server";
import Elysia from "elysia";

import { authRoutes } from "./routes/auth";
import { courseRoutes } from "./routes/courses";
import { enrollmentRoutes } from "./routes/enrollments";
import { healthRoutes } from "./routes/health";
import { lessonRoutes } from "./routes/lessons";
import { meRoutes } from "./routes/me";
import { moduleRoutes } from "./routes/modules";
import { progressRoutes } from "./routes/progress";
import { ratingRoutes } from "./routes/ratings";
import { streamRoutes } from "./routes/stream";
import { errorHandler } from "./plugins/error-handler";

export const app = new Elysia({ adapter: node() })
  .use(errorHandler)
  .use(
    cors({
      origin: env.CORS_ORIGIN,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    }),
  )
  .onRequest(({ request }) => {
    const { method, url, body } = request;
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${body}`);
  })
  .onAfterHandle(({ request }) => {
    console.log(`→ ${request.method} ${request.url}`);
  })
  .use(authRoutes)
  .use(healthRoutes)
  .use(meRoutes)
  .use(courseRoutes)
  .use(moduleRoutes)
  .use(lessonRoutes)
  .use(streamRoutes)
  .use(enrollmentRoutes)
  .use(progressRoutes)
  .use(ratingRoutes)
  .get("/", () => "OK");
