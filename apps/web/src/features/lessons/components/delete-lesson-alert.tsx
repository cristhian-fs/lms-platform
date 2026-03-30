import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
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
import { api } from "@/lib/api";
import type { Lesson } from "@/features/courses/types";

interface DeleteLessonAlertProps {
  lesson: Lesson | null;
  courseSlug: string;
  onClose: () => void;
}

export function DeleteLessonAlert({ lesson, courseSlug, onClose }: DeleteLessonAlertProps) {
  const queryClient = useQueryClient();

  const { mutate: deleteLesson, isPending } = useMutation({
    mutationFn: (id: string) => api.course.lessons.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.bySlug(courseSlug) });
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Aula excluída");
      onClose();
    },
    onError: () => toast.error("Falha ao excluir aula"),
  });

  return (
    <AlertDialog open={!!lesson} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir aula?</AlertDialogTitle>
          <AlertDialogDescription>
            "{lesson?.title}" será excluída permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={() => lesson && deleteLesson(lesson.id)}
            disabled={isPending}
          >
            {isPending ? "Excluindo…" : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
