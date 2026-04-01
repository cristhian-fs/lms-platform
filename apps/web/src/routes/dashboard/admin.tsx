import { authClient } from "@/lib/auth-client";
import { CoursesTab } from "@/features/courses/components/courses-tab";
import { UsersTab } from "@/features/users/components/users-tab";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@lms-platform/ui/components/tabs";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { List, UsersIcon } from "lucide-react";

export const Route = createFileRoute("/dashboard/admin")({
  component: AdminPage,
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data) redirect({ to: "/login", throw: true });
    if (session.data?.user.role !== "admin") {
      redirect({ to: "/dashboard", throw: true });
    }
    return { session };
  },
});

function AdminPage() {
  return (
    <div className="mx-auto lg:max-w-7xl w-full px-4 lg:px-8 py-8 lg:py-12">

      {/* Header zone */}
      <div className="relative border border-border mb-8">
        <span className="absolute top-0 left-0 size-2 border-l border-t border-foreground/20 z-10" />
        <span className="absolute top-0 right-0 size-2 border-r border-t border-foreground/20 z-10" />
        <span className="absolute bottom-0 left-0 size-2 border-l border-b border-foreground/20 z-10" />
        <span className="absolute bottom-0 right-0 size-2 border-r border-b border-foreground/20 z-10" />

        <div className="px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Sistema
          </span>
          <h1 className="mt-0.5 text-xl font-medium">Administração</h1>
        </div>

        <div className="border-t border-border px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Gerencie cursos, módulos e aulas da plataforma
          </span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="courses" className="gap-0">
        <TabsList>
          <TabsTrigger value="courses">
            <List />
            Cursos
          </TabsTrigger>
          <TabsTrigger value="users">
            <UsersIcon />
            Usuários
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-6">
          <CoursesTab />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <UsersTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
