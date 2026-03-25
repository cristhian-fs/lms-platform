import type { ApiResponse, SuccessResponse } from "@lms-platform/api/types";
import { env } from "@lms-platform/env/web";
import { QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type { ApiResponse, SuccessResponse };

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      toast.error(error.message, {
        action: {
          label: "retry",
          onClick: query.invalidate,
        },
      });
    },
  }),
});

const BASE = env.VITE_SERVER_URL;

async function request<T>(path: string, init?: RequestInit): Promise<SuccessResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success) throw new Error(json.message);
  return json;
}

export const api = {
  health: () => request<{ status: string }>("/api/health"),
  me: () => request<{ message: string; user: { id: string; name: string; email: string } }>("/api/me"),
  enroll: (courseId: string) =>
    request("/api/enrollments", {
      method: "POST",
      body: JSON.stringify({ courseId }),
    }),
};
