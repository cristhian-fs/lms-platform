import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@lms-platform/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@lms-platform/ui/components/dialog";
import { Input } from "@lms-platform/ui/components/input";
import { Label } from "@lms-platform/ui/components/label";
import {
  FieldLabel,
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLegend,
  FieldTitle,
  FieldGroup,
} from "@lms-platform/ui/components/field";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lms-platform/ui/components/tabs";
import { FolderOpen, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import type { CourseCreateBody, Level, ParsedCourse } from "../types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@lms-platform/ui/components/select";
import { Textarea } from "@lms-platform/ui/components/textarea";
import { useServiceImage } from "@/hooks/use-service-image";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

const JSON_PLACEHOLDER = `{
  "title": "My Course",
  "slug": "my-course",
  "description": "Optional description",
  "level": "beginner",
  "thumbnailUrl": "https://..."
}`;

const textareaClass =
  "w-full resize-none rounded-none border border-input bg-transparent px-2.5 py-1.5 text-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50";

// ─── Manual Form ─────────────────────────────────────────────────────────────

function ManualForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [slugValue, setSlugValue] = useState("");
  const debouncedSlug = useDebounce(slugValue, 400);

  const { data: slugCheck, isFetching: isCheckingSlug } = useQuery({
    queryKey: ["slug-check", debouncedSlug],
    queryFn: () => api.course.checkSlug(debouncedSlug),
    enabled: debouncedSlug.length >= 3,
    staleTime: 30_000,
  });

  const slugAvailable = debouncedSlug.length >= 3 ? slugCheck?.data?.available : undefined;
  const slugBlocking = isCheckingSlug || slugAvailable === false;

  const { handleImageUpload, imageUrl, setImageUrl, uploading } =
    useServiceImage();

  const { mutateAsync: createCourse } = useMutation({
    mutationFn: (body: CourseCreateBody) => api.course.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Curso criado");
      onSuccess();
    },
  });

  const form = useForm({
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      level: "beginner" as Level,
    },
    onSubmit: async ({ value }) => {
      await createCourse({
        title: value.title,
        slug: value.slug,
        description: value.description || undefined,
        level: value.level,
        thumbnailUrl: imageUrl || undefined,
      });
    },
  });

  return (
    <form
      className="flex flex-col gap-4 pt-4"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      {/* Title */}
      <FieldGroup>
        <form.Field
          name="title"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Título do Curso</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const title = e.target.value;
                    field.handleChange(title);
                    if (!slugManuallyEdited) {
                      const generated = toSlug(title);
                      form.setFieldValue("slug", generated);
                      setSlugValue(generated);
                    }
                  }}
                  aria-invalid={isInvalid}
                  placeholder="JStack"
                  autoComplete="off"
                />
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      {/* Slug */}
      <FieldGroup>
        <form.Field
          name="slug"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Slug</FieldLabel>
                <div className="relative">
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => {
                      const val = e.target.value;
                      field.handleChange(val);
                      setSlugValue(val);
                      setSlugManuallyEdited(true);
                    }}
                    aria-invalid={isInvalid || slugAvailable === false}
                    placeholder="jstack"
                    autoComplete="off"
                    className="pr-28"
                  />
                  {debouncedSlug.length >= 3 && (
                    <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs">
                      {isCheckingSlug ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      ) : slugAvailable ? (
                        <span className="text-emerald-500">Disponível</span>
                      ) : (
                        <span className="text-destructive">Indisponível</span>
                      )}
                    </span>
                  )}
                </div>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>

      {/* Level */}
      <form.Field
        name="level"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field orientation="responsive" data-invalid={isInvalid}>
              <FieldContent>
                <FieldLabel htmlFor="form-tanstack-select-language">
                  Nível do curso
                </FieldLabel>
                <FieldDescription>Selecione o nível do curso.</FieldDescription>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </FieldContent>
              <Select
                name={field.name}
                value={field.state.value}
                onValueChange={field.handleChange}
              >
                <SelectTrigger
                  id="form-tanstack-select-language"
                  aria-invalid={isInvalid}
                  className="min-w-[120px]"
                >
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          );
        }}
      />
      {imageUrl ? (
        <div className="relative h-44 overflow-hidden rounded-xl border border-[#D4B8E8]">
          <img
            src={imageUrl}
            alt="Pré-visualização"
            className="h-full w-full object-cover"
          />
          <button
            type="button"
            onClick={() => setImageUrl(null)}
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <Label className="flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent bg-card transition-colors hover:border-primary">
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          ) : (
            <>
              <Upload className="h-6 w-6 text-foreground" />
              <span className="text-xs font-medium text-foreground">
                Clique para fazer upload
              </span>
              <span className="text-xs text-foreground/60">
                PNG, JPG até 5 MB
              </span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleImageUpload}
            disabled={uploading}
          />
        </Label>
      )}

      {/* Description */}
      <form.Field
        name="description"
        children={(field) => {
          const isInvalid =
            field.state.meta.isTouched && !field.state.meta.isValid;
          return (
            <Field data-invalid={isInvalid}>
              <FieldLabel htmlFor="form-tanstack-textarea-about">
                Descrição do curso
              </FieldLabel>
              <Textarea
                id="form-tanstack-textarea-about"
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                aria-invalid={isInvalid}
                placeholder="O que você vai aprender neste curso?"
                className="min-h-[120px]"
              />
              {isInvalid && <FieldError errors={field.state.meta.errors} />}
            </Field>
          );
        }}
      />

      <DialogFooter showCloseButton>
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting || uploading || slugBlocking}
            >
              <Upload />
              {uploading
                ? "Enviando…"
                : isSubmitting
                  ? "Criando…"
                  : "Criar Curso"}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  );
}

// ─── JSON Upload ──────────────────────────────────────────────────────────────

function JsonUpload({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [raw, setRaw] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);

  const { mutate: createCourse, isPending } = useMutation({
    mutationFn: (body: CourseCreateBody) => api.course.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      toast.success("Course created");
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setParseError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      setParseError("JSON inválido — verifique a sintaxe.");
      return;
    }

    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      setParseError("O JSON deve ser um objeto.");
      return;
    }

    const obj = parsed as Record<string, unknown>;

    if (!obj.title || typeof obj.title !== "string") {
      setParseError('"title" é obrigatório e deve ser uma string.');
      return;
    }
    if (!obj.slug || typeof obj.slug !== "string") {
      setParseError('"slug" é obrigatório e deve ser uma string.');
      return;
    }
    if (obj.level && !LEVELS.includes(obj.level as Level)) {
      setParseError(`"level" deve ser um dos: ${LEVELS.join(", ")}.`);
      return;
    }

    createCourse({
      title: obj.title,
      slug: obj.slug,
      description:
        typeof obj.description === "string" ? obj.description : undefined,
      level: obj.level ? (obj.level as Level) : undefined,
      thumbnailUrl:
        typeof obj.thumbnailUrl === "string" ? obj.thumbnailUrl : undefined,
    });
  }

  return (
    <form className="flex flex-col gap-4 pt-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="json-input">JSON do Curso</Label>
        <textarea
          id="json-input"
          rows={10}
          value={raw}
          onChange={(e) => {
            setRaw(e.target.value);
            setParseError(null);
          }}
          placeholder={JSON_PLACEHOLDER}
          className={`${textareaClass} font-mono`}
          spellCheck={false}
        />
        {parseError && <p className="text-xs text-destructive">{parseError}</p>}
        <p className="text-xs text-muted-foreground">
          Campos obrigatórios: <code>title</code>, <code>slug</code>. Opcionais:{" "}
          <code>description</code>, <code>level</code>,{" "}
          <code>thumbnailUrl</code>.
        </p>
      </div>

      <DialogFooter showCloseButton>
        <Button type="submit" disabled={!raw.trim() || isPending}>
          <Upload />
          {isPending ? "Criando…" : "Criar Curso"}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ─── Local Import ─────────────────────────────────────────────────────────────

function cleanPath(raw: string) {
  // Strip shell escape sequences (e.g. "foo\ bar" → "foo bar")
  return raw.trim().replace(/\\ /g, " ");
}

function LocalImportForm({ onSuccess }: { onSuccess: () => void }) {
  const queryClient = useQueryClient();
  const [path, setPath] = useState("");
  const [level, setLevel] = useState<Level>("beginner");
  const [preview, setPreview] = useState<ParsedCourse | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const { mutate: fetchPreview, isPending: isPreviewing } = useMutation({
    mutationFn: () => api.course.previewImport(cleanPath(path)),
    onSuccess: (res) => {
      setPreview(res.data);
      setPreviewError(null);
    },
    onError: (err) => {
      setPreviewError(err.message);
      setPreview(null);
    },
  });

  const { mutate: syncCourse, isPending: isSyncing } = useMutation({
    mutationFn: () => api.course.syncImport(cleanPath(path), level),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: api.course.keys.all() });
      const {
        modulesCreated,
        lessonsCreated,
        modulesUpdated,
        lessonsUpdated,
        modulesDeleted,
        lessonsDeleted,
      } = res.data;
      const parts = [
        `${modulesCreated + modulesUpdated} módulo(s)`,
        `${lessonsCreated + lessonsUpdated} aula(s)`,
      ];
      if (modulesDeleted + lessonsDeleted > 0) {
        parts.push(`${modulesDeleted + lessonsDeleted} removido(s)`);
      }
      toast.success(`Curso importado: ${parts.join(", ")}`);
      onSuccess();
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const totalLessons = preview?.modules.reduce(
    (sum, m) => sum + m.lessons.length,
    0,
  );

  return (
    <div className="flex flex-col gap-4 pt-4">
      <Field>
        <FieldLabel>Caminho do diretório</FieldLabel>
        <div className="flex gap-2">
          <Input
            value={path}
            onChange={(e) => {
              setPath(e.target.value);
              setPreview(null);
              setPreviewError(null);
            }}
            placeholder="/home/user/meus-cursos/nome-do-curso"
            autoComplete="off"
            className="font-mono text-xs"
          />
          <Button
            type="button"
            variant="secondary"
            disabled={!path.trim() || isPreviewing}
            onClick={() => fetchPreview()}
          >
            {isPreviewing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FolderOpen className="h-4 w-4" />
            )}
            Preview
          </Button>
        </div>
        {previewError && (
          <ul className="flex flex-col gap-0.5">
            {previewError.split("\n").map((msg, i) => (
              <li key={i} className="text-xs text-destructive">
                {msg}
              </li>
            ))}
          </ul>
        )}
      </Field>

      {preview && (
        <div className="flex flex-col gap-3 rounded border border-border bg-muted/30 p-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="font-medium">{preview.suggestedTitle}</span>
            <span className="font-mono text-xs text-muted-foreground">
              /{preview.suggestedSlug}
            </span>
            {preview.descriptionPath && (
              <span className="text-xs text-muted-foreground">
                description.txt detectado
              </span>
            )}
          </div>

          <div className="flex gap-4 text-xs text-muted-foreground">
            <span>{preview.modules.length} módulo(s)</span>
            <span>{totalLessons} aula(s)</span>
          </div>

          <ul className="flex flex-col gap-1">
            {preview.modules.map((mod) => (
              <li key={mod.dirName} className="text-xs">
                <span className="font-medium">{mod.title}</span>
                <span className="ml-2 text-muted-foreground">
                  ({mod.lessons.length} aula(s))
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Field orientation="responsive">
        <FieldContent>
          <FieldLabel>Nível do curso</FieldLabel>
        </FieldContent>
        <Select value={level} onValueChange={(v) => setLevel(v as Level)}>
          <SelectTrigger className="min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="item-aligned">
            {LEVELS.map((l) => (
              <SelectItem key={l} value={l}>
                {l.charAt(0).toUpperCase() + l.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <DialogFooter showCloseButton>
        <Button
          type="button"
          disabled={!preview || isSyncing}
          onClick={() => syncCourse()}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FolderOpen className="h-4 w-4" />
          )}
          {isSyncing ? "Importando…" : "Importar Curso"}
        </Button>
      </DialogFooter>
    </div>
  );
}

// ─── Dialog ───────────────────────────────────────────────────────────────────

export function UploadCourseDialog() {
  const [open, setOpen] = useState(false);

  function handleOpenChange(next: boolean) {
    setOpen(next);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Upload />
          Adicionar Curso
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Course</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="manual">
          <TabsList>
            <TabsTrigger value="manual">Manual</TabsTrigger>
            <TabsTrigger value="json">Upload JSON</TabsTrigger>
            <TabsTrigger value="local">Local</TabsTrigger>
          </TabsList>

          <TabsContent value="manual">
            <ManualForm onSuccess={() => setOpen(false)} />
          </TabsContent>

          <TabsContent value="json">
            <JsonUpload onSuccess={() => setOpen(false)} />
          </TabsContent>

          <TabsContent value="local">
            <LocalImportForm onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
