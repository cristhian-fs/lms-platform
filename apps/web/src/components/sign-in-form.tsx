import { Button } from "@lms-platform/ui/components/button";
import { Input } from "@lms-platform/ui/components/input";
import { Label } from "@lms-platform/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { Link, useNavigate } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm() {
  const navigate = useNavigate({ from: "/login" });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({ to: "/dashboard" });
            toast.success("Login realizado com sucesso");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText);
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Endereço de e-mail inválido"),
        password: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="min-h-svh flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <GraduationCap className="size-5" />
          <span className="font-mono text-sm font-medium">LMS Platform</span>
        </div>

        {/* Header */}
        <div className="mb-6 border-b border-border pb-4">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Acesso
          </span>
          <h1 className="mt-1 text-xl font-medium">Bem-vindo de volta</h1>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.Field name="email">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={field.name}
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  E-mail
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  spellCheck={false}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="font-mono text-sm"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="font-mono text-[10px] text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Field name="password">
            {(field) => (
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor={field.name}
                  className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground"
                >
                  Senha
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="font-mono text-sm"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="font-mono text-[10px] text-destructive">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
          >
            {({ canSubmit, isSubmitting }) => (
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "Entrando…" : "Entrar"}
              </Button>
            )}
          </form.Subscribe>
        </form>

        {/* Footer */}
        <div className="mt-6 border-t border-border pt-4 flex items-center justify-center gap-1.5">
          <span className="font-mono text-[10px] text-muted-foreground">
            Não tem uma conta?
          </span>
          <Link
            to="/sign-up"
            className="font-mono text-[10px] text-primary underline-offset-4 hover:underline"
          >
            Cadastre-se
          </Link>
        </div>
      </div>
    </div>
  );
}
