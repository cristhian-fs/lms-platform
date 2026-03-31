import { Button } from "@lms-platform/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@lms-platform/ui/components/dropdown-menu";
import { Skeleton } from "@lms-platform/ui/components/skeleton";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

function UserAvatar({ name }: { name: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground select-none"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function UserMenu() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <Skeleton className="h-8 w-28" />;
  }

  if (!session) {
    return (
      <Link to="/login">
        <Button variant="outline" size="sm">
          Entrar
        </Button>
      </Link>
    );
  }

  const { name, email } = session.user;

  function handleSignOut() {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => navigate({ to: "/" }),
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"}>
          <UserAvatar name={name} />
          <span className="max-w-32 truncate">{name}</span>
          <ChevronDown
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-2">
          <p className="text-xs font-medium leading-none">{name}</p>
          <p className="mt-1 text-xs text-muted-foreground truncate">{email}</p>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuLabel>Navegação</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate({ to: "/dashboard" })}>
            <LayoutDashboard aria-hidden="true" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/admin" })}>
            <ShieldCheck aria-hidden="true" />
            Admin
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => navigate({ to: "/dashboard/settings" })}>
            <Settings aria-hidden="true" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <LogOut aria-hidden="true" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
