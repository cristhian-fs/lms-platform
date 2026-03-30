import { Badge } from "@lms-platform/ui/components/badge";
import { Button } from "@lms-platform/ui/components/button";
import { EyeIcon, FileTextIcon, HelpCircleIcon, PencilIcon, Trash2Icon, VideoIcon } from "lucide-react";
import type { Lesson, LessonType } from "@/features/courses/types";
import { formatDuration } from "@/lib/utils";

const LESSON_TYPE_ICONS: Record<LessonType, React.ReactNode> = {
  video: <VideoIcon className="size-3.5 shrink-0" />,
  article: <FileTextIcon className="size-3.5 shrink-0" />,
  quiz: <HelpCircleIcon className="size-3.5 shrink-0" />,
};

interface LessonRowProps {
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
}

export function LessonRow({ lesson, onEdit, onDelete }: LessonRowProps) {
  return (
    <div className="flex items-center gap-2 py-1.5 group/lesson rounded-md px-1.5 -mx-1.5 hover:bg-muted/40 transition-colors">
      <span className="text-muted-foreground shrink-0">{LESSON_TYPE_ICONS[lesson.type]}</span>
      <span className="flex-1 text-sm truncate min-w-0">
        {lesson.order}. {lesson.title}
      </span>
      {lesson.isPreview && (
        <Badge variant="outline" className="text-xs shrink-0 gap-1 h-5">
          <EyeIcon className="size-2.5" />
          Pré-visualização
        </Badge>
      )}
      {lesson.durationSeconds > 0 && (
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
          {formatDuration(lesson.durationSeconds)}
        </span>
      )}
      <div className="flex gap-1 opacity-0 group-hover/lesson:opacity-100 transition-opacity shrink-0">
        <Button variant="ghost" size="icon-xs" title="Editar aula" onClick={onEdit}>
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-xs"
          title="Excluir aula"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
