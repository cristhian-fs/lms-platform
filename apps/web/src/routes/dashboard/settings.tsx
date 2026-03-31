import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@tanstack/react-form";
import { useRef, useState } from "react";
import { toast } from "sonner";
import z from "zod";
import { LockIcon, SaveIcon, UploadIcon, UserIcon, XIcon } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { userQueryOptions } from "@/lib/auth-utils";
import { requestForm } from "@/lib/request";
import { HeaderZone } from "@/components/header-zone";
import { Input } from "@lms-platform/ui/components/input";
import { Label } from "@lms-platform/ui/components/label";
import { Button } from "@lms-platform/ui/components/button";
import { Skeleton } from "@lms-platform/ui/components/skeleton";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 lg:px-8 py-8 lg:py-12">
      <HeaderZone title="Configurações" label="Conta" />
      <ProfileSection />
      <SecuritySection />
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative border border-border mb-6">
      <span className="absolute top-0 left-0 size-2 border-l border-t border-foreground/20 z-10" />
      <span className="absolute top-0 right-0 size-2 border-r border-t border-foreground/20 z-10" />
      <span className="absolute bottom-0 left-0 size-2 border-l border-b border-foreground/20 z-10" />
      <span className="absolute bottom-0 right-0 size-2 border-r border-b border-foreground/20 z-10" />

      <div className="border-b border-border px-4 py-3">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>

      <div className="flex flex-col gap-5 px-4 py-5">{children}</div>
    </div>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────

function ProfileSection() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery(userQueryOptions());
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Ref keeps the URL accessible inside useForm's onSubmit (avoids stale closure)
  const pendingAvatarRef = useRef<string | null>(null);
  const [pendingAvatarUrl, setPendingAvatarUrl] = useState<string | null>(null);

  const { mutate: uploadAvatar, isPending: uploading } = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error("Usuário não autenticado.");
      const ext = file.name.split(".").pop() ?? "png";
      const formData = new FormData();
      formData.set("file", file);
      formData.set("bucket", "lms-platform");
      formData.set("path", `${user.id}/${Date.now()}.${ext}`);
      const res = await requestForm<{ url: string }>("/api/upload", formData);
      return res.data.url;
    },
    onSuccess: (url) => {
      pendingAvatarRef.current = url;
      setPendingAvatarUrl(url);
      toast.success("Foto carregada!");
    },
    onError: () => toast.error("Erro ao carregar foto."),
  });

  function discardPendingAvatar() {
    pendingAvatarRef.current = null;
    setPendingAvatarUrl(null);
  }

  const form = useForm({
    defaultValues: { name: user?.name ?? "" },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
      }),
    },
    onSubmit: async ({ value }) => {
      const { error } = await authClient.updateUser({
        name: value.name,
        // Always read from ref — safe from stale closure
        ...(pendingAvatarRef.current ? { image: pendingAvatarRef.current } : {}),
      });
      if (error) {
        toast.error(error.message ?? "Erro ao salvar perfil.");
        return;
      }
      discardPendingAvatar();
      await queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Perfil atualizado!");
    },
  });

  const currentAvatar = pendingAvatarUrl ?? user?.image ?? null;

  if (isLoading) {
    return (
      <Section label="Perfil">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 shrink-0" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full" />
        </div>
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-9 w-full" />
        </div>
      </Section>
    );
  }

  return (
    <Section label="Perfil">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative size-16 shrink-0 overflow-hidden bg-muted flex items-center justify-center">
            {currentAvatar ? (
              <img src={currentAvatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="size-6 text-muted-foreground/40" />
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 5 * 1024 * 1024) {
                  toast.error("Imagem muito grande. Máximo 5MB.");
                  return;
                }
                uploadAvatar(file);
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadIcon />
              {uploading ? "Carregando…" : "Alterar foto"}
            </Button>
            {pendingAvatarUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={discardPendingAvatar}
              >
                <XIcon />
                Desfazer
              </Button>
            )}
          </div>
        </div>

        {/* Name */}
        <form.Field name="name">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Nome</Label>
              <Input
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                autoComplete="name"
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.map((err) => (
                  <p key={err?.message} className="text-xs text-destructive">
                    {err?.message}
                  </p>
                ))}
            </div>
          )}
        </form.Field>

        {/* Email — read-only */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Label>E-mail</Label>
            <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              <LockIcon className="size-3" />
              não editável
            </span>
          </div>
          <Input value={user?.email ?? ""} readOnly disabled />
        </div>

        {/* Save */}
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit || isSubmitting || uploading}>
                <SaveIcon />
                {isSubmitting ? "Salvando…" : "Salvar perfil"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </Section>
  );
}

// ─── Security section ─────────────────────────────────────────────────────────

function SecuritySection() {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onSubmit: z.object({
        currentPassword: z.string().min(1, "Obrigatório"),
        newPassword: z.string().min(8, "Mínimo 8 caracteres"),
        confirmPassword: z.string().min(1, "Obrigatório"),
      }),
    },
    onSubmit: async ({ value }) => {
      if (value.newPassword !== value.confirmPassword) {
        toast.error("As senhas não coincidem.");
        return;
      }
      const { error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
        revokeOtherSessions: false,
      });
      if (error) {
        toast.error(error.message ?? "Erro ao alterar senha.");
        return;
      }
      form.reset();
      toast.success("Senha alterada com sucesso!");
    },
  });

  return (
    <Section label="Segurança">
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        {/* Current password */}
        <form.Field name="currentPassword">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Senha atual</Label>
              <Input
                id={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.map((err) => (
                  <p key={err?.message} className="text-xs text-destructive">
                    {err?.message}
                  </p>
                ))}
            </div>
          )}
        </form.Field>

        {/* New password */}
        <form.Field name="newPassword">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Nova senha</Label>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.map((err) => (
                  <p key={err?.message} className="text-xs text-destructive">
                    {err?.message}
                  </p>
                ))}
            </div>
          )}
        </form.Field>

        {/* Confirm new password */}
        <form.Field name="confirmPassword">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>Confirmar nova senha</Label>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.isTouched &&
                field.state.meta.errors.map((err) => (
                  <p key={err?.message} className="text-xs text-destructive">
                    {err?.message}
                  </p>
                ))}
            </div>
          )}
        </form.Field>

        {/* Save */}
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <div className="flex justify-end">
              <Button type="submit" disabled={!canSubmit || isSubmitting}>
                <SaveIcon />
                {isSubmitting ? "Alterando…" : "Alterar senha"}
              </Button>
            </div>
          )}
        </form.Subscribe>
      </form>
    </Section>
  );
}
