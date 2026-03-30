import { HeaderZone } from "@/components/header-zone";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <HeaderZone
        title={"Configurações"}
        description={"Configurações em breve"}
      />
    </main>
  );
}
