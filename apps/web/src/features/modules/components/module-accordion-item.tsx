import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@lms-platform/ui/components/accordion";
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
import { api } from "@/lib/api";
import type { Lesson, Module } from "@/features/courses/types";
import { LessonRow } from "@/features/lessons/components/lesson-row";
import { LessonFormDialog } from "@/features/lessons/components/lesson-form-dialog";
import { DeleteLessonAlert } from "@/features/lessons/components/delete-lesson-alert";
import { EditModuleDialog } from "./edit-module-dialog";
import { ScrollArea } from "@lms-platform/ui/components/scroll-area";

interface ModuleAccordionItemProps {
  module: Module;
  courseSlug: string;
  courseId: string;
}

export function ModuleAccordionItem({
  module,
  courseSlug,
  courseId,
}: ModuleAccordionItemProps) {
  const queryClient = useQueryClient();
  const [editingModule, setEditingModule] = useState(false);
  const [deletingModule, setDeletingModule] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null);

  const { mutate: deleteModule, isPending: isDeletingModule } = useMutation({
    mutationFn: () => api.course.modules.remove(module.id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: api.course.keys.bySlug(courseSlug),
      });
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Módulo excluído");
      setDeletingModule(false);
    },
    onError: () => toast.error("Falha ao excluir módulo"),
  });

  return (
    <>
      <AccordionItem
        value={module.id}
        className="not-last:border-b border-t-0 border-x-0"
      >
        <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/40 transition-colors">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <span className="text-sm font-medium truncate">
              {module.order}. {module.title}
            </span>
            <span className="text-xs text-muted-foreground shrink-0">
              {module.lessons.length}{" "}
              {module.lessons.length === 1 ? "aula" : "aulas"}
            </span>
            <div
              className="ml-auto flex gap-1 mr-1 opacity-0 group-hover/accordion-trigger:opacity-100 transition-opacity shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="icon-xs"
                title="Editar módulo"
                onClick={() => setEditingModule(true)}
              >
                <PencilIcon />
              </Button>
              <Button
                variant="ghost"
                size="icon-xs"
                title="Excluir módulo"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeletingModule(true)}
              >
                <Trash2Icon />
              </Button>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="px-4 h-auto">
          <div className="flex flex-col gap-0.5 pl-3 border-l ml-2 mb-1">
            {module.lessons.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">
                Nenhuma aula ainda.
              </p>
            ) : (
              module.lessons.map((lesson) => (
                <LessonRow
                  key={lesson.id}
                  lesson={lesson}
                  onEdit={() => setEditingLesson(lesson)}
                  onDelete={() => setDeletingLesson(lesson)}
                />
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mt-1 text-muted-foreground hover:text-foreground"
              onClick={() => setAddingLesson(true)}
            >
              <PlusIcon />
              Adicionar Aula
            </Button>
          </div>
        </AccordionContent>
      </AccordionItem>

      {editingModule && (
        <EditModuleDialog
          module={module}
          courseSlug={courseSlug}
          open
          onOpenChange={(v) => !v && setEditingModule(false)}
        />
      )}

      <AlertDialog open={deletingModule} onOpenChange={setDeletingModule}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              "{module.title}" e todas as suas aulas serão excluídas permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => deleteModule()}
              disabled={isDeletingModule}
            >
              {isDeletingModule ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {addingLesson && (
        <LessonFormDialog
          moduleId={module.id}
          courseSlug={courseSlug}
          nextOrder={module.lessons.length + 1}
          open
          onOpenChange={(v) => !v && setAddingLesson(false)}
        />
      )}

      {editingLesson && (
        <LessonFormDialog
          moduleId={module.id}
          courseSlug={courseSlug}
          lesson={editingLesson}
          open
          onOpenChange={(v) => !v && setEditingLesson(null)}
        />
      )}

      <DeleteLessonAlert
        lesson={deletingLesson}
        courseSlug={courseSlug}
        onClose={() => setDeletingLesson(null)}
      />
    </>
  );
}
