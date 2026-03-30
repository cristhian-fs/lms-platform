import { coursesApi } from "@/features/courses/api";
import { request } from "./request";

export const api = {
  course: coursesApi,
  system: {
    health: () => request<null>("/api/health"),
  },
};
