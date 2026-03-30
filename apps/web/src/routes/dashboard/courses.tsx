import { HeaderZone } from "@/components/header-zone";
import { CourseCard } from "@/features/courses/components/course-card";
import { CourseCardSkeleton } from "@/features/courses/components/course-card-skeleton";
import { api } from "@/lib/api";
import { userQueryOptions } from "@/lib/auth-utils";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/dashboard/courses")({
  component: RouteComponent,
});

function RouteComponent() {
  const { data: courses, isLoading } = useQuery({
    queryKey: api.course.keys.all(),
    queryFn: () => api.course.findAll(),
    retry: false,
  });
  const { data: user } = useQuery(userQueryOptions());

  const isAdmin = user?.role === "admin";

  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <HeaderZone
        title={"Cursos"}
        description={"Todos os cursos da plataforma"}
      />
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
                {courses?.data.length}
              </span>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <CourseCardSkeleton key={i} />
              ))
            : courses?.data.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
        </div>

        {!isLoading && courses?.data.length === 0 && (
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
    </main>
  );
}
