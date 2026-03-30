import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2Icon, PlusIcon } from "lucide-react";
import { Button } from "@lms-platform/ui/components/button";
import { Input } from "@lms-platform/ui/components/input";
import { api } from "@/lib/api";

interface AddModuleFormProps {
  courseId: string;
  courseSlug: string;
  nextOrder: number;
}

export function AddModuleForm({ courseId, courseSlug, nextOrder }: AddModuleFormProps) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");

  const { mutate: createModule, isPending } = useMutation({
    mutationFn: () =>
      api.course.modules.create(courseId, { title: title.trim(), order: nextOrder }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.bySlug(courseSlug) });
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Módulo adicionado");
      setTitle("");
    },
    onError: () => toast.error("Falha ao adicionar módulo"),
  });

  return (
    <div className="flex flex-col gap-2 pb-1">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Novo Módulo
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="Título do módulo"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && title.trim() && createModule()}
          className="flex-1"
        />
        <Button onClick={() => createModule()} disabled={!title.trim() || isPending}>
          {isPending ? <Loader2Icon className="animate-spin" /> : <PlusIcon />}
          Adicionar
        </Button>
      </div>
    </div>
  );
}
