import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SaveIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@lms-platform/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@lms-platform/ui/components/dialog";
import { Input } from "@lms-platform/ui/components/input";
import { Label } from "@lms-platform/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lms-platform/ui/components/select";
import { Textarea } from "@lms-platform/ui/components/textarea";
import { api } from "@/lib/api";
import type { Course, CourseUpdateBody, Level } from "../types";

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

interface EditCourseDialogProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCourseDialog({ course, open, onOpenChange }: EditCourseDialogProps) {
  const queryClient = useQueryClient();

  const { mutateAsync: updateCourse } = useMutation({
    mutationFn: (body: CourseUpdateBody) => api.course.update(course.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Curso atualizado");
      onOpenChange(false);
    },
    onError: () => toast.error("Falha ao atualizar o curso"),
  });

  const form = useForm({
    defaultValues: {
      title: course.title,
      description: course.description ?? "",
      thumbnailUrl: course.thumbnailUrl ?? "",
      level: course.level,
    },
    onSubmit: async ({ value }) => {
      await updateCourse({
        title: value.title || undefined,
        description: value.description || undefined,
        thumbnailUrl: value.thumbnailUrl || undefined,
        level: value.level,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Curso</DialogTitle>
        </DialogHeader>

        <form
          className="flex flex-col gap-4 pt-2"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Title */}
            <form.Field name="title">
              {(field) => (
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="edit-title">Título *</Label>
                  <Input
                    id="edit-title"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            {/* Level */}
            <form.Field name="level">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-level">Nível</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as Level)}
                  >
                    <SelectTrigger id="edit-level" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l.charAt(0).toUpperCase() + l.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            {/* Thumbnail URL */}
            <form.Field name="thumbnailUrl">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-thumbnail">URL da Miniatura</Label>
                  <Input
                    id="edit-thumbnail"
                    placeholder="https://..."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>

            {/* Description */}
            <form.Field name="description">
              {(field) => (
                <div className="col-span-2 flex flex-col gap-1.5">
                  <Label htmlFor="edit-description">Descrição</Label>
                  <Textarea
                    id="edit-description"
                    rows={3}
                    placeholder="O que os alunos aprenderão neste curso?"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <DialogFooter showCloseButton>
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  <SaveIcon />
                  {isSubmitting ? "Salvando…" : "Salvar Alterações"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
