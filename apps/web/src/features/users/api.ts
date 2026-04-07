import { request } from "@/lib/request";
import type { User } from "./types";

export const usersApi = {
  keys: {
    all: (search?: string) => ["users", search] as const,
  },
  findAll: (search?: string) =>
    request<{ users: User[]; total: number }>(
      `/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ""}`,
    ),
  create: (body: { name: string; email: string; password: string; role: "user" | "admin" }) =>
    request(`/api/admin/users`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  ban: (id: string) =>
    request(`/api/admin/users/${id}/ban`, { method: "PATCH" }),
  unban: (id: string) =>
    request(`/api/admin/users/${id}/unban`, { method: "PATCH" }),
  remove: (id: string) =>
    request(`/api/admin/users/${id}`, { method: "DELETE" }),
};
