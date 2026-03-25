import { ok } from "@/helpers/response";
import Elysia from "elysia";

export const healthRoutes = new Elysia().get("/api/health", () => ok(null, "OK"));
