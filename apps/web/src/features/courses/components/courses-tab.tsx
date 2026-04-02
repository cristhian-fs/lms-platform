import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@lms-platform/ui/lib/utils";
import {
  EyeIcon,
  EyeOffIcon,
  GraduationCapIcon,
  LayersIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@lms-platform/ui/components/alert-dialog";
import { Button } from "@lms-platform/ui/components/button";
import { Skeleton } from "@lms-platform/ui/components/skeleton";
import { useFindCourses } from "@/features/courses/api/findCourses";
import { api } from "@/lib/api";
import type { Course } from "../types";
import { EditCourseDialog } from "./edit-course-dialog";
import { ManageCourseDialog } from "./manage-course-dialog";
import { UploadCourseDialog } from "./upload-course-dialog";
import { thumbnailSrc } from "@/lib/utils";

const LEVEL_LABEL: Record<Course["level"], string> = {
  beginner: "Iniciante",
  intermediate: "Intermediário",
  advanced: "Avançado",
};

const LEVEL_COLOR: Record<Course["level"], string> = {
  beginner: "text-emerald-400",
  intermediate: "text-amber-400",
  advanced: "text-destructive",
};

export function CoursesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useFindCourses();
  const courses = data?.data ?? [];

  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [manageCourse, setManageCourse] = useState<Course | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

  const { mutate: togglePublish, isPending: isTogglingPublish } = useMutation({
    mutationFn: (id: string) => api.course.togglePublish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Curso atualizado");
    },
    onError: () => toast.error("Falha ao atualizar o curso"),
  });

  const { mutate: removeCourse, isPending: isRemoving } = useMutation({
    mutationFn: (id: string) => api.course.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Curso excluído");
      setDeleteCourse(null);
    },
    onError: () => toast.error("Falha ao excluir o curso"),
  });

  return (
    <>
      {/* Courses list */}
      <div className="relative border border-border">
        {/* Corner brackets */}
        <span className="absolute top-0 left-0 size-2 border-l border-t border-foreground/20 z-10" />
        <span className="absolute top-0 right-0 size-2 border-r border-t border-foreground/20 z-10" />
        <span className="absolute bottom-0 left-0 size-2 border-l border-b border-foreground/20 z-10" />
        <span className="absolute bottom-0 right-0 size-2 border-r border-b border-foreground/20 z-10" />

        {/* Header zone */}
        <div className="flex items-center justify-between px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {isLoading
              ? "Carregando…"
              : `${courses.length} curso${courses.length !== 1 ? "s" : ""}`}
          </span>
          <UploadCourseDialog />
        </div>

        {/* List zone */}
        <div className="border-t border-border divide-y divide-border">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <Skeleton className="w-16 h-10 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-20 hidden sm:block" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-16 hidden md:block" />
                <Skeleton className="h-7 w-28" />
              </div>
            ))
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <GraduationCapIcon className="size-8 text-muted-foreground/30" />
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Nenhum curso adicionado
              </span>
              <span className="text-xs text-muted-foreground">
                Adicione o primeiro curso no botão acima
              </span>
            </div>
          ) : (
            courses.map((course) => (
              <CourseRow
                key={course.id}
                course={course}
                onEdit={() => setEditCourse(course)}
                onManage={() => setManageCourse(course)}
                onDelete={() => setDeleteCourse(course)}
                onTogglePublish={() => togglePublish(course.id)}
                isTogglingPublish={isTogglingPublish}
              />
            ))
          )}
        </div>
      </div>

      {/* Edit dialog */}
      {editCourse && (
        <EditCourseDialog
          course={editCourse}
          open
          onOpenChange={(v) => !v && setEditCourse(null)}
        />
      )}

      {/* Manage dialog */}
      {manageCourse && (
        <ManageCourseDialog
          course={manageCourse}
          open
          onOpenChange={(v) => !v && setManageCourse(null)}
        />
      )}

      {/* Delete confirmation */}
      <AlertDialog
        open={!!deleteCourse}
        onOpenChange={(v) => !v && setDeleteCourse(null)}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir curso?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteCourse?.title}" e todos os seus módulos e aulas serão
              excluídos permanentemente. Essa ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteCourse && removeCourse(deleteCourse.id)}
              disabled={isRemoving}
            >
              {isRemoving ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Course Row ───────────────────────────────────────────────────────────────

interface CourseRowProps {
  course: Course;
  onEdit: () => void;
  onManage: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  isTogglingPublish: boolean;
}

function CourseRow({
  course,
  onEdit,
  onManage,
  onDelete,
  onTogglePublish,
  isTogglingPublish,
}: CourseRowProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/20">
      {/* Thumbnail */}
      <div className="shrink-0 w-16 h-10 overflow-hidden bg-muted flex items-center justify-center">
        {thumbnailSrc(course.thumbnailUrl) ? (
          <img
            src={thumbnailSrc(course.thumbnailUrl)!}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <GraduationCapIcon className="size-5 text-muted-foreground/40" />
        )}
      </div>

      {/* Title + slug */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{course.title}</p>
        <p className="font-mono text-[10px] text-muted-foreground truncate">
          {course.slug}
        </p>
      </div>

      {/* Level */}
      <span
        className={cn(
          "hidden sm:block font-mono text-[10px] uppercase tracking-widest shrink-0",
          LEVEL_COLOR[course.level],
        )}
      >
        [{LEVEL_LABEL[course.level]}]
      </span>

      {/* Published status */}
      <span
        className={cn(
          "font-mono text-[10px] uppercase tracking-widest shrink-0",
          course.isPublished ? "text-primary" : "text-muted-foreground",
        )}
      >
        [{course.isPublished ? "Publicado" : "Rascunho"}]
      </span>

      {/* Stats */}
      <span className="hidden md:flex items-center gap-1 font-mono text-[10px] tabular-nums text-muted-foreground shrink-0">
        {course.moduleCount}m
        <span className="text-border" aria-hidden="true">│</span>
        {course.lessonCount}l
      </span>

      {/* Actions */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          title={course.isPublished ? "Despublicar" : "Publicar"}
          onClick={onTogglePublish}
          disabled={isTogglingPublish}
        >
          {course.isPublished ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          title="Editar curso"
          onClick={onEdit}
        >
          <PencilIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          title="Gerenciar módulos e aulas"
          onClick={onManage}
        >
          <LayersIcon />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          title="Excluir curso"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2Icon />
        </Button>
      </div>
    </div>
  );
}
