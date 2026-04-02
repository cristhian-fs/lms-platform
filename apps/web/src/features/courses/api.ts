import { request } from "@/lib/request";
import type {
  Course,
  CourseCreateBody,
  CourseDetail,
  CourseProgressResponse,
  CourseUpdateBody,
  EnrollmentItem,
  LessonCreateBody,
  LessonUpdateBody,
  ParsedCourse,
  SyncResult,
} from "./types";

export const coursesApi = {
  keys: {
    all: () => ["courses"] as const,
    bySlug: (slug: string) => ["courses", slug] as const,
    progress: (courseId: string) => ["progress", courseId] as const,
    enrollments: () => ["enrollments"] as const,
  },
  findAll: () => request<Course[]>("/api/courses"),
  findBySlug: (slug: string) => request<CourseDetail>(`/api/courses/${slug}`),
  checkSlug: (slug: string) =>
    request<{ available: boolean }>(
      `/api/courses/check-slug?slug=${encodeURIComponent(slug)}`,
    ),
  create: (body: CourseCreateBody) =>
    request<Course>("/api/courses", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  update: (id: string, body: CourseUpdateBody) =>
    request<Course>(`/api/courses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<Course>(`/api/courses/${id}`, { method: "DELETE" }),
  togglePublish: (id: string) =>
    request<Course>(`/api/courses/${id}/publish`, { method: "POST" }),
  previewImport: (path: string) =>
    request<ParsedCourse>("/api/courses/import/preview", {
      method: "POST",
      body: JSON.stringify({ path }),
    }),
  syncImport: (path: string, level?: string) =>
    request<SyncResult>("/api/courses/import/sync", {
      method: "POST",
      body: JSON.stringify({ path, level }),
    }),
  modules: {
    create: (courseId: string, body: { title: string; order: number }) =>
      request(`/api/courses/${courseId}/modules`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: { title?: string; order?: number }) =>
      request(`/api/modules/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request(`/api/modules/${id}`, { method: "DELETE" }),
  },
  enrollments: {
    list: () => request<EnrollmentItem[]>("/api/enrollments"),
    enroll: (courseId: string) =>
      request<EnrollmentItem>("/api/enrollments", {
        method: "POST",
        body: JSON.stringify({ courseId }),
      }),
  },
  progress: {
    getByCourse: (courseId: string) =>
      request<CourseProgressResponse>(`/api/progress/${courseId}`),
    upsertLesson: (
      lessonId: string,
      data: { watchedSeconds: number; completed?: boolean },
    ) =>
      request(`/api/progress/${lessonId}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },
  lessons: {
    create: (moduleId: string, body: LessonCreateBody) =>
      request(`/api/modules/${moduleId}/lessons`, {
        method: "POST",
        body: JSON.stringify(body),
      }),
    update: (id: string, body: LessonUpdateBody) =>
      request(`/api/lessons/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    remove: (id: string) =>
      request(`/api/lessons/${id}`, { method: "DELETE" }),
  },
};
