import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import { FileTextIcon, HelpCircleIcon, Loader2Icon, PlusIcon, SaveIcon, VideoIcon } from "lucide-react";
import { Button } from "@lms-platform/ui/components/button";
import { Checkbox } from "@lms-platform/ui/components/checkbox";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lms-platform/ui/components/tabs";
import { TimeInput } from "@/components/time-input";
import { api } from "@/lib/api";
import type { Lesson, LessonCreateBody, LessonType, LessonUpdateBody } from "@/features/courses/types";

const LESSON_TYPES: LessonType[] = ["video", "article", "quiz"];

const JSON_PLACEHOLDER = `[
  {
    "title": "Introduction",
    "type": "video",
    "videoUrl": "https://...",
    "durationSeconds": 668,
    "isPreview": true
  },
  {
    "title": "Getting Started",
    "type": "video",
    "durationSeconds": 480
  }
]`;

const LESSON_TYPE_ICONS: Record<LessonType, React.ReactNode> = {
  video: <VideoIcon className="size-3.5 shrink-0" />,
  article: <FileTextIcon className="size-3.5 shrink-0" />,
  quiz: <HelpCircleIcon className="size-3.5 shrink-0" />,
};

function secondsToHhmmss(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
}

function hhmmssToSeconds(value: string): number {
  const parts = value.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

// ─── JSON form ────────────────────────────────────────────────────────────────

function parseLesson(
  obj: Record<string, unknown>,
  index: number,
): { error: string } | { lesson: Omit<LessonCreateBody, "order"> } {
  if (!obj.title || typeof obj.title !== "string")
    return { error: `Item ${index + 1}: "title" é obrigatório e deve ser uma string.` };
  if (obj.type && !LESSON_TYPES.includes(obj.type as LessonType))
    return { error: `Item ${index + 1}: "type" deve ser um dos: ${LESSON_TYPES.join(", ")}.` };
  if (obj.durationSeconds !== undefined && typeof obj.durationSeconds !== "number")
    return { error: `Item ${index + 1}: "durationSeconds" deve ser um número.` };

  return {
    lesson: {
      title: obj.title,
      type: obj.type ? (obj.type as LessonType) : undefined,
      videoUrl: typeof obj.videoUrl === "string" ? obj.videoUrl : undefined,
      contentMdx: typeof obj.contentMdx === "string" ? obj.contentMdx : undefined,
      durationSeconds: typeof obj.durationSeconds === "number" ? obj.durationSeconds : undefined,
      isPreview: typeof obj.isPreview === "boolean" ? obj.isPreview : undefined,
    },
  };
}

function JsonLessonForm({
  nextOrder,
  onSubmit,
}: {
  nextOrder: number;
  onSubmit: (body: LessonCreateBody) => Promise<void>;
}) {
  const [raw, setRaw] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setParseError(null);
    setProgress(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setParseError("JSON inválido — verifique a sintaxe.");
      return;
    }

    const items = Array.isArray(parsed) ? parsed : [parsed];

    if (items.length === 0) {
      setParseError("O array está vazio.");
      return;
    }

    // Validate all before submitting any
    const lessons: Omit<LessonCreateBody, "order">[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (typeof item !== "object" || item === null || Array.isArray(item)) {
        setParseError(`Item ${i + 1}: deve ser um objeto.`);
        return;
      }
      const result = parseLesson(item as Record<string, unknown>, i);
      if ("error" in result) {
        setParseError(result.error);
        return;
      }
      lessons.push(result.lesson);
    }

    setIsPending(true);
    setProgress({ done: 0, total: lessons.length });
    try {
      for (let i = 0; i < lessons.length; i++) {
        await onSubmit({ ...lessons[i], order: nextOrder + i });
        setProgress({ done: i + 1, total: lessons.length });
      }
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form className="flex flex-col gap-3 pt-2" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="lesson-json">JSON de Aulas</Label>
        <textarea
          id="lesson-json"
          rows={11}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setParseError(null);
            setProgress(null);
          }}
          placeholder={JSON_PLACEHOLDER}
          spellCheck={false}
          className="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
        />
        {parseError && <p className="text-xs text-destructive">{parseError}</p>}
        <p className="text-xs text-muted-foreground">
          Passe um array de objetos. Obrigatório por item: <code>title</code>.
          Opcionais: <code>type</code>, <code>videoUrl</code>,{" "}
          <code>durationSeconds</code>, <code>contentMdx</code>,{" "}
          <code>isPreview</code>. A ordem é atribuída automaticamente.
        </p>
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={!raw.trim() || isPending}>
          {isPending ? (
            <Loader2Icon className="animate-spin" />
          ) : (
            <PlusIcon />
          )}
          {isPending && progress
            ? `Adicionando ${progress.done}/${progress.total}…`
            : "Adicionar Aulas"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface LessonFormDialogProps {
  moduleId: string;
  courseSlug: string;
  nextOrder?: number;
  lesson?: Lesson;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LessonFormDialog({
  moduleId,
  courseSlug,
  nextOrder = 1,
  lesson,
  open,
  onOpenChange,
}: LessonFormDialogProps) {
  const queryClient = useQueryClient();
  const isEditing = !!lesson;

  const { mutateAsync: createLesson } = useMutation({
    mutationFn: (body: LessonCreateBody) => api.course.lessons.create(moduleId, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.bySlug(courseSlug) });
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Aula adicionada");
      onOpenChange(false);
    },
    onError: () => toast.error("Falha ao adicionar aula"),
  });

  const { mutateAsync: updateLesson } = useMutation({
    mutationFn: (body: LessonUpdateBody) => api.course.lessons.update(lesson!.id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.bySlug(courseSlug) });
      toast.success("Aula atualizada");
      onOpenChange(false);
    },
    onError: () => toast.error("Falha ao atualizar aula"),
  });

  const form = useForm({
    defaultValues: {
      title: lesson?.title ?? "",
      type: (lesson?.type ?? "video") as LessonType,
      videoUrl: lesson?.videoUrl ?? "",
      duration: lesson?.durationSeconds
        ? secondsToHhmmss(lesson.durationSeconds)
        : "00:00:00",
      isPreview: lesson?.isPreview ?? false,
    },
    onSubmit: async ({ value }) => {
      const durationSeconds = hhmmssToSeconds(value.duration);
      if (isEditing) {
        await updateLesson({
          title: value.title,
          videoUrl: value.type === "video" ? value.videoUrl || undefined : undefined,
          durationSeconds,
          isPreview: value.isPreview,
        });
      } else {
        await createLesson({
          title: value.title,
          type: value.type,
          videoUrl: value.type === "video" ? value.videoUrl || undefined : undefined,
          durationSeconds,
          order: nextOrder,
          isPreview: value.isPreview,
        });
      }
    },
  });

  const manualForm = (
    <form
      className="flex flex-col gap-4 pt-2"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
          <form.Field name="title">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="lesson-title">Título *</Label>
                <Input
                  id="lesson-title"
                  placeholder="Título da aula"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  autoFocus
                />
              </div>
            )}
          </form.Field>

          <div className="grid grid-cols-2 gap-3">
            <form.Field name="type">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lesson-type">Tipo</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as LessonType)}
                    disabled={isEditing}
                  >
                    <SelectTrigger id="lesson-type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LESSON_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          <span className="flex items-center gap-2">
                            {LESSON_TYPE_ICONS[t]}
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="duration">
              {(field) => (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lesson-duration">Duração</Label>
                  <TimeInput
                    id="lesson-duration"
                    format="long"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                </div>
              )}
            </form.Field>
          </div>

          <form.Subscribe selector={(s) => s.values.type}>
            {(type) =>
              type === "video" ? (
                <form.Field name="videoUrl">
                  {(field) => (
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="lesson-video-url">URL do Vídeo</Label>
                      <Input
                        id="lesson-video-url"
                        placeholder="https://..."
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                      />
                    </div>
                  )}
                </form.Field>
              ) : null
            }
          </form.Subscribe>

          <form.Field name="isPreview">
            {(field) => (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="lesson-preview"
                  checked={field.state.value}
                  onCheckedChange={(checked) => field.handleChange(!!checked)}
                />
                <Label htmlFor="lesson-preview" className="cursor-pointer font-normal">
                  Pré-visualização gratuita — acessível sem matrícula
                </Label>
              </div>
            )}
          </form.Field>

          <DialogFooter showCloseButton>
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {isSubmitting ? (
                    <Loader2Icon className="animate-spin" />
                  ) : isEditing ? (
                    <SaveIcon />
                  ) : (
                    <PlusIcon />
                  )}
                  {isEditing ? "Salvar Alterações" : "Adicionar Aula"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Aula" : "Adicionar Aula"}</DialogTitle>
        </DialogHeader>

        {isEditing ? (
          manualForm
        ) : (
          <Tabs defaultValue="manual">
            <TabsList>
              <TabsTrigger value="manual">Manual</TabsTrigger>
              <TabsTrigger value="json">JSON (em lote)</TabsTrigger>
            </TabsList>
            <TabsContent value="manual">{manualForm}</TabsContent>
            <TabsContent value="json">
              <JsonLessonForm
                nextOrder={nextOrder}
                onSubmit={async (body) => {
                  await createLesson(body);
                }}
              />
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
