import { BookOpen, Clock, GraduationCap, Layers } from "lucide-react";
import { cn } from "@lms-platform/ui/lib/utils";
import type { Course, EnrollmentItem } from "../types";
import { formatDuration } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

const LEVEL_LABEL: Record<Course["level"], string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const LEVEL_COLOR: Record<Course["level"], string> = {
  beginner: "text-emerald-400",
  intermediate: "text-amber-400",
  advanced: "text-red-400",
};

interface CourseCardProps {
  course: Course;
  enrollment?: EnrollmentItem;
}

export function CourseCard({ course, enrollment }: CourseCardProps) {
  const isCompleted = enrollment?.status === "completed";
  const hasProgress = enrollment && enrollment.status !== "dropped";

  return (
    <Link
      to="/dashboard/course/$courseSlug"
      params={{ courseSlug: course.slug }}
      className="relative group/card flex flex-col bg-card border border-border transition-colors hover:border-primary/50"
    >
      {/* Corner brackets */}
      <span className="absolute top-0 left-0 size-2 border-l border-t border-foreground/20 group-hover/card:border-primary transition-colors z-10" />
      <span className="absolute top-0 right-0 size-2 border-r border-t border-foreground/20 group-hover/card:border-primary transition-colors z-10" />
      <span className="absolute bottom-0 left-0 size-2 border-l border-b border-foreground/20 group-hover/card:border-primary transition-colors z-10" />
      <span className="absolute bottom-0 right-0 size-2 border-r border-b border-foreground/20 group-hover/card:border-primary transition-colors z-10" />

      {/* Viewport */}
      <div className="relative overflow-hidden h-40 shrink-0">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            width={400}
            height={160}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <GraduationCap aria-hidden="true" className="size-10 text-muted-foreground/20" />
          </div>
        )}

        {/* HUD scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Level */}
        <span
          className={cn(
            "absolute bottom-2 left-2 font-mono text-[10px] uppercase tracking-widest bg-black/40 px-1 py-px",
            LEVEL_COLOR[course.level],
          )}
        >
          [{LEVEL_LABEL[course.level]}]
        </span>

        {/* Completed */}
        {isCompleted && (
          <span className="absolute top-2 right-2 font-mono text-[10px] uppercase tracking-widest text-emerald-400">
            ◆ Concluído
          </span>
        )}
      </div>

      {/* Title zone */}
      <div className="border-t border-border px-3 py-2.5 flex-1 min-h-0">
        <h3 className="font-medium text-sm leading-snug line-clamp-2">
          {course.title}
        </h3>
        {course.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {course.description}
          </p>
        )}
      </div>

      {/* Progress zone */}
      {hasProgress && (
        <div className="border-t border-border px-3 py-2">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            <span>Progresso</span>
            <span className="tabular-nums text-foreground">{enrollment.progressPct}%</span>
          </div>
          <div className="h-px bg-border overflow-hidden">
            <div
              className="h-full bg-primary transition-[width]"
              style={{ width: `${enrollment.progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="border-t border-border px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Layers aria-hidden="true" className="size-3 shrink-0" />
        <span className="tabular-nums">{course.moduleCount}</span>
        <span className="text-border" aria-hidden="true">│</span>
        <BookOpen aria-hidden="true" className="size-3 shrink-0" />
        <span className="tabular-nums">{course.lessonCount}</span>
        {course.durationSeconds > 0 && (
          <>
            <Clock aria-hidden="true" className="size-3 shrink-0 ml-auto" />
            <span className="tabular-nums">{formatDuration(course.durationSeconds)}</span>
          </>
        )}
      </div>
    </Link>
  );
}
