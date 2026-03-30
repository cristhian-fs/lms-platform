import { useQuery } from "@tanstack/react-query";
import { BookOpenIcon } from "lucide-react";
import { Accordion } from "@lms-platform/ui/components/accordion";
import { ScrollArea } from "@lms-platform/ui/components/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@lms-platform/ui/components/dialog";
import { Separator } from "@lms-platform/ui/components/separator";
import { Skeleton } from "@lms-platform/ui/components/skeleton";
import { api } from "@/lib/api";
import { ModuleAccordionItem } from "@/features/modules/components/module-accordion-item";
import { AddModuleForm } from "@/features/modules/components/add-module-form";
import type { Course } from "../types";

interface ManageCourseDialogProps {
  course: Course;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageCourseDialog({
  course,
  open,
  onOpenChange,
}: ManageCourseDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: api.course.keys.bySlug(course.slug),
    queryFn: () => api.course.findBySlug(course.slug),
    enabled: open,
  });

  const modules = data?.data?.modules ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl flex flex-col">
        <ScrollArea className="flex flex-col gap-4 flex-1 min-h-0 max-h-[50dvh] overflow-y-auto pr-0.5">
          <div className="flex flex-col gap-4">
            <DialogHeader>
              <DialogTitle className="truncate pr-6">
                Gerenciar: {course.title}
              </DialogTitle>
            </DialogHeader>

            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full rounded-lg" />
                ))}
              </div>
            ) : modules.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center">
                <BookOpenIcon className="size-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  Nenhum módulo ainda. Adicione o primeiro abaixo.
                </p>
              </div>
            ) : (
              <Accordion type="multiple" className="border rounded-lg">
                {modules.map((mod) => (
                  <ModuleAccordionItem
                    key={mod.id}
                    module={mod}
                    courseSlug={course.slug}
                    courseId={course.id}
                  />
                ))}
              </Accordion>
            )}

            <Separator />

            <AddModuleForm
              courseId={course.id}
              courseSlug={course.slug}
              nextOrder={modules.length + 1}
            />
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
