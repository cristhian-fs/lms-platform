import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useFindCourses } from "@/features/courses/api/findCourses";
import { UploadCourseDialog } from "@/features/courses/components/upload-course-dialog";
import { CourseCardSkeleton } from "@/features/courses/components/course-card-skeleton";
import { CourseCard } from "@/features/courses/components/course-card";
import { userQueryOptions } from "@/lib/auth-utils";
import { GraduationCap } from "lucide-react";
import { HeaderZone } from "@/components/header-zone";

export const Route = createFileRoute("/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data, isLoading } = useFindCourses();
  const { data: user } = useQuery(userQueryOptions());

  const { data: enrollmentsRes } = useQuery({
    queryKey: api.course.keys.enrollments(),
    queryFn: () => api.course.enrollments.list(),
    retry: false,
  });

  const enrollments = enrollmentsRes?.data ?? [];
  const enrollmentMap = new Map(enrollments.map((e) => [e.courseId, e]));

  const inProgressCount = enrollments.filter(
    (e) => e.progressPct > 0 && e.progressPct < 100,
  ).length;
  const completedCount = enrollments.filter(
    (e) => e.progressPct === 100,
  ).length;

  const courses = data?.data ?? [];
  const inProgressCourses = courses.filter((c) => {
    const e = enrollmentMap.get(c.id);
    return e && e.progressPct > 0 && e.progressPct < 100;
  });

  const isAdmin = user?.role === "admin";
  const firstName = user?.name?.split(" ")[0] ?? "Aluno";

  return (
    <div className="mx-auto lg:max-w-7xl w-full px-4 lg:px-8 py-8 lg:py-12">
      <HeaderZone
        title={`Olá, ${firstName}`}
        action={isAdmin && <UploadCourseDialog />}
        label="Painel do aluno"
      >
        <div className="flex border-t border-border">
          <div className="flex flex-col gap-0.5 border-r border-border px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Matriculado
            </span>
            <span className="font-mono tabular-nums text-2xl font-medium">
              {enrollments.length}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 border-r border-border px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Em andamento
            </span>
            <span className="font-mono tabular-nums text-2xl font-medium">
              {inProgressCount}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 px-4 py-2.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Concluído
            </span>
            <span className="font-mono tabular-nums text-2xl font-medium">
              {completedCount}
            </span>
          </div>
        </div>
      </HeaderZone>
      {/* Continue learning section */}
      {!isLoading && inProgressCourses.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Continuar aprendendo
            </span>
            <span className="text-border" aria-hidden="true">
              │
            </span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {inProgressCourses.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inProgressCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                enrollment={enrollmentMap.get(course.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* All courses section */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Todos os cursos
          </span>
          {!isLoading && (
            <>
              <span className="text-border" aria-hidden="true">
                │
              </span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {courses.length}
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))
            : courses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollment={enrollmentMap.get(course.id)}
                />
              ))}
        </div>

        {!isLoading && courses.length === 0 && (
          <div className="flex flex-col items-center gap-3 border border-border py-16">
            <GraduationCap className="size-8 text-muted-foreground/40" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Nenhum curso disponível
            </span>
            {isAdmin && (
              <span className="text-xs text-muted-foreground">
                Adicione o primeiro curso usando o botão acima.
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
