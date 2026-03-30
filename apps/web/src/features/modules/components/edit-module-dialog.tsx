import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, SaveIcon } from "lucide-react";
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
import { api } from "@/lib/api";
import type { Module } from "@/features/courses/types";

interface EditModuleDialogProps {
  module: Module;
  courseSlug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditModuleDialog({ module, courseSlug, open, onOpenChange }: EditModuleDialogProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(module.title);

  const { mutate: updateModule, isPending } = useMutation({
    mutationFn: (t: string) => api.course.modules.update(module.id, { title: t }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.bySlug(courseSlug) });
      toast.success("Módulo atualizado");
      onOpenChange(false);
    },
    onError: () => toast.error("Falha ao atualizar módulo"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Editar Módulo</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5 pt-2">
          <Label htmlFor="mod-title">Título *</Label>
          <Input
            id="mod-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && title.trim() && updateModule(title.trim())}
            autoFocus
          />
        </div>
        <DialogFooter showCloseButton>
          <Button
            onClick={() => updateModule(title.trim())}
            disabled={!title.trim() || isPending}
          >
            {isPending ? <Loader2Icon className="animate-spin" /> : <SaveIcon />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
