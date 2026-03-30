import { cn } from "@lms-platform/ui/lib/utils";
import {
  CheckCircle2Icon,
  CircleIcon,
  FileTextIcon,
  HelpCircleIcon,
  VideoIcon,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";
import type { Lesson, LessonType, Module } from "../types";

const LESSON_TYPE_ICONS: Record<LessonType, React.ReactNode> = {
  video: <VideoIcon className="size-3 shrink-0" />,
  article: <FileTextIcon className="size-3 shrink-0" />,
  quiz: <HelpCircleIcon className="size-3 shrink-0" />,
};

interface CourseSidebarProps {
  modules: Module[];
  activeLesson: Lesson | null;
  completedIds: Set<string>;
  progressPct: number;
  onSelect: (lesson: Lesson) => void;
}

export function CourseSidebar({
  modules,
  activeLesson,
  completedIds,
  progressPct,
  onSelect,
}: CourseSidebarProps) {
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = completedIds.size;

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-sidebar">
      {/* Progress header zone */}
      <div className="flex flex-col gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Progresso
          </span>
          <span className="font-mono text-[10px] tabular-nums text-foreground/60">
            {completedCount}
            <span className="mx-1 text-border" aria-hidden="true">│</span>
            {totalLessons} aulas
          </span>
        </div>
        <div className="h-px overflow-hidden bg-border">
          <div
            className="h-full bg-primary transition-[width]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="font-mono tabular-nums text-[10px] text-foreground/60">
          {progressPct}%
        </span>
      </div>

      {/* Lesson list */}
      <div className="flex flex-col overflow-y-auto">
        {modules.map((mod) => (
          <div key={mod.id} className="flex flex-col border-b border-border last:border-0">
            <div className="px-4 py-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {mod.order}. {mod.title}
              </p>
            </div>

            <div className="flex flex-col pb-1">
              {mod.lessons.map((lesson) => {
                const isActive = activeLesson?.id === lesson.id;
                const isDone = completedIds.has(lesson.id);

                return (
                  <button
                    key={lesson.id}
                    type="button"
                    onClick={() => onSelect(lesson)}
                    className={cn(
                      "flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-left text-sm transition-colors",
                      isActive
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-transparent text-foreground/80 hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2Icon className="size-3.5 shrink-0 text-primary/70" />
                    ) : (
                      <CircleIcon className="size-3.5 shrink-0 text-muted-foreground/50" />
                    )}
                    <span className="flex-1 truncate leading-snug">
                      {lesson.title}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 font-mono text-[10px] tabular-nums text-muted-foreground">
                      <span className="opacity-60">
                        {LESSON_TYPE_ICONS[lesson.type]}
                      </span>
                      {lesson.durationSeconds > 0 &&
                        formatDuration(lesson.durationSeconds)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
