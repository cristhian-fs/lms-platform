import type { UseQueryOptions } from "@tanstack/react-query";

export type ParsedLesson = {
  title: string;
  order: number;
  dirName: string;
  videoPath: string;
};

export type ParsedModule = {
  title: string;
  order: number;
  dirName: string;
  lessons: ParsedLesson[];
};

export type ParsedCourse = {
  dirName: string;
  suggestedTitle: string;
  suggestedSlug: string;
  thumbnailPath: string;
  descriptionPath?: string;
  modules: ParsedModule[];
};

export type SyncResult = {
  courseId: string;
  slug: string;
  modulesCreated: number;
  modulesUpdated: number;
  modulesDeleted: number;
  lessonsCreated: number;
  lessonsUpdated: number;
  lessonsDeleted: number;
};

export type UseQueryParams<TData> = Omit<
  UseQueryOptions<TData>,
  "queryKey" | "queryFn"
>;

export type Level = "beginner" | "intermediate" | "advanced";

export type CourseCreateBody = {
  title: string;
  slug: string;
  description?: string;
  thumbnailUrl?: string;
  level?: Level;
};

export type CourseUpdateBody = {
  title?: string;
  description?: string;
  thumbnailUrl?: string;
  level?: Level;
};

export type Course = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnailUrl: string | null;
  level: Level;
  durationSeconds: number;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  moduleCount: number;
  lessonCount: number;
};

export type LessonType = "video" | "article" | "quiz";

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  type: LessonType;
  videoUrl: string | null;
  contentMdx: string | null;
  durationSeconds: number;
  order: number;
  isPreview: boolean;
  createdAt: string;
};

export type Module = {
  id: string;
  courseId: string;
  title: string;
  order: number;
  lessons: Lesson[];
  createdAt: string;
};

export type CourseDetail = Omit<Course, "moduleCount" | "lessonCount"> & {
  modules: Module[];
};

export type LessonCreateBody = {
  title: string;
  type?: LessonType;
  videoUrl?: string;
  contentMdx?: string;
  durationSeconds?: number;
  order: number;
  isPreview?: boolean;
};

export type LessonUpdateBody = {
  title?: string;
  videoUrl?: string;
  contentMdx?: string;
  durationSeconds?: number;
  order?: number;
  isPreview?: boolean;
};

export type EnrollmentStatus = "active" | "completed" | "dropped";

export type EnrollmentItem = {
  id: string;
  courseId: string;
  status: EnrollmentStatus;
  progressPct: number;
  enrolledAt: string;
  completedAt: string | null;
};

export type LessonProgressRecord = {
  lessonId: string;
  completed: boolean;
  watchedSeconds: number;
};

export type CourseProgressResponse = {
  progressPct: number;
  status: EnrollmentStatus;
  lessons: LessonProgressRecord[];
};
