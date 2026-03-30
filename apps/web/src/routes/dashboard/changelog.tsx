import { HeaderZone } from '@/components/header-zone';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/changelog')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10">
      <HeaderZone
        title={"Changelog"}
        description={"Changelog em breve"}
      />
    </main>
  );
}
