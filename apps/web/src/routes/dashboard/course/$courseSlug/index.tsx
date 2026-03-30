import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Skeleton } from "@lms-platform/ui/components/skeleton";
import { CourseSidebar } from "@/features/courses/components/course-sidebar";
import { CourseViewer } from "@/features/courses/components/course-viewer";
import type { Lesson } from "@/features/courses/types";

export const Route = createFileRoute("/dashboard/course/$courseSlug/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { courseSlug } = Route.useParams();
  const queryClient = useQueryClient();
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery({
    queryKey: api.course.keys.bySlug(courseSlug),
    queryFn: () => api.course.findBySlug(courseSlug),
    select: (res) => res.data,
  });

  // Auto-enroll when first visiting; ignore 409 (already enrolled)
  const { mutate: enroll } = useMutation({
    mutationFn: (courseId: string) => api.course.enrollments.enroll(courseId),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: api.course.keys.enrollments(),
      }),
  });

  useEffect(() => {
    if (course?.id) enroll(course.id);
  }, [course?.id]);

  const { data: progress } = useQuery({
    queryKey: api.course.keys.progress(course?.id ?? ""),
    queryFn: () => api.course.progress.getByCourse(course!.id),
    enabled: !!course?.id,
    retry: false,
    select: (res) => res.data,
  });

  const { mutate: markComplete } = useMutation({
    mutationFn: (lessonId: string) =>
      api.course.progress.upsertLesson(lessonId, {
        watchedSeconds: 0,
        completed: true,
      }),
    onMutate: (lessonId) => setMarkingId(lessonId),
    onSettled: () => setMarkingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.course.keys.progress(course!.id),
      });
      queryClient.invalidateQueries({
        queryKey: api.course.keys.enrollments(),
      });
      toast.success("Aula marcada como concluída");
    },
    onError: () => toast.error("Falha ao salvar progresso"),
  });

  const completedIds = new Set(
    progress?.lessons.filter((l) => l.completed).map((l) => l.lessonId) ?? [],
  );

  const displayLesson = activeLesson ?? course?.modules?.[0]?.lessons?.[0] ?? null;
  const isCurrentDone = displayLesson ? completedIds.has(displayLesson.id) : false;
  const isMarking = !!markingId && markingId === displayLesson?.id;

  if (isLoading) {
    return (
      <div className="flex h-svh overflow-hidden">
        <div className="flex h-full w-72 shrink-0 flex-col gap-3 border-r border-border p-4">
          <Skeleton className="h-14 w-full" />
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-6">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-6 w-1/3" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <p className="text-muted-foreground">Curso não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="flex h-svh overflow-hidden">
      <CourseSidebar
        modules={course.modules}
        activeLesson={displayLesson}
        completedIds={completedIds}
        progressPct={progress?.progressPct ?? 0}
        onSelect={setActiveLesson}
      />
      <main className="flex flex-1 flex-col overflow-y-auto p-6">
        <CourseViewer
          lesson={displayLesson}
          isCompleted={isCurrentDone}
          isMarking={isMarking}
          onMarkComplete={
            progress && displayLesson
              ? () => markComplete(displayLesson.id)
              : undefined
          }
          onVideoEnded={
            progress && displayLesson && !isCurrentDone
              ? () => markComplete(displayLesson.id)
              : undefined
          }
        />
      </main>
    </div>
  );
}
